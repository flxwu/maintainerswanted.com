"use strict";
/**
 * Copyright 2013 Google Inc. All Rights Reserved.
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
Object.defineProperty(exports, "__esModule", { value: true });
var gtoken_1 = require("gtoken");
var jwtaccess_1 = require("./jwtaccess");
var oauth2client_1 = require("./oauth2client");
var isString = require('lodash.isstring');
var JWT = /** @class */ (function (_super) {
    __extends(JWT, _super);
    function JWT(optionsOrEmail, keyFile, key, scopes, subject) {
        var _this = this;
        var opts = (optionsOrEmail && typeof optionsOrEmail === 'object') ?
            optionsOrEmail :
            { email: optionsOrEmail, keyFile: keyFile, key: key, scopes: scopes, subject: subject };
        _this = _super.call(this, { eagerRefreshThresholdMillis: opts.eagerRefreshThresholdMillis }) || this;
        _this.email = opts.email;
        _this.keyFile = opts.keyFile;
        _this.key = opts.key;
        _this.scopes = opts.scopes;
        _this.subject = opts.subject;
        _this.additionalClaims = opts.additionalClaims;
        _this.credentials = { refresh_token: 'jwt-placeholder', expiry_date: 1 };
        return _this;
    }
    /**
     * Creates a copy of the credential with the specified scopes.
     * @param scopes List of requested scopes or a single scope.
     * @return The cloned instance.
     */
    JWT.prototype.createScoped = function (scopes) {
        return new JWT({
            email: this.email,
            keyFile: this.keyFile,
            key: this.key,
            scopes: scopes,
            subject: this.subject,
            additionalClaims: this.additionalClaims
        });
    };
    /**
     * Obtains the metadata to be sent with the request.
     *
     * @param url the URI being authorized.
     */
    JWT.prototype.getRequestMetadataAsync = function (url) {
        return __awaiter(this, void 0, void 0, function () {
            var tokens;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!(!this.apiKey && this.createScopedRequired() && url)) return [3 /*break*/, 4];
                        if (!(this.additionalClaims && this.additionalClaims.target_audience)) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.refreshToken()];
                    case 1:
                        tokens = (_a.sent()).tokens;
                        return [2 /*return*/, { headers: { Authorization: "Bearer " + tokens.id_token } }];
                    case 2:
                        // no scopes have been set, but a uri has been provided. Use JWTAccess
                        // credentials.
                        if (!this.access) {
                            this.access = new jwtaccess_1.JWTAccess(this.email, this.key);
                        }
                        return [2 /*return*/, this.access.getRequestMetadata(url, this.additionalClaims)];
                    case 3: return [3 /*break*/, 5];
                    case 4: return [2 /*return*/, _super.prototype.getRequestMetadataAsync.call(this, url)];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Indicates whether the credential requires scopes to be created by calling
     * createScoped before use.
     * @return false if createScoped does not need to be called.
     */
    JWT.prototype.createScopedRequired = function () {
        // If scopes is null, always return true.
        if (this.scopes) {
            // For arrays, check the array length.
            if (this.scopes instanceof Array) {
                return this.scopes.length === 0;
            }
            // For others, convert to a string and check the length.
            return String(this.scopes).length === 0;
        }
        return true;
    };
    JWT.prototype.authorize = function (callback) {
        if (callback) {
            this.authorizeAsync().then(function (r) { return callback(null, r); }).catch(callback);
        }
        else {
            return this.authorizeAsync();
        }
    };
    JWT.prototype.authorizeAsync = function () {
        return __awaiter(this, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.refreshToken()];
                    case 1:
                        result = _a.sent();
                        if (!result) {
                            throw new Error('No result returned');
                        }
                        this.credentials = result.tokens;
                        this.credentials.refresh_token = 'jwt-placeholder';
                        this.key = this.gtoken.key;
                        this.email = this.gtoken.iss;
                        return [2 /*return*/, result.tokens];
                }
            });
        });
    };
    /**
     * Refreshes the access token.
     * @param refreshToken ignored
     * @private
     */
    JWT.prototype.refreshTokenNoCache = function (refreshToken) {
        return __awaiter(this, void 0, void 0, function () {
            var gtoken, token, tokens;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        gtoken = this.createGToken();
                        return [4 /*yield*/, gtoken.getToken()];
                    case 1:
                        token = _a.sent();
                        tokens = {
                            access_token: token,
                            token_type: 'Bearer',
                            expiry_date: gtoken.expiresAt,
                            // tslint:disable-next-line no-any
                            id_token: gtoken.rawToken.id_token
                        };
                        this.emit('tokens', tokens);
                        return [2 /*return*/, { res: null, tokens: tokens }];
                }
            });
        });
    };
    /**
     * Create a gToken if it doesn't already exist.
     */
    JWT.prototype.createGToken = function () {
        if (!this.gtoken) {
            this.gtoken = new gtoken_1.GoogleToken({
                iss: this.email,
                sub: this.subject,
                scope: this.scopes,
                keyFile: this.keyFile,
                key: this.key,
                additionalClaims: this.additionalClaims
            });
        }
        return this.gtoken;
    };
    /**
     * Create a JWT credentials instance using the given input options.
     * @param json The input object.
     */
    JWT.prototype.fromJSON = function (json) {
        if (!json) {
            throw new Error('Must pass in a JSON object containing the service account auth settings.');
        }
        if (!json.client_email) {
            throw new Error('The incoming JSON object does not contain a client_email field');
        }
        if (!json.private_key) {
            throw new Error('The incoming JSON object does not contain a private_key field');
        }
        // Extract the relevant information from the json key file.
        this.email = json.client_email;
        this.key = json.private_key;
        this.projectId = json.project_id;
    };
    JWT.prototype.fromStream = function (inputStream, callback) {
        if (callback) {
            this.fromStreamAsync(inputStream).then(function (r) { return callback(); }).catch(callback);
        }
        else {
            return this.fromStreamAsync(inputStream);
        }
    };
    JWT.prototype.fromStreamAsync = function (inputStream) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            if (!inputStream) {
                throw new Error('Must pass in a stream containing the service account auth settings.');
            }
            var s = '';
            inputStream.setEncoding('utf8');
            inputStream.on('data', function (chunk) {
                s += chunk;
            });
            inputStream.on('end', function () {
                try {
                    var data = JSON.parse(s);
                    _this.fromJSON(data);
                    resolve();
                }
                catch (e) {
                    reject(e);
                }
            });
        });
    };
    /**
     * Creates a JWT credentials instance using an API Key for authentication.
     * @param apiKey The API Key in string form.
     */
    JWT.prototype.fromAPIKey = function (apiKey) {
        if (!isString(apiKey)) {
            throw new Error('Must provide an API Key string.');
        }
        this.apiKey = apiKey;
    };
    /**
     * Using the key or keyFile on the JWT client, obtain an object that contains
     * the key and the client email.
     */
    JWT.prototype.getCredentials = function () {
        return __awaiter(this, void 0, void 0, function () {
            var gtoken, creds;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.key) return [3 /*break*/, 1];
                        return [2 /*return*/, { private_key: this.key, client_email: this.email }];
                    case 1:
                        if (!this.keyFile) return [3 /*break*/, 3];
                        gtoken = this.createGToken();
                        return [4 /*yield*/, gtoken.getCredentials(this.keyFile)];
                    case 2:
                        creds = _a.sent();
                        return [2 /*return*/, { private_key: creds.privateKey, client_email: creds.clientEmail }];
                    case 3: throw new Error('A key or a keyFile must be provided to getCredentials.');
                }
            });
        });
    };
    return JWT;
}(oauth2client_1.OAuth2Client));
exports.JWT = JWT;
//# sourceMappingURL=jwtclient.js.map