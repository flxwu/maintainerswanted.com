"use strict";
/**
 * Copyright 2015 Google Inc. All Rights Reserved.
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var jws_1 = __importDefault(require("jws"));
var lru_cache_1 = __importDefault(require("lru-cache"));
var JWTAccess = /** @class */ (function () {
    /**
     * JWTAccess service account credentials.
     *
     * Create a new access token by using the credential to create a new JWT token
     * that's recognized as the access token.
     *
     * @param email the service account email address.
     * @param key the private key that will be used to sign the token.
     */
    function JWTAccess(email, key) {
        this.cache = lru_cache_1.default({ max: 500, maxAge: 60 * 60 * 1000 });
        this.email = email;
        this.key = key;
    }
    /**
     * Indicates whether the credential requires scopes to be created by calling
     * createdScoped before use.
     *
     * @return always false
     */
    JWTAccess.prototype.createScopedRequired = function () {
        // JWT Header authentication does not use scopes.
        return false;
    };
    /**
     * Get a non-expired access token, after refreshing if necessary.
     *
     * @param authURI The URI being authorized.
     * @param additionalClaims An object with a set of additional claims to
     * include in the payload.
     * @returns An object that includes the authorization header.
     */
    JWTAccess.prototype.getRequestMetadata = function (authURI, additionalClaims) {
        var cachedToken = this.cache.get(authURI);
        if (cachedToken) {
            return cachedToken;
        }
        var iat = Math.floor(new Date().getTime() / 1000);
        var exp = iat + 3600; // 3600 seconds = 1 hour
        // The payload used for signed JWT headers has:
        // iss == sub == <client email>
        // aud == <the authorization uri>
        var defaultClaims = { iss: this.email, sub: this.email, aud: authURI, exp: exp, iat: iat };
        // if additionalClaims are provided, ensure they do not collide with
        // other required claims.
        if (additionalClaims) {
            for (var claim in defaultClaims) {
                if (additionalClaims[claim]) {
                    throw new Error("The '" + claim + "' property is not allowed when passing additionalClaims. This claim is included in the JWT by default.");
                }
            }
        }
        var payload = Object.assign(defaultClaims, additionalClaims);
        // Sign the jwt and add it to the cache
        var signedJWT = jws_1.default.sign({ header: { alg: 'RS256' }, payload: payload, secret: this.key });
        var res = { headers: { Authorization: "Bearer " + signedJWT } };
        this.cache.set(authURI, res);
        return res;
    };
    /**
     * Create a JWTAccess credentials instance using the given input options.
     * @param json The input object.
     */
    JWTAccess.prototype.fromJSON = function (json) {
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
    JWTAccess.prototype.fromStream = function (inputStream, callback) {
        if (callback) {
            this.fromStreamAsync(inputStream).then(function (r) { return callback(); }).catch(callback);
        }
        else {
            return this.fromStreamAsync(inputStream);
        }
    };
    JWTAccess.prototype.fromStreamAsync = function (inputStream) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            if (!inputStream) {
                reject(new Error('Must pass in a stream containing the service account auth settings.'));
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
                catch (err) {
                    reject(err);
                }
            });
        });
    };
    return JWTAccess;
}());
exports.JWTAccess = JWTAccess;
//# sourceMappingURL=jwtaccess.js.map