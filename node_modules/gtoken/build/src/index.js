"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
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
Object.defineProperty(exports, "__esModule", { value: true });
var axios_1 = require("axios");
var fs = require("fs");
var jws = require("jws");
var mime = require("mime");
var pify = require("pify");
var querystring = require("querystring");
var readFile = pify(fs.readFile);
var GOOGLE_TOKEN_URL = 'https://www.googleapis.com/oauth2/v4/token';
var GOOGLE_REVOKE_TOKEN_URL = 'https://accounts.google.com/o/oauth2/revoke?token=';
var ErrorWithCode = /** @class */ (function (_super) {
    __extends(ErrorWithCode, _super);
    function ErrorWithCode(message, code) {
        var _this = _super.call(this, message) || this;
        _this.code = code;
        return _this;
    }
    return ErrorWithCode;
}(Error));
var getPem;
var GoogleToken = /** @class */ (function () {
    /**
     * Create a GoogleToken.
     *
     * @param options  Configuration object.
     */
    function GoogleToken(options) {
        this.token = null;
        this.expiresAt = null;
        this.rawToken = null;
        this.tokenExpires = null;
        this.configure(options);
    }
    /**
     * Returns whether the token has expired.
     *
     * @return true if the token has expired, false otherwise.
     */
    GoogleToken.prototype.hasExpired = function () {
        var now = (new Date()).getTime();
        if (this.token && this.expiresAt) {
            return now >= this.expiresAt;
        }
        else {
            return true;
        }
    };
    GoogleToken.prototype.getToken = function (callback) {
        if (callback) {
            this.getTokenAsync()
                .then(function (t) {
                callback(null, t);
            })
                .catch(callback);
            return;
        }
        return this.getTokenAsync();
    };
    /**
     * Given a keyFile, extract the key and client email if available
     * @param keyFile Path to a json, pem, or p12 file that contains the key.
     * @returns an object with privateKey and clientEmail properties
     */
    GoogleToken.prototype.getCredentials = function (keyFile) {
        return __awaiter(this, void 0, void 0, function () {
            var mimeType, _a, key, body, privateKey, clientEmail, privateKey, privateKey;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        mimeType = mime.getType(keyFile);
                        _a = mimeType;
                        switch (_a) {
                            case 'application/json': return [3 /*break*/, 1];
                            case 'application/x-x509-ca-cert': return [3 /*break*/, 3];
                            case 'application/x-pkcs12': return [3 /*break*/, 5];
                        }
                        return [3 /*break*/, 9];
                    case 1: return [4 /*yield*/, readFile(keyFile, 'utf8')];
                    case 2:
                        key = _b.sent();
                        body = JSON.parse(key);
                        privateKey = body.private_key;
                        clientEmail = body.client_email;
                        if (!privateKey || !clientEmail) {
                            throw new ErrorWithCode('private_key and client_email are required.', 'MISSING_CREDENTIALS');
                        }
                        return [2 /*return*/, { privateKey: privateKey, clientEmail: clientEmail }];
                    case 3: return [4 /*yield*/, readFile(keyFile, 'utf8')];
                    case 4:
                        privateKey = _b.sent();
                        return [2 /*return*/, { privateKey: privateKey }];
                    case 5:
                        if (!!getPem) return [3 /*break*/, 7];
                        return [4 /*yield*/, Promise.resolve().then(function () { return require('google-p12-pem'); })];
                    case 6:
                        getPem = (_b.sent()).getPem;
                        _b.label = 7;
                    case 7: return [4 /*yield*/, getPem(keyFile)];
                    case 8:
                        privateKey = _b.sent();
                        return [2 /*return*/, { privateKey: privateKey }];
                    case 9: throw new ErrorWithCode('Unknown certificate type. Type is determined based on file extension. ' +
                        'Current supported extensions are *.json, *.pem, and *.p12.', 'UNKNOWN_CERTIFICATE_TYPE');
                }
            });
        });
    };
    GoogleToken.prototype.getTokenAsync = function () {
        return __awaiter(this, void 0, void 0, function () {
            var creds;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.hasExpired()) {
                            return [2 /*return*/, Promise.resolve(this.token)];
                        }
                        if (!this.key && !this.keyFile) {
                            throw new Error('No key or keyFile set.');
                        }
                        if (!(!this.key && this.keyFile)) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.getCredentials(this.keyFile)];
                    case 1:
                        creds = _a.sent();
                        this.key = creds.privateKey;
                        this.iss = creds.clientEmail || this.iss;
                        if (!creds.clientEmail) {
                            this.ensureEmail();
                        }
                        _a.label = 2;
                    case 2: return [2 /*return*/, this.requestToken()];
                }
            });
        });
    };
    GoogleToken.prototype.ensureEmail = function () {
        if (!this.iss) {
            throw new ErrorWithCode('email is required.', 'MISSING_CREDENTIALS');
        }
    };
    GoogleToken.prototype.revokeToken = function (callback) {
        if (callback) {
            this.revokeTokenAsync().then(function () { return callback(); }).catch(callback);
            return;
        }
        return this.revokeTokenAsync();
    };
    GoogleToken.prototype.revokeTokenAsync = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                if (!this.token) {
                    throw new Error('No token to revoke.');
                }
                return [2 /*return*/, axios_1.default.get(GOOGLE_REVOKE_TOKEN_URL + this.token).then(function (r) {
                        _this.configure({
                            email: _this.iss,
                            sub: _this.sub,
                            key: _this.key,
                            keyFile: _this.keyFile,
                            scope: _this.scope,
                            additionalClaims: _this.additionalClaims,
                        });
                    })];
            });
        });
    };
    /**
     * Configure the GoogleToken for re-use.
     * @param  {object} options Configuration object.
     */
    GoogleToken.prototype.configure = function (options) {
        if (options === void 0) { options = {}; }
        this.keyFile = options.keyFile;
        this.key = options.key;
        this.token = this.expiresAt = this.rawToken = null;
        this.iss = options.email || options.iss;
        this.sub = options.sub;
        this.additionalClaims = options.additionalClaims;
        if (typeof options.scope === 'object') {
            this.scope = options.scope.join(' ');
        }
        else {
            this.scope = options.scope;
        }
    };
    /**
     * Request the token from Google.
     */
    GoogleToken.prototype.requestToken = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            var iat, additionalClaims, payload, signedJWT;
            return __generator(this, function (_a) {
                iat = Math.floor(new Date().getTime() / 1000);
                additionalClaims = this.additionalClaims || {};
                payload = Object.assign({
                    iss: this.iss,
                    scope: this.scope,
                    aud: GOOGLE_TOKEN_URL,
                    exp: iat + 3600,
                    iat: iat,
                    sub: this.sub
                }, additionalClaims);
                signedJWT = jws.sign({ header: { alg: 'RS256' }, payload: payload, secret: this.key });
                return [2 /*return*/, axios_1.default
                        .post(GOOGLE_TOKEN_URL, querystring.stringify({
                        grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
                        assertion: signedJWT
                    }), { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } })
                        .then(function (r) {
                        _this.rawToken = r.data;
                        _this.token = r.data.access_token;
                        _this.expiresAt =
                            (r.data.expires_in === null || r.data.expires_in === undefined) ?
                                null :
                                (iat + r.data.expires_in) * 1000;
                        return _this.token;
                    })
                        .catch(function (e) {
                        _this.token = null;
                        _this.tokenExpires = null;
                        var body = (e.response && e.response.data) ? e.response.data : {};
                        var err = e;
                        if (body.error) {
                            var desc = body.error_description ? ": " + body.error_description : '';
                            err = new Error("" + body.error + desc);
                        }
                        throw err;
                    })];
            });
        });
    };
    return GoogleToken;
}());
exports.GoogleToken = GoogleToken;
//# sourceMappingURL=index.js.map