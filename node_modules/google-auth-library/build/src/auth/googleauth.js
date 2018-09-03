"use strict";
/**
 * Copyright 2014 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var child_process_1 = require("child_process");
var crypto_1 = __importDefault(require("crypto"));
var fs = __importStar(require("fs"));
var gcpMetadata = __importStar(require("gcp-metadata"));
var os_1 = __importDefault(require("os"));
var path_1 = __importDefault(require("path"));
var util_1 = __importDefault(require("util"));
var transporters_1 = require("../transporters");
var computeclient_1 = require("./computeclient");
var envDetect_1 = require("./envDetect");
var jwtclient_1 = require("./jwtclient");
var refreshclient_1 = require("./refreshclient");
var GoogleAuth = /** @class */ (function () {
    function GoogleAuth(opts) {
        // This shim is in place for compatibility with google-auto-auth.
        this.getProjectId = this.getDefaultProjectId;
        /**
         * Caches a value indicating whether the auth layer is running on Google
         * Compute Engine.
         * @private
         */
        this.checkIsGCE = undefined;
        // To save the contents of the JSON credential file
        this.jsonContent = null;
        this.cachedCredential = null;
        opts = opts || {};
        this._cachedProjectId = opts.projectId || null;
        this.keyFilename = opts.keyFilename || opts.keyFile;
        this.scopes = opts.scopes;
        this.jsonContent = opts.credentials || null;
    }
    Object.defineProperty(GoogleAuth.prototype, "isGCE", {
        // Note:  this properly is only public to satisify unit tests.
        // https://github.com/Microsoft/TypeScript/issues/5228
        get: function () {
            return this.checkIsGCE;
        },
        enumerable: true,
        configurable: true
    });
    GoogleAuth.prototype.getDefaultProjectId = function (callback) {
        if (callback) {
            this.getDefaultProjectIdAsync()
                .then(function (r) { return callback(null, r); })
                .catch(callback);
        }
        else {
            return this.getDefaultProjectIdAsync();
        }
    };
    GoogleAuth.prototype.getDefaultProjectIdAsync = function () {
        var _this = this;
        if (this._cachedProjectId) {
            return Promise.resolve(this._cachedProjectId);
        }
        // In implicit case, supports three environments. In order of precedence,
        // the implicit environments are:
        // - GCLOUD_PROJECT or GOOGLE_CLOUD_PROJECT environment variable
        // - GOOGLE_APPLICATION_CREDENTIALS JSON file
        // - Cloud SDK: `gcloud config config-helper --format json`
        // - GCE project ID from metadata server)
        if (!this._getDefaultProjectIdPromise) {
            this._getDefaultProjectIdPromise =
                new Promise(function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
                    var projectId, _a, _b, _c, e_1;
                    return __generator(this, function (_d) {
                        switch (_d.label) {
                            case 0:
                                _d.trys.push([0, 7, , 8]);
                                _c = this.getProductionProjectId();
                                if (_c) return [3 /*break*/, 2];
                                return [4 /*yield*/, this.getFileProjectId()];
                            case 1:
                                _c = (_d.sent());
                                _d.label = 2;
                            case 2:
                                _b = _c;
                                if (_b) return [3 /*break*/, 4];
                                return [4 /*yield*/, this.getDefaultServiceProjectId()];
                            case 3:
                                _b = (_d.sent());
                                _d.label = 4;
                            case 4:
                                _a = _b;
                                if (_a) return [3 /*break*/, 6];
                                return [4 /*yield*/, this.getGCEProjectId()];
                            case 5:
                                _a = (_d.sent());
                                _d.label = 6;
                            case 6:
                                projectId = _a;
                                this._cachedProjectId = projectId;
                                resolve(projectId);
                                return [3 /*break*/, 8];
                            case 7:
                                e_1 = _d.sent();
                                reject(e_1);
                                return [3 /*break*/, 8];
                            case 8: return [2 /*return*/];
                        }
                    });
                }); });
        }
        return this._getDefaultProjectIdPromise;
    };
    GoogleAuth.prototype.getApplicationDefault = function (optionsOrCallback, callback) {
        if (optionsOrCallback === void 0) { optionsOrCallback = {}; }
        var options;
        if (typeof optionsOrCallback === 'function') {
            callback = optionsOrCallback;
        }
        else {
            options = optionsOrCallback;
        }
        if (callback) {
            this.getApplicationDefaultAsync(options)
                .then(function (r) { return callback(null, r.credential, r.projectId); })
                .catch(callback);
        }
        else {
            return this.getApplicationDefaultAsync(options);
        }
    };
    GoogleAuth.prototype.getApplicationDefaultAsync = function (options) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, credential, projectId, gce, e_2;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!this.cachedCredential) return [3 /*break*/, 2];
                        _a = {
                            credential: this.cachedCredential
                        };
                        return [4 /*yield*/, this.getDefaultProjectIdAsync()];
                    case 1: return [2 /*return*/, (_a.projectId = _b.sent(),
                            _a)];
                    case 2: return [4 /*yield*/, this._tryGetApplicationCredentialsFromEnvironmentVariable(options)];
                    case 3:
                        // Check for the existence of a local environment variable pointing to the
                        // location of the credential file. This is typically used in local
                        // developer scenarios.
                        credential =
                            _b.sent();
                        if (!credential) return [3 /*break*/, 5];
                        if (credential instanceof jwtclient_1.JWT) {
                            credential.scopes = this.scopes;
                        }
                        this.cachedCredential = credential;
                        return [4 /*yield*/, this.getDefaultProjectId()];
                    case 4:
                        projectId = _b.sent();
                        return [2 /*return*/, { credential: credential, projectId: projectId }];
                    case 5: return [4 /*yield*/, this._tryGetApplicationCredentialsFromWellKnownFile(options)];
                    case 6:
                        // Look in the well-known credential file location.
                        credential =
                            _b.sent();
                        if (!credential) return [3 /*break*/, 8];
                        if (credential instanceof jwtclient_1.JWT) {
                            credential.scopes = this.scopes;
                        }
                        this.cachedCredential = credential;
                        return [4 /*yield*/, this.getDefaultProjectId()];
                    case 7:
                        projectId = _b.sent();
                        return [2 /*return*/, { credential: credential, projectId: projectId }];
                    case 8:
                        _b.trys.push([8, 13, , 14]);
                        return [4 /*yield*/, this._checkIsGCE()];
                    case 9:
                        gce = _b.sent();
                        if (!gce) return [3 /*break*/, 11];
                        // For GCE, just return a default ComputeClient. It will take care of
                        // the rest.
                        this.cachedCredential = new computeclient_1.Compute(options);
                        return [4 /*yield*/, this.getDefaultProjectId()];
                    case 10:
                        projectId = _b.sent();
                        return [2 /*return*/, { projectId: projectId, credential: this.cachedCredential }];
                    case 11: 
                    // We failed to find the default credentials. Bail out with an error.
                    throw new Error('Could not load the default credentials. Browse to https://developers.google.com/accounts/docs/application-default-credentials for more information.');
                    case 12: return [3 /*break*/, 14];
                    case 13:
                        e_2 = _b.sent();
                        throw new Error('Unexpected error while acquiring application default credentials: ' +
                            e_2.message);
                    case 14: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Determines whether the auth layer is running on Google Compute Engine.
     * @returns A promise that resolves with the boolean.
     * @api private
     */
    GoogleAuth.prototype._checkIsGCE = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!(this.checkIsGCE === undefined)) return [3 /*break*/, 2];
                        _a = this;
                        return [4 /*yield*/, gcpMetadata.isAvailable()];
                    case 1:
                        _a.checkIsGCE = _b.sent();
                        _b.label = 2;
                    case 2: return [2 /*return*/, this.checkIsGCE];
                }
            });
        });
    };
    /**
     * Attempts to load default credentials from the environment variable path..
     * @returns Promise that resolves with the OAuth2Client or null.
     * @api private
     */
    GoogleAuth.prototype._tryGetApplicationCredentialsFromEnvironmentVariable = function (options) {
        return __awaiter(this, void 0, void 0, function () {
            var credentialsPath;
            return __generator(this, function (_a) {
                credentialsPath = process.env['GOOGLE_APPLICATION_CREDENTIALS'];
                if (!credentialsPath || credentialsPath.length === 0) {
                    return [2 /*return*/, null];
                }
                try {
                    return [2 /*return*/, this._getApplicationCredentialsFromFilePath(credentialsPath, options)];
                }
                catch (e) {
                    throw this.createError('Unable to read the credential file specified by the GOOGLE_APPLICATION_CREDENTIALS environment variable.', e);
                }
                return [2 /*return*/];
            });
        });
    };
    /**
     * Attempts to load default credentials from a well-known file location
     * @return Promise that resolves with the OAuth2Client or null.
     * @api private
     */
    GoogleAuth.prototype._tryGetApplicationCredentialsFromWellKnownFile = function (options) {
        return __awaiter(this, void 0, void 0, function () {
            var location, home;
            return __generator(this, function (_a) {
                location = null;
                if (this._isWindows()) {
                    // Windows
                    location = process.env['APPDATA'];
                }
                else {
                    home = process.env['HOME'];
                    if (home) {
                        location = this._pathJoin(home, '.config');
                    }
                }
                // If we found the root path, expand it.
                if (location) {
                    location = this._pathJoin(location, 'gcloud');
                    location =
                        this._pathJoin(location, 'application_default_credentials.json');
                    location = this._mockWellKnownFilePath(location);
                    // Check whether the file exists.
                    if (!this._fileExists(location)) {
                        location = null;
                    }
                }
                // The file does not exist.
                if (!location) {
                    return [2 /*return*/, null];
                }
                // The file seems to exist. Try to use it.
                return [2 /*return*/, this._getApplicationCredentialsFromFilePath(location, options)];
            });
        });
    };
    /**
     * Attempts to load default credentials from a file at the given path..
     * @param filePath The path to the file to read.
     * @returns Promise that resolves with the OAuth2Client
     * @api private
     */
    GoogleAuth.prototype._getApplicationCredentialsFromFilePath = function (filePath, options) {
        if (options === void 0) { options = {}; }
        return __awaiter(this, void 0, void 0, function () {
            var readStream;
            return __generator(this, function (_a) {
                // Make sure the path looks like a string.
                if (!filePath || filePath.length === 0) {
                    throw new Error('The file path is invalid.');
                }
                // Make sure there is a file at the path. lstatSync will throw if there is
                // nothing there.
                try {
                    // Resolve path to actual file in case of symlink. Expect a thrown error
                    // if not resolvable.
                    filePath = fs.realpathSync(filePath);
                    if (!fs.lstatSync(filePath).isFile()) {
                        throw new Error();
                    }
                }
                catch (err) {
                    throw this.createError(util_1.default.format('The file at %s does not exist, or it is not a file.', filePath), err);
                }
                // Now open a read stream on the file, and parse it.
                try {
                    readStream = this._createReadStream(filePath);
                    return [2 /*return*/, this.fromStream(readStream, options)];
                }
                catch (err) {
                    throw this.createError(util_1.default.format('Unable to read the file at %s.', filePath), err);
                }
                return [2 /*return*/];
            });
        });
    };
    /**
     * Create a credentials instance using the given input options.
     * @param json The input object.
     * @returns JWT or UserRefresh Client with data
     */
    GoogleAuth.prototype.fromJSON = function (json, options) {
        var client;
        if (!json) {
            throw new Error('Must pass in a JSON object containing the Google auth settings.');
        }
        this.jsonContent = json;
        options = options || {};
        if (json.type === 'authorized_user') {
            client = new refreshclient_1.UserRefreshClient(options);
        }
        else {
            options.scopes = this.scopes;
            client = new jwtclient_1.JWT(options);
        }
        client.fromJSON(json);
        return client;
    };
    GoogleAuth.prototype.fromStream = function (inputStream, optionsOrCallback, callback) {
        if (optionsOrCallback === void 0) { optionsOrCallback = {}; }
        var options = {};
        if (typeof optionsOrCallback === 'function') {
            callback = optionsOrCallback;
        }
        else {
            options = optionsOrCallback;
        }
        if (callback) {
            this.fromStreamAsync(inputStream, options)
                .then(function (r) { return callback(null, r); })
                .catch(callback);
        }
        else {
            return this.fromStreamAsync(inputStream, options);
        }
    };
    GoogleAuth.prototype.fromStreamAsync = function (inputStream, options) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            if (!inputStream) {
                throw new Error('Must pass in a stream containing the Google auth settings.');
            }
            var s = '';
            inputStream.setEncoding('utf8');
            inputStream.on('data', function (chunk) {
                s += chunk;
            });
            inputStream.on('end', function () {
                try {
                    var data = JSON.parse(s);
                    var r = _this.fromJSON(data, options);
                    return resolve(r);
                }
                catch (err) {
                    return reject(err);
                }
            });
        });
    };
    /**
     * Create a credentials instance using the given API key string.
     * @param apiKey The API key string
     * @param options An optional options object.
     * @returns A JWT loaded from the key
     */
    GoogleAuth.prototype.fromAPIKey = function (apiKey, options) {
        options = options || {};
        var client = new jwtclient_1.JWT(options);
        client.fromAPIKey(apiKey);
        return client;
    };
    /**
     * Determines whether the current operating system is Windows.
     * @api private
     */
    GoogleAuth.prototype._isWindows = function () {
        var sys = this._osPlatform();
        if (sys && sys.length >= 3) {
            if (sys.substring(0, 3).toLowerCase() === 'win') {
                return true;
            }
        }
        return false;
    };
    /**
     * Creates a file stream. Allows mocking.
     * @api private
     */
    GoogleAuth.prototype._createReadStream = function (filePath) {
        return fs.createReadStream(filePath);
    };
    /**
     * Gets the current operating system platform. Allows mocking.
     * @api private
     */
    GoogleAuth.prototype._osPlatform = function () {
        return os_1.default.platform();
    };
    /**
     * Determines whether a file exists. Allows mocking.
     * @api private
     */
    GoogleAuth.prototype._fileExists = function (filePath) {
        return fs.existsSync(filePath);
    };
    /**
     * Joins two parts of a path. Allows mocking.
     * @api private
     */
    GoogleAuth.prototype._pathJoin = function (item1, item2) {
        return path_1.default.join(item1, item2);
    };
    /**
     * Allows mocking of the path to a well-known file.
     * @api private
     */
    GoogleAuth.prototype._mockWellKnownFilePath = function (filePath) {
        return filePath;
    };
    // Creates an Error containing the given message, and includes the message
    // from the optional err passed in.
    GoogleAuth.prototype.createError = function (message, err) {
        var s = message || '';
        if (err) {
            var errorMessage = String(err);
            if (errorMessage && errorMessage.length > 0) {
                if (s.length > 0) {
                    s += ' ';
                }
                s += errorMessage;
            }
        }
        return Error(s);
    };
    /**
     * Run the Google Cloud SDK command that prints the default project ID
     */
    GoogleAuth.prototype.getDefaultServiceProjectId = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (resolve) {
                        child_process_1.exec('gcloud config config-helper --format json', function (err, stdout, stderr) {
                            if (!err && stdout) {
                                try {
                                    var projectId = JSON.parse(stdout).configuration.properties.core.project;
                                    resolve(projectId);
                                    return;
                                }
                                catch (e) {
                                    // ignore errors
                                }
                            }
                            resolve(null);
                        });
                    })];
            });
        });
    };
    /**
     * Loads the project id from environment variables.
     * @api private
     */
    GoogleAuth.prototype.getProductionProjectId = function () {
        return process.env['GCLOUD_PROJECT'] || process.env['GOOGLE_CLOUD_PROJECT'];
    };
    /**
     * Loads the project id from the GOOGLE_APPLICATION_CREDENTIALS json file.
     * @api private
     */
    GoogleAuth.prototype.getFileProjectId = function () {
        return __awaiter(this, void 0, void 0, function () {
            var r;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (this.cachedCredential) {
                            // Try to read the project ID from the cached credentials file
                            return [2 /*return*/, this.cachedCredential.projectId];
                        }
                        return [4 /*yield*/, this._tryGetApplicationCredentialsFromEnvironmentVariable()];
                    case 1:
                        r = _a.sent();
                        if (r) {
                            return [2 /*return*/, r.projectId];
                        }
                        else {
                            return [2 /*return*/, null];
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Gets the Compute Engine project ID if it can be inferred.
     */
    GoogleAuth.prototype.getGCEProjectId = function () {
        return __awaiter(this, void 0, void 0, function () {
            var r, e_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, gcpMetadata.project('project-id')];
                    case 1:
                        r = _a.sent();
                        return [2 /*return*/, r.data];
                    case 2:
                        e_3 = _a.sent();
                        // Ignore any errors
                        return [2 /*return*/, null];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    GoogleAuth.prototype.getCredentials = function (callback) {
        if (callback) {
            this.getCredentialsAsync().then(function (r) { return callback(null, r); }).catch(callback);
        }
        else {
            return this.getCredentialsAsync();
        }
    };
    GoogleAuth.prototype.getCredentialsAsync = function () {
        return __awaiter(this, void 0, void 0, function () {
            var credential, isGCE, data;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (this.jsonContent) {
                            credential = {
                                client_email: this.jsonContent.client_email,
                                private_key: this.jsonContent.private_key
                            };
                            return [2 /*return*/, credential];
                        }
                        return [4 /*yield*/, this._checkIsGCE()];
                    case 1:
                        isGCE = _a.sent();
                        if (!isGCE) {
                            throw new Error('Unknown error.');
                        }
                        return [4 /*yield*/, gcpMetadata.instance({ property: 'service-accounts/', params: { recursive: true } })];
                    case 2:
                        data = (_a.sent()).data;
                        if (!data || !data.default || !data.default.email) {
                            throw new Error('Failure from metadata server.');
                        }
                        return [2 /*return*/, { client_email: data.default.email }];
                }
            });
        });
    };
    /**
     * Automatically obtain a client based on the provided configuration.  If no
     * options were passed, use Application Default Credentials.
     */
    GoogleAuth.prototype.getClient = function (options) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, filePath, stream_1, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        if (options) {
                            this.keyFilename =
                                options.keyFilename || options.keyFile || this.keyFilename;
                            this.scopes = options.scopes || this.scopes;
                            this.jsonContent = options.credentials || this.jsonContent;
                        }
                        if (!!this.cachedCredential) return [3 /*break*/, 6];
                        if (!this.jsonContent) return [3 /*break*/, 2];
                        _a = this;
                        return [4 /*yield*/, this.fromJSON(this.jsonContent)];
                    case 1:
                        _a.cachedCredential = _c.sent();
                        return [3 /*break*/, 6];
                    case 2:
                        if (!this.keyFilename) return [3 /*break*/, 4];
                        filePath = path_1.default.resolve(this.keyFilename);
                        stream_1 = fs.createReadStream(filePath);
                        _b = this;
                        return [4 /*yield*/, this.fromStreamAsync(stream_1)];
                    case 3:
                        _b.cachedCredential = _c.sent();
                        return [3 /*break*/, 6];
                    case 4: return [4 /*yield*/, this.getApplicationDefaultAsync()];
                    case 5:
                        _c.sent();
                        _c.label = 6;
                    case 6: return [2 /*return*/, this.cachedCredential];
                }
            });
        });
    };
    /**
     * Automatically obtain application default credentials, and return
     * an access token for making requests.
     */
    GoogleAuth.prototype.getAccessToken = function () {
        return __awaiter(this, void 0, void 0, function () {
            var client;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getClient()];
                    case 1:
                        client = _a.sent();
                        return [4 /*yield*/, client.getAccessToken()];
                    case 2: return [2 /*return*/, (_a.sent()).token];
                }
            });
        });
    };
    /**
     * Obtain the HTTP headers that will provide authorization for a given
     * request.
     */
    GoogleAuth.prototype.getRequestHeaders = function (url) {
        return __awaiter(this, void 0, void 0, function () {
            var client;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getClient()];
                    case 1:
                        client = _a.sent();
                        return [4 /*yield*/, client.getRequestMetadata(url)];
                    case 2: return [2 /*return*/, (_a.sent()).headers];
                }
            });
        });
    };
    /**
     * Obtain credentials for a request, then attach the appropriate headers to
     * the request options.
     * @param opts Axios or Request options on which to attach the headers
     */
    GoogleAuth.prototype.authorizeRequest = function (opts) {
        return __awaiter(this, void 0, void 0, function () {
            var url, client, headers;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        opts = opts || {};
                        url = opts.url || opts.uri;
                        return [4 /*yield*/, this.getClient()];
                    case 1:
                        client = _a.sent();
                        return [4 /*yield*/, client.getRequestMetadata(url)];
                    case 2:
                        headers = (_a.sent()).headers;
                        opts.headers = Object.assign(opts.headers || {}, headers);
                        return [2 /*return*/, opts];
                }
            });
        });
    };
    /**
     * Automatically obtain application default credentials, and make an
     * HTTP request using the given options.
     * @param opts Axios request options for the HTTP request.
     */
    // tslint:disable-next-line no-any
    GoogleAuth.prototype.request = function (opts) {
        return __awaiter(this, void 0, void 0, function () {
            var client;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getClient()];
                    case 1:
                        client = _a.sent();
                        return [2 /*return*/, client.request(opts)];
                }
            });
        });
    };
    /**
     * Determine the compute environment in which the code is running.
     */
    GoogleAuth.prototype.getEnv = function () {
        return envDetect_1.getEnv();
    };
    /**
     * Sign the given data with the current private key, or go out
     * to the IAM API to sign it.
     * @param data The data to be signed.
     */
    GoogleAuth.prototype.sign = function (data) {
        return __awaiter(this, void 0, void 0, function () {
            var client, sign, projectId, creds, id, res;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getClient()];
                    case 1:
                        client = _a.sent();
                        if (client instanceof jwtclient_1.JWT && client.key) {
                            sign = crypto_1.default.createSign('RSA-SHA256');
                            sign.update(data);
                            return [2 /*return*/, sign.sign(client.key, 'base64')];
                        }
                        return [4 /*yield*/, this.getProjectId()];
                    case 2:
                        projectId = _a.sent();
                        if (!projectId) {
                            throw new Error('Cannot sign data without a project ID.');
                        }
                        return [4 /*yield*/, this.getCredentials()];
                    case 3:
                        creds = _a.sent();
                        if (!creds.client_email) {
                            throw new Error('Cannot sign data without `client_email`.');
                        }
                        id = "projects/" + projectId + "/serviceAccounts/" + creds.client_email;
                        return [4 /*yield*/, this.request({
                                method: 'POST',
                                url: "https://iam.googleapis.com/v1/" + id + ":signBlob",
                                data: { bytesToSign: Buffer.from(data).toString('base64') }
                            })];
                    case 4:
                        res = _a.sent();
                        return [2 /*return*/, res.data.signature];
                }
            });
        });
    };
    /**
     * Export DefaultTransporter as a static property of the class.
     */
    GoogleAuth.DefaultTransporter = transporters_1.DefaultTransporter;
    return GoogleAuth;
}());
exports.GoogleAuth = GoogleAuth;
//# sourceMappingURL=googleauth.js.map