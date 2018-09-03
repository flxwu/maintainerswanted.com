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
var axios_1 = __importDefault(require("axios"));
var gcpMetadata = __importStar(require("gcp-metadata"));
var rax = __importStar(require("retry-axios"));
var oauth2client_1 = require("./oauth2client");
// Create a scoped axios instance that will retry 3 times by default
var ax = axios_1.default.create();
rax.attach(ax);
var Compute = /** @class */ (function (_super) {
    __extends(Compute, _super);
    /**
     * Google Compute Engine service account credentials.
     *
     * Retrieve access token from the metadata server.
     * See: https://developers.google.com/compute/docs/authentication
     */
    function Compute(options) {
        if (options === void 0) { options = {}; }
        var _this = _super.call(this, options) || this;
        // Start with an expired refresh token, which will automatically be
        // refreshed before the first API call is made.
        _this.credentials = { expiry_date: 1, refresh_token: 'compute-placeholder' };
        _this.serviceAccountEmail = options.serviceAccountEmail || 'default';
        return _this;
    }
    /**
     * Indicates whether the credential requires scopes to be created by calling
     * createdScoped before use.
     * @return Boolean indicating if scope is required.
     */
    Compute.prototype.createScopedRequired = function () {
        // On compute engine, scopes are specified at the compute instance's
        // creation time, and cannot be changed. For this reason, always return
        // false.
        return false;
    };
    /**
     * Refreshes the access token.
     * @param refreshToken Unused parameter
     */
    Compute.prototype.refreshTokenNoCache = function (refreshToken) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, url, res, e_1, tokens;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        url = this.tokenUrl ||
                            "" + gcpMetadata.HOST_ADDRESS + gcpMetadata.BASE_PATH + "/instance/service-accounts/" + this.serviceAccountEmail + "/token";
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, ax.request({
                                url: url,
                                headers: (_a = {}, _a[gcpMetadata.HEADER_NAME] = 'Google', _a),
                                raxConfig: { noResponseRetries: 3, retry: 3, instance: ax }
                            })];
                    case 2:
                        // TODO: In 2.0, we should remove the ability to configure the tokenUrl,
                        // and switch this over to use the gcp-metadata package instead.
                        res = _b.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        e_1 = _b.sent();
                        e_1.message = 'Could not refresh access token.';
                        throw e_1;
                    case 4:
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
    Compute.prototype.requestAsync = function (opts, retry) {
        if (retry === void 0) { retry = false; }
        return _super.prototype.requestAsync.call(this, opts, retry).catch(function (e) {
            var res = e.response;
            if (res && res.status) {
                var helpfulMessage = null;
                if (res.status === 403) {
                    helpfulMessage =
                        'A Forbidden error was returned while attempting to retrieve an access ' +
                            'token for the Compute Engine built-in service account. This may be because the Compute ' +
                            'Engine instance does not have the correct permission scopes specified.';
                }
                else if (res.status === 404) {
                    helpfulMessage =
                        'A Not Found error was returned while attempting to retrieve an access' +
                            'token for the Compute Engine built-in service account. This may be because the Compute ' +
                            'Engine instance does not have any permission scopes specified.';
                }
                if (helpfulMessage) {
                    if (e && e.message && !retry) {
                        helpfulMessage += ' ' + e.message;
                    }
                    if (e) {
                        e.message = helpfulMessage;
                    }
                    else {
                        e = new Error(helpfulMessage);
                        e.code = res.status.toString();
                    }
                }
            }
            throw e;
        });
    };
    return Compute;
}(oauth2client_1.OAuth2Client));
exports.Compute = Compute;
//# sourceMappingURL=computeclient.js.map