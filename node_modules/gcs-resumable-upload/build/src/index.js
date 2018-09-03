"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ConfigStore = require("configstore");
var crypto = require("crypto");
var r = require("request");
var stream_1 = require("stream");
var util = require("util");
var streamEvents = require('stream-events');
var googleAuth = require('google-auto-auth');
var pumpify = require('pumpify');
var request = r.defaults({ json: true, pool: { maxSockets: Infinity } });
var BASE_URI = 'https://www.googleapis.com/upload/storage/v1/b';
var TERMINATED_UPLOAD_STATUS_CODE = 410;
var RESUMABLE_INCOMPLETE_STATUS_CODE = 308;
var RETRY_LIMIT = 5;
var wrapError = function (message, err) {
    return new Error([message, err.message].join('\n'));
};
function Upload(cfg) {
    var _this = this;
    pumpify.call(this);
    streamEvents.call(this);
    cfg = cfg || {};
    if (!cfg.bucket || !cfg.file) {
        throw new Error('A bucket and file name are required');
    }
    cfg.authConfig = cfg.authConfig || {};
    cfg.authConfig.scopes =
        ['https://www.googleapis.com/auth/devstorage.full_control'];
    this.authClient = cfg.authClient || googleAuth(cfg.authConfig);
    this.bucket = cfg.bucket;
    this.file = cfg.file;
    this.generation = cfg.generation;
    this.kmsKeyName = cfg.kmsKeyName;
    this.metadata = cfg.metadata || {};
    this.offset = cfg.offset;
    this.origin = cfg.origin;
    this.userProject = cfg.userProject;
    if (cfg.key) {
        /**
         * NOTE: This is `as string` because there appears to be some weird kind
         * of TypeScript bug as 2.8. Tracking the issue here:
         * https://github.com/Microsoft/TypeScript/issues/23155
         */
        var base64Key = Buffer.from(cfg.key).toString('base64');
        this.encryption = {
            key: base64Key,
            hash: crypto.createHash('sha256').update(cfg.key).digest('base64')
        };
    }
    this.predefinedAcl = cfg.predefinedAcl;
    if (cfg.private)
        this.predefinedAcl = 'private';
    if (cfg.public)
        this.predefinedAcl = 'publicRead';
    this.configStore = new ConfigStore('gcs-resumable-upload');
    this.uriProvidedManually = !!cfg.uri;
    this.uri = cfg.uri || this.get('uri');
    this.numBytesWritten = 0;
    this.numRetries = 0;
    var contentLength = cfg.metadata ? Number(cfg.metadata.contentLength) : NaN;
    this.contentLength = isNaN(contentLength) ? '*' : contentLength;
    this.once('writing', function () {
        if (_this.uri) {
            _this.continueUploading();
        }
        else {
            _this.createURI(function (err) {
                if (err) {
                    return _this.destroy(err);
                }
                _this.startUploading();
            });
        }
    });
}
util.inherits(Upload, pumpify);
Upload.prototype.createURI = function (callback) {
    var _this = this;
    var metadata = this.metadata;
    var reqOpts = {
        method: 'POST',
        uri: [BASE_URI, this.bucket, 'o'].join('/'),
        qs: { name: this.file, uploadType: 'resumable' },
        json: metadata,
        headers: {}
    };
    if (metadata.contentLength) {
        reqOpts.headers['X-Upload-Content-Length'] = metadata.contentLength;
    }
    if (metadata.contentType) {
        reqOpts.headers['X-Upload-Content-Type'] = metadata.contentType;
    }
    if (typeof this.generation !== 'undefined') {
        reqOpts.qs.ifGenerationMatch = this.generation;
    }
    if (this.kmsKeyName) {
        reqOpts.qs.kmsKeyName = this.kmsKeyName;
    }
    if (this.predefinedAcl) {
        reqOpts.qs.predefinedAcl = this.predefinedAcl;
    }
    if (this.origin) {
        reqOpts.headers.Origin = this.origin;
    }
    this.makeRequest(reqOpts, function (err, resp) {
        if (err) {
            return callback(err);
        }
        var uri = resp.headers.location;
        _this.uri = uri;
        _this.set({ uri: uri });
        _this.offset = 0;
        callback(null, uri);
    });
};
Upload.prototype.continueUploading = function () {
    if (typeof this.offset === 'number') {
        return this.startUploading();
    }
    this.getAndSetOffset(this.startUploading.bind(this));
};
Upload.prototype.startUploading = function () {
    var _this = this;
    var reqOpts = {
        method: 'PUT',
        uri: this.uri,
        headers: { 'Content-Range': 'bytes ' + this.offset + '-*/' + this.contentLength }
    };
    var bufferStream = this.bufferStream = new stream_1.PassThrough();
    var offsetStream = this.offsetStream =
        new stream_1.PassThrough({ transform: this.onChunk.bind(this) });
    var delayStream = new stream_1.PassThrough();
    this.getRequestStream(reqOpts, function (requestStream) {
        _this.setPipeline(bufferStream, offsetStream, requestStream, delayStream);
        // wait for "complete" from request before letting the stream finish
        delayStream.on('prefinish', function () {
            _this.cork();
        });
        requestStream.on('complete', function (resp) {
            if (resp.statusCode < 200 || resp.statusCode > 299) {
                _this.destroy(new Error('Upload failed'));
                return;
            }
            _this.emit('metadata', resp.body);
            _this.deleteConfig();
            _this.uncork();
        });
    });
};
Upload.prototype.onChunk = function (chunk, enc, next) {
    var offset = this.offset;
    var numBytesWritten = this.numBytesWritten;
    // check if this is the same content uploaded previously. this caches a slice
    // of the first chunk, then compares it with the first byte of incoming data
    if (numBytesWritten === 0) {
        var cachedFirstChunk = this.get('firstChunk');
        var firstChunk = chunk.slice(0, 16).valueOf();
        if (!cachedFirstChunk) {
            // This is a new upload. Cache the first chunk.
            this.set({ uri: this.uri, firstChunk: firstChunk });
        }
        else {
            // this continues an upload in progress. check if the bytes are the same
            cachedFirstChunk = Buffer.from(cachedFirstChunk);
            var nextChunk = Buffer.from(firstChunk);
            if (Buffer.compare(cachedFirstChunk, nextChunk) !== 0) {
                // this data is not the same. start a new upload
                this.bufferStream.unshift(chunk);
                this.bufferStream.unpipe(this.offsetStream);
                this.restart();
                return;
            }
        }
    }
    var length = chunk.length;
    if (typeof chunk === 'string')
        length = Buffer.byteLength(chunk, enc);
    if (numBytesWritten < offset)
        chunk = chunk.slice(offset - numBytesWritten);
    this.numBytesWritten += length;
    // only push data from the byte after the one we left off on
    next(null, this.numBytesWritten > offset ? chunk : undefined);
};
Upload.prototype.getAndSetOffset = function (callback) {
    var _this = this;
    this.makeRequest({
        method: 'PUT',
        uri: this.uri,
        headers: { 'Content-Length': 0, 'Content-Range': 'bytes */*' }
    }, function (err, resp) {
        if (err) {
            // we don't return a 404 to the user if they provided the resumable
            // URI. if we're just using the configstore file to tell us that this
            // file exists, and it turns out that it doesn't (the 404), that's
            // probably stale config data.
            if (resp && resp.statusCode === 404 && !_this.uriProvidedManually) {
                return _this.restart();
            }
            // this resumable upload is unrecoverable (bad data or service error).
            //  -
            //  https://github.com/stephenplusplus/gcs-resumable-upload/issues/15
            //  -
            //  https://github.com/stephenplusplus/gcs-resumable-upload/pull/16#discussion_r80363774
            if (resp && resp.statusCode === TERMINATED_UPLOAD_STATUS_CODE) {
                return _this.restart();
            }
            return _this.destroy(err);
        }
        if (resp.statusCode === RESUMABLE_INCOMPLETE_STATUS_CODE) {
            if (resp.headers.range) {
                var range = resp.headers.range;
                _this.offset = Number(range.split('-')[1]) + 1;
                callback();
                return;
            }
        }
        _this.offset = 0;
        callback();
    });
};
Upload.prototype.makeRequest = function (reqOpts, callback) {
    if (this.encryption) {
        reqOpts.headers = reqOpts.headers || {};
        reqOpts.headers['x-goog-encryption-algorithm'] = 'AES256';
        reqOpts.headers['x-goog-encryption-key'] = this.encryption.key;
        reqOpts.headers['x-goog-encryption-key-sha256'] = this.encryption.hash;
    }
    if (this.userProject) {
        reqOpts.qs = reqOpts.qs || {};
        reqOpts.qs.userProject = this.userProject;
    }
    this.authClient.authorizeRequest(reqOpts, function (err, authorizedReqOpts) {
        if (err) {
            err = wrapError('Could not authenticate request', err);
            return callback(err, null, null);
        }
        request(authorizedReqOpts, function (err, resp, body) {
            if (err) {
                return callback(err, resp, body);
            }
            if (body && body.error) {
                return callback(body.error, resp, body);
            }
            var nonSuccess = Math.floor(resp.statusCode / 100) !== 2; // 200-299 status code
            if (nonSuccess &&
                resp.statusCode !== RESUMABLE_INCOMPLETE_STATUS_CODE) {
                return callback(new Error(body), resp, body);
            }
            callback(null, resp, body);
        });
    });
};
Upload.prototype.getRequestStream = function (reqOpts, callback) {
    var _this = this;
    if (this.userProject) {
        reqOpts.qs = reqOpts.qs || {};
        reqOpts.qs.userProject = this.userProject;
    }
    this.authClient.authorizeRequest(reqOpts, function (err, authorizedReqOpts) {
        if (err) {
            return _this.destroy(wrapError('Could not authenticate request', err));
        }
        var requestStream = request(authorizedReqOpts);
        requestStream.on('error', _this.destroy.bind(_this));
        requestStream.on('response', _this.onResponse.bind(_this));
        requestStream.on('complete', function (resp) {
            var body = resp.body;
            if (body && body.error)
                _this.destroy(body.error);
        });
        // this makes the response body come back in the response (weird?)
        requestStream.callback = function () { };
        callback(requestStream);
    });
};
Upload.prototype.restart = function () {
    var _this = this;
    this.numBytesWritten = 0;
    this.deleteConfig();
    this.createURI(function (err) {
        if (err) {
            return _this.destroy(err);
        }
        _this.startUploading();
    });
};
Upload.prototype.get = function (prop) {
    var store = this.configStore.get([this.bucket, this.file].join('/'));
    return store && store[prop];
};
// tslint:disable-next-line no-any
Upload.prototype.set = function (props) {
    this.configStore.set([this.bucket, this.file].join('/'), props);
};
Upload.prototype.deleteConfig = function () {
    this.configStore.delete([this.bucket, this.file].join('/'));
};
/**
 * @return {bool} is the request good?
 */
Upload.prototype.onResponse = function (resp) {
    if (resp.statusCode === 404) {
        if (this.numRetries < RETRY_LIMIT) {
            this.numRetries++;
            this.startUploading();
        }
        else {
            this.destroy(new Error('Retry limit exceeded'));
        }
        return false;
    }
    if (resp.statusCode > 499 && resp.statusCode < 600) {
        if (this.numRetries < RETRY_LIMIT) {
            var randomMs = Math.round(Math.random() * 1000);
            var waitTime = Math.pow(2, this.numRetries) * 1000 + randomMs;
            this.numRetries++;
            setTimeout(this.continueUploading.bind(this), waitTime);
        }
        else {
            this.destroy(new Error('Retry limit exceeded'));
        }
        return false;
    }
    this.emit('response', resp);
    return true;
};
function upload(cfg) {
    // tslint:disable-next-line no-any
    return new Upload(cfg);
}
// tslint:disable-next-line no-any
upload.createURI =
    function (cfg, callback) {
        // tslint:disable-next-line no-any
        var up = new Upload(cfg);
        up.createURI(callback);
    };
module.exports = upload;
//# sourceMappingURL=index.js.map