"use strict";
/**
 * Copyright 2012 Google Inc. All Rights Reserved.
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
var crypto_1 = __importDefault(require("crypto"));
var querystring_1 = __importDefault(require("querystring"));
var stream = __importStar(require("stream"));
var pemverifier_1 = require("./../pemverifier");
var authclient_1 = require("./authclient");
var loginticket_1 = require("./loginticket");
var CodeChallengeMethod;
(function (CodeChallengeMethod) {
    CodeChallengeMethod["Plain"] = "plain";
    CodeChallengeMethod["S256"] = "S256";
})(CodeChallengeMethod = exports.CodeChallengeMethod || (exports.CodeChallengeMethod = {}));
var OAuth2Client = /** @class */ (function (_super) {
    __extends(OAuth2Client, _super);
    function OAuth2Client(optionsOrClientId, clientSecret, redirectUri, authClientOpts) {
        if (authClientOpts === void 0) { authClientOpts = {}; }
        var _this = _super.call(this) || this;
        _this.certificateCache = null;
        _this.certificateExpiry = null;
        _this.refreshTokenPromises = new Map();
        var opts = (optionsOrClientId && typeof optionsOrClientId === 'object') ?
            optionsOrClientId :
            {
                clientId: optionsOrClientId,
                clientSecret: clientSecret,
                redirectUri: redirectUri,
                tokenUrl: authClientOpts.tokenUrl,
                authBaseUrl: authClientOpts.authBaseUrl
            };
        _this._clientId = opts.clientId;
        _this._clientSecret = opts.clientSecret;
        _this.redirectUri = opts.redirectUri;
        _this.authBaseUrl = opts.authBaseUrl;
        _this.tokenUrl = opts.tokenUrl;
        _this.eagerRefreshThresholdMillis =
            opts.eagerRefreshThresholdMillis || 5 * 60 * 1000;
        return _this;
    }
    /**
     * Generates URL for consent page landing.
     * @param opts Options.
     * @return URL to consent page.
     */
    OAuth2Client.prototype.generateAuthUrl = function (opts) {
        if (opts === void 0) { opts = {}; }
        if (opts.code_challenge_method && !opts.code_challenge) {
            throw new Error('If a code_challenge_method is provided, code_challenge must be included.');
        }
        opts.response_type = opts.response_type || 'code';
        opts.client_id = opts.client_id || this._clientId;
        opts.redirect_uri = opts.redirect_uri || this.redirectUri;
        // Allow scopes to be passed either as array or a string
        if (opts.scope instanceof Array) {
            opts.scope = opts.scope.join(' ');
        }
        var rootUrl = this.authBaseUrl || OAuth2Client.GOOGLE_OAUTH2_AUTH_BASE_URL_;
        return rootUrl + '?' + querystring_1.default.stringify(opts);
    };
    /**
     * Convenience method to automatically generate a code_verifier, and it's
     * resulting SHA256. If used, this must be paired with a S256
     * code_challenge_method.
     */
    OAuth2Client.prototype.generateCodeVerifier = function () {
        // base64 encoding uses 6 bits per character, and we want to generate128
        // characters. 6*128/8 = 96.
        var randomString = crypto_1.default.randomBytes(96).toString('base64');
        // The valid characters in the code_verifier are [A-Z]/[a-z]/[0-9]/
        // "-"/"."/"_"/"~". Base64 encoded strings are pretty close, so we're just
        // swapping out a few chars.
        var codeVerifier = randomString.replace(/\+/g, '~').replace(/=/g, '_').replace(/\//g, '-');
        // Generate the base64 encoded SHA256
        var unencodedCodeChallenge = crypto_1.default.createHash('sha256').update(codeVerifier).digest('base64');
        // We need to use base64UrlEncoding instead of standard base64
        var codeChallenge = unencodedCodeChallenge.split('=')[0]
            .replace(/\+/g, '-')
            .replace(/\//g, '_');
        return { codeVerifier: codeVerifier, codeChallenge: codeChallenge };
    };
    OAuth2Client.prototype.getToken = function (codeOrOptions, callback) {
        var options = (typeof codeOrOptions === 'string') ?
            { code: codeOrOptions } :
            codeOrOptions;
        if (callback) {
            this.getTokenAsync(options)
                .then(function (r) { return callback(null, r.tokens, r.res); })
                .catch(function (e) { return callback(e, null, e.response); });
        }
        else {
            return this.getTokenAsync(options);
        }
    };
    OAuth2Client.prototype.getTokenAsync = function (options) {
        return __awaiter(this, void 0, void 0, function () {
            var url, values, res, tokens;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        url = this.tokenUrl || OAuth2Client.GOOGLE_OAUTH2_TOKEN_URL_;
                        values = {
                            code: options.code,
                            client_id: options.client_id || this._clientId,
                            client_secret: this._clientSecret,
                            redirect_uri: options.redirect_uri || this.redirectUri,
                            grant_type: 'authorization_code',
                            code_verifier: options.codeVerifier
                        };
                        return [4 /*yield*/, this.transporter.request({
                                method: 'POST',
                                url: url,
                                data: querystring_1.default.stringify(values),
                                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
                            })];
                    case 1:
                        res = _a.sent();
                        tokens = res.data;
                        if (res.data && res.data.expires_in) {
                            tokens.expiry_date =
                                ((new Date()).getTime() + (res.data.expires_in * 1000));
                            delete tokens.expires_in;
                        }
                        this.emit('tokens', tokens);
                        return [2 /*return*/, { tokens: tokens, res: res }];
                }
            });
        });
    };
    /**
     * Refreshes the access token.
     * @param refresh_token Existing refresh token.
     * @private
     */
    OAuth2Client.prototype.refreshToken = function (refreshToken) {
        return __awaiter(this, void 0, void 0, function () {
            var p;
            var _this = this;
            return __generator(this, function (_a) {
                if (!refreshToken) {
                    return [2 /*return*/, this.refreshTokenNoCache(refreshToken)];
                }
                // If a request to refresh using the same token has started,
                // return the same promise.
                if (this.refreshTokenPromises.has(refreshToken)) {
                    return [2 /*return*/, this.refreshTokenPromises.get(refreshToken)];
                }
                p = this.refreshTokenNoCache(refreshToken)
                    .then(function (r) {
                    _this.refreshTokenPromises.delete(refreshToken);
                    return r;
                })
                    .catch(function (e) {
                    _this.refreshTokenPromises.delete(refreshToken);
                    throw e;
                });
                this.refreshTokenPromises.set(refreshToken, p);
                return [2 /*return*/, p];
            });
        });
    };
    OAuth2Client.prototype.refreshTokenNoCache = function (refreshToken) {
        return __awaiter(this, void 0, void 0, function () {
            var url, data, res, tokens;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        url = this.tokenUrl || OAuth2Client.GOOGLE_OAUTH2_TOKEN_URL_;
                        data = {
                            refresh_token: refreshToken,
                            client_id: this._clientId,
                            client_secret: this._clientSecret,
                            grant_type: 'refresh_token'
                        };
                        return [4 /*yield*/, this.transporter.request({
                                method: 'POST',
                                url: url,
                                data: querystring_1.default.stringify(data),
                                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
                            })];
                    case 1:
                        res = _a.sent();
                        tokens = res.data;
                        // TODO: de-duplicate this code from a few spots
                        if (res.data && res.data.expires_in) {
                            tokens.expiry_date =
                                ((new Date()).getTime() + (res.data.expires_in * 1000));
                            delete tokens.expires_in;
                        }
                        this.emit('tokens', tokens);
                        return [2 /*return*/, { tokens: tokens, res: res }];
                }
            });
        });
    };
    OAuth2Client.prototype.refreshAccessToken = function (callback) {
        if (callback) {
            this.refreshAccessTokenAsync()
                .then(function (r) { return callback(null, r.credentials, r.res); })
                .catch(callback);
        }
        else {
            return this.refreshAccessTokenAsync();
        }
    };
    OAuth2Client.prototype.refreshAccessTokenAsync = function () {
        return __awaiter(this, void 0, void 0, function () {
            var r, tokens;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.credentials.refresh_token) {
                            throw new Error('No refresh token is set.');
                        }
                        return [4 /*yield*/, this.refreshToken(this.credentials.refresh_token)];
                    case 1:
                        r = _a.sent();
                        tokens = r.tokens;
                        tokens.refresh_token = this.credentials.refresh_token;
                        this.credentials = tokens;
                        return [2 /*return*/, { credentials: this.credentials, res: r.res }];
                }
            });
        });
    };
    OAuth2Client.prototype.getAccessToken = function (callback) {
        if (callback) {
            this.getAccessTokenAsync()
                .then(function (r) { return callback(null, r.token, r.res); })
                .catch(callback);
        }
        else {
            return this.getAccessTokenAsync();
        }
    };
    OAuth2Client.prototype.getAccessTokenAsync = function () {
        return __awaiter(this, void 0, void 0, function () {
            var shouldRefresh, r;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        shouldRefresh = !this.credentials.access_token || this.isTokenExpiring();
                        if (!(shouldRefresh && this.credentials.refresh_token)) return [3 /*break*/, 2];
                        if (!this.credentials.refresh_token) {
                            throw new Error('No refresh token is set.');
                        }
                        return [4 /*yield*/, this.refreshAccessToken()];
                    case 1:
                        r = _a.sent();
                        if (!r.credentials || (r.credentials && !r.credentials.access_token)) {
                            throw new Error('Could not refresh access token.');
                        }
                        return [2 /*return*/, { token: r.credentials.access_token, res: r.res }];
                    case 2: return [2 /*return*/, { token: this.credentials.access_token }];
                }
            });
        });
    };
    OAuth2Client.prototype.getRequestMetadata = function (url, callback) {
        if (callback) {
            this.getRequestMetadataAsync(url)
                .then(function (r) { return callback(null, r.headers, r.res); })
                .catch(callback);
        }
        else {
            return this.getRequestMetadataAsync(url);
        }
    };
    OAuth2Client.prototype.getRequestMetadataAsync = function (url) {
        return __awaiter(this, void 0, void 0, function () {
            var thisCreds, headers_1, r, tokens, err_1, e, credentials, headers;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        thisCreds = this.credentials;
                        if (!thisCreds.access_token && !thisCreds.refresh_token && !this.apiKey) {
                            throw new Error('No access, refresh token or API key is set.');
                        }
                        if (thisCreds.access_token && !this.isTokenExpiring()) {
                            thisCreds.token_type = thisCreds.token_type || 'Bearer';
                            headers_1 = {
                                Authorization: thisCreds.token_type + ' ' + thisCreds.access_token
                            };
                            return [2 /*return*/, { headers: headers_1 }];
                        }
                        if (this.apiKey) {
                            return [2 /*return*/, { headers: {} }];
                        }
                        r = null;
                        tokens = null;
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.refreshToken(thisCreds.refresh_token)];
                    case 2:
                        r = _a.sent();
                        tokens = r.tokens;
                        return [3 /*break*/, 4];
                    case 3:
                        err_1 = _a.sent();
                        e = err_1;
                        if (e.response &&
                            (e.response.status === 403 || e.response.status === 404)) {
                            e.message = 'Could not refresh access token.';
                        }
                        throw e;
                    case 4:
                        credentials = this.credentials;
                        credentials.token_type = credentials.token_type || 'Bearer';
                        tokens.refresh_token = credentials.refresh_token;
                        this.credentials = tokens;
                        headers = {
                            Authorization: credentials.token_type + ' ' + tokens.access_token
                        };
                        return [2 /*return*/, { headers: headers, res: r.res }];
                }
            });
        });
    };
    OAuth2Client.prototype.revokeToken = function (token, callback) {
        var opts = {
            url: OAuth2Client.GOOGLE_OAUTH2_REVOKE_URL_ + '?' +
                querystring_1.default.stringify({ token: token })
        };
        if (callback) {
            this.transporter.request(opts)
                .then(function (res) {
                callback(null, res);
            })
                .catch(callback);
        }
        else {
            return this.transporter.request(opts);
        }
    };
    OAuth2Client.prototype.revokeCredentials = function (callback) {
        if (callback) {
            this.revokeCredentialsAsync()
                .then(function (res) { return callback(null, res); })
                .catch(callback);
        }
        else {
            return this.revokeCredentialsAsync();
        }
    };
    OAuth2Client.prototype.revokeCredentialsAsync = function () {
        return __awaiter(this, void 0, void 0, function () {
            var token;
            return __generator(this, function (_a) {
                token = this.credentials.access_token;
                this.credentials = {};
                if (token) {
                    return [2 /*return*/, this.revokeToken(token)];
                }
                else {
                    throw new Error('No access token to revoke.');
                }
                return [2 /*return*/];
            });
        });
    };
    OAuth2Client.prototype.request = function (opts, callback) {
        if (callback) {
            this.requestAsync(opts).then(function (r) { return callback(null, r); }).catch(function (e) {
                var err = e;
                var body = err.response ? err.response.data : null;
                return callback(e, err.response);
            });
        }
        else {
            return this.requestAsync(opts);
        }
    };
    OAuth2Client.prototype.requestAsync = function (opts, retry) {
        if (retry === void 0) { retry = false; }
        return __awaiter(this, void 0, void 0, function () {
            var r2, r, e_1, res, statusCode, mayRequireRefresh, isReadableStream, isAuthErr;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 6]);
                        return [4 /*yield*/, this.getRequestMetadataAsync(opts.url)];
                    case 1:
                        r = _a.sent();
                        if (r.headers && r.headers.Authorization) {
                            opts.headers = opts.headers || {};
                            opts.headers.Authorization = r.headers.Authorization;
                        }
                        if (this.apiKey) {
                            opts.params = Object.assign(opts.params || {}, { key: this.apiKey });
                        }
                        return [4 /*yield*/, this.transporter.request(opts)];
                    case 2:
                        r2 = _a.sent();
                        return [3 /*break*/, 6];
                    case 3:
                        e_1 = _a.sent();
                        res = e_1.response;
                        if (!res) return [3 /*break*/, 5];
                        statusCode = res.status;
                        mayRequireRefresh = this.credentials &&
                            this.credentials.access_token && this.credentials.refresh_token &&
                            !this.credentials.expiry_date;
                        isReadableStream = res.config.data instanceof stream.Readable;
                        isAuthErr = statusCode === 401 || statusCode === 403;
                        if (!(!retry && isAuthErr && !isReadableStream && mayRequireRefresh)) return [3 /*break*/, 5];
                        return [4 /*yield*/, this.refreshAccessTokenAsync()];
                    case 4:
                        _a.sent();
                        return [2 /*return*/, this.requestAsync(opts, true)];
                    case 5: throw e_1;
                    case 6: return [2 /*return*/, r2];
                }
            });
        });
    };
    OAuth2Client.prototype.verifyIdToken = function (options, callback) {
        // This function used to accept two arguments instead of an options object.
        // Check the types to help users upgrade with less pain.
        // This check can be removed after a 2.0 release.
        if (callback && typeof callback !== 'function') {
            throw new Error('This method accepts an options object as the first parameter, which includes the idToken, audience, and maxExpiry.');
        }
        if (callback) {
            this.verifyIdTokenAsync(options)
                .then(function (r) { return callback(null, r); })
                .catch(callback);
        }
        else {
            return this.verifyIdTokenAsync(options);
        }
    };
    OAuth2Client.prototype.verifyIdTokenAsync = function (options) {
        return __awaiter(this, void 0, void 0, function () {
            var response, login;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!options.idToken) {
                            throw new Error('The verifyIdToken method requires an ID Token');
                        }
                        return [4 /*yield*/, this.getFederatedSignonCertsAsync()];
                    case 1:
                        response = _a.sent();
                        login = this.verifySignedJwtWithCerts(options.idToken, response.certs, options.audience, OAuth2Client.ISSUERS_, options.maxExpiry);
                        return [2 /*return*/, login];
                }
            });
        });
    };
    /**
     * Obtains information about the provisioned access token.  Especially useful
     * if you want to check the scopes that were provisioned to a given token.
     *
     * @param accessToken Required.  The Access Token for which you want to get
     * user info.
     */
    OAuth2Client.prototype.getTokenInfo = function (accessToken) {
        return __awaiter(this, void 0, void 0, function () {
            var data, info;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.transporter.request({
                            method: 'GET',
                            url: OAuth2Client.GOOGLE_TOKEN_INFO_URL,
                            params: { access_token: accessToken }
                        })];
                    case 1:
                        data = (_a.sent()).data;
                        info = Object.assign({
                            expiry_date: ((new Date()).getTime() + (data.expires_in * 1000)),
                            scopes: data.scope.split(' ')
                        }, data);
                        delete info.expires_in;
                        delete info.scope;
                        return [2 /*return*/, info];
                }
            });
        });
    };
    OAuth2Client.prototype.getFederatedSignonCerts = function (callback) {
        if (callback) {
            this.getFederatedSignonCertsAsync()
                .then(function (r) { return callback(null, r.certs, r.res); })
                .catch(callback);
        }
        else {
            return this.getFederatedSignonCertsAsync();
        }
    };
    OAuth2Client.prototype.getFederatedSignonCertsAsync = function () {
        return __awaiter(this, void 0, void 0, function () {
            var nowTime, res, e_2, cacheControl, cacheAge, pattern, regexResult, now;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        nowTime = (new Date()).getTime();
                        if (this.certificateExpiry &&
                            (nowTime < this.certificateExpiry.getTime())) {
                            return [2 /*return*/, { certs: this.certificateCache }];
                        }
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.transporter.request({ url: OAuth2Client.GOOGLE_OAUTH2_FEDERATED_SIGNON_CERTS_URL_ })];
                    case 2:
                        res = _a.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        e_2 = _a.sent();
                        throw new Error('Failed to retrieve verification certificates: ' + e_2);
                    case 4:
                        cacheControl = res ? res.headers['cache-control'] : undefined;
                        cacheAge = -1;
                        if (cacheControl) {
                            pattern = new RegExp('max-age=([0-9]*)');
                            regexResult = pattern.exec(cacheControl);
                            if (regexResult && regexResult.length === 2) {
                                // Cache results with max-age (in seconds)
                                cacheAge = Number(regexResult[1]) * 1000; // milliseconds
                            }
                        }
                        now = new Date();
                        this.certificateExpiry =
                            cacheAge === -1 ? null : new Date(now.getTime() + cacheAge);
                        this.certificateCache = res.data;
                        return [2 /*return*/, { certs: res.data, res: res }];
                }
            });
        });
    };
    /**
     * Verify the id token is signed with the correct certificate
     * and is from the correct audience.
     * @param jwt The jwt to verify (The ID Token in this case).
     * @param certs The array of certs to test the jwt against.
     * @param requiredAudience The audience to test the jwt against.
     * @param issuers The allowed issuers of the jwt (Optional).
     * @param maxExpiry The max expiry the certificate can be (Optional).
     * @return Returns a LoginTicket on verification.
     */
    OAuth2Client.prototype.verifySignedJwtWithCerts = function (jwt, certs, requiredAudience, issuers, maxExpiry) {
        if (!maxExpiry) {
            maxExpiry = OAuth2Client.MAX_TOKEN_LIFETIME_SECS_;
        }
        var segments = jwt.split('.');
        if (segments.length !== 3) {
            throw new Error('Wrong number of segments in token: ' + jwt);
        }
        var signed = segments[0] + '.' + segments[1];
        var signature = segments[2];
        var envelope;
        var payload;
        try {
            envelope = JSON.parse(this.decodeBase64(segments[0]));
        }
        catch (err) {
            throw new Error('Can\'t parse token envelope: ' + segments[0]);
        }
        if (!envelope) {
            throw new Error('Can\'t parse token envelope: ' + segments[0]);
        }
        try {
            payload = JSON.parse(this.decodeBase64(segments[1]));
        }
        catch (err) {
            throw new Error('Can\'t parse token payload: ' + segments[0]);
        }
        if (!payload) {
            throw new Error('Can\'t parse token payload: ' + segments[1]);
        }
        if (!certs.hasOwnProperty(envelope.kid)) {
            // If this is not present, then there's no reason to attempt verification
            throw new Error('No pem found for envelope: ' + JSON.stringify(envelope));
        }
        // certs is a legit dynamic object
        // tslint:disable-next-line no-any
        var pem = certs[envelope.kid];
        var pemVerifier = new pemverifier_1.PemVerifier();
        var verified = pemVerifier.verify(pem, signed, signature, 'base64');
        if (!verified) {
            throw new Error('Invalid token signature: ' + jwt);
        }
        if (!payload.iat) {
            throw new Error('No issue time in token: ' + JSON.stringify(payload));
        }
        if (!payload.exp) {
            throw new Error('No expiration time in token: ' + JSON.stringify(payload));
        }
        var iat = Number(payload.iat);
        if (isNaN(iat))
            throw new Error('iat field using invalid format');
        var exp = Number(payload.exp);
        if (isNaN(exp))
            throw new Error('exp field using invalid format');
        var now = new Date().getTime() / 1000;
        if (exp >= now + maxExpiry) {
            throw new Error('Expiration time too far in future: ' + JSON.stringify(payload));
        }
        var earliest = iat - OAuth2Client.CLOCK_SKEW_SECS_;
        var latest = exp + OAuth2Client.CLOCK_SKEW_SECS_;
        if (now < earliest) {
            throw new Error('Token used too early, ' + now + ' < ' + earliest + ': ' +
                JSON.stringify(payload));
        }
        if (now > latest) {
            throw new Error('Token used too late, ' + now + ' > ' + latest + ': ' +
                JSON.stringify(payload));
        }
        if (issuers && issuers.indexOf(payload.iss) < 0) {
            throw new Error('Invalid issuer, expected one of [' + issuers + '], but got ' +
                payload.iss);
        }
        // Check the audience matches if we have one
        if (typeof requiredAudience !== 'undefined' && requiredAudience !== null) {
            var aud = payload.aud;
            var audVerified = false;
            // If the requiredAudience is an array, check if it contains token
            // audience
            if (requiredAudience.constructor === Array) {
                audVerified = (requiredAudience.indexOf(aud) > -1);
            }
            else {
                audVerified = (aud === requiredAudience);
            }
            if (!audVerified) {
                throw new Error('Wrong recipient, payload audience != requiredAudience');
            }
        }
        return new loginticket_1.LoginTicket(envelope, payload);
    };
    /**
     * This is a utils method to decode a base64 string
     * @param b64String The string to base64 decode
     * @return The decoded string
     */
    OAuth2Client.prototype.decodeBase64 = function (b64String) {
        var buffer = new Buffer(b64String, 'base64');
        return buffer.toString('utf8');
    };
    /**
     * Returns true if a token is expired or will expire within
     * eagerRefreshThresholdMillismilliseconds.
     * If there is no expiry time, assumes the token is not expired or expiring.
     */
    OAuth2Client.prototype.isTokenExpiring = function () {
        var expiryDate = this.credentials.expiry_date;
        return expiryDate ? expiryDate <=
            ((new Date()).getTime() + this.eagerRefreshThresholdMillis) :
            false;
    };
    OAuth2Client.GOOGLE_TOKEN_INFO_URL = 'https://www.googleapis.com/oauth2/v3/tokeninfo';
    /**
     * The base URL for auth endpoints.
     */
    OAuth2Client.GOOGLE_OAUTH2_AUTH_BASE_URL_ = 'https://accounts.google.com/o/oauth2/v2/auth';
    /**
     * The base endpoint for token retrieval.
     */
    OAuth2Client.GOOGLE_OAUTH2_TOKEN_URL_ = 'https://www.googleapis.com/oauth2/v4/token';
    /**
     * The base endpoint to revoke tokens.
     */
    OAuth2Client.GOOGLE_OAUTH2_REVOKE_URL_ = 'https://accounts.google.com/o/oauth2/revoke';
    /**
     * Google Sign on certificates.
     */
    OAuth2Client.GOOGLE_OAUTH2_FEDERATED_SIGNON_CERTS_URL_ = 'https://www.googleapis.com/oauth2/v1/certs';
    /**
     * Clock skew - five minutes in seconds
     */
    OAuth2Client.CLOCK_SKEW_SECS_ = 300;
    /**
     * Max Token Lifetime is one day in seconds
     */
    OAuth2Client.MAX_TOKEN_LIFETIME_SECS_ = 86400;
    /**
     * The allowed oauth token issuers.
     */
    OAuth2Client.ISSUERS_ = ['accounts.google.com', 'https://accounts.google.com'];
    return OAuth2Client;
}(authclient_1.AuthClient));
exports.OAuth2Client = OAuth2Client;
//# sourceMappingURL=oauth2client.js.map