"use strict";
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
var extend = require("extend");
var rax = require("retry-axios");
exports.HOST_ADDRESS = 'http://metadata.google.internal';
exports.BASE_PATH = '/computeMetadata/v1';
exports.BASE_URL = exports.HOST_ADDRESS + exports.BASE_PATH;
exports.HEADER_NAME = 'Metadata-Flavor';
exports.HEADER_VALUE = 'Google';
exports.HEADERS = Object.freeze((_a = {}, _a[exports.HEADER_NAME] = exports.HEADER_VALUE, _a));
// Accepts an options object passed from the user to the API.  In the
// previous version of the API, it referred to a `Request` options object.
// Now it refers to an Axios Request Config object.  This is here to help
// ensure users don't pass invalid options when they upgrade from 0.4 to 0.5.
function validate(options) {
    var vpairs = [
        { invalid: 'uri', expected: 'url' }, { invalid: 'json', expected: 'data' },
        { invalid: 'qs', expected: 'params' }
    ];
    for (var _i = 0, vpairs_1 = vpairs; _i < vpairs_1.length; _i++) {
        var pair = vpairs_1[_i];
        if (options[pair.invalid]) {
            var e = "'" + pair.invalid + "' is not a valid configuration option. Please use '" + pair.expected + "' instead. This library is using Axios for requests. Please see https://github.com/axios/axios to learn more about the valid request options.";
            throw new Error(e);
        }
    }
}
function metadataAccessor(type, options, noResponseRetries) {
    if (noResponseRetries === void 0) { noResponseRetries = 3; }
    return __awaiter(this, void 0, void 0, function () {
        var property, ax, baseOpts, reqOpts;
        return __generator(this, function (_a) {
            options = options || {};
            if (typeof options === 'string') {
                options = { property: options };
            }
            property = '';
            if (typeof options === 'object' && options.property) {
                property = '/' + options.property;
            }
            validate(options);
            ax = axios_1.default.create();
            rax.attach(ax);
            baseOpts = {
                url: exports.BASE_URL + "/" + type + property,
                headers: Object.assign({}, exports.HEADERS),
                raxConfig: { noResponseRetries: noResponseRetries, instance: ax }
            };
            reqOpts = extend(true, baseOpts, options);
            delete reqOpts.property;
            return [2 /*return*/, ax.request(reqOpts)
                    .then(function (res) {
                    // NOTE: node.js converts all incoming headers to lower case.
                    if (res.headers[exports.HEADER_NAME.toLowerCase()] !== exports.HEADER_VALUE) {
                        throw new Error("Invalid response from metadata service: incorrect " + exports.HEADER_NAME + " header.");
                    }
                    else if (!res.data) {
                        throw new Error('Invalid response from the metadata service');
                    }
                    return res;
                })
                    .catch(function (err) {
                    if (err.response && err.response.status !== 200) {
                        err.message = 'Unsuccessful response status code. ' + err.message;
                    }
                    throw err;
                })];
        });
    });
}
function instance(options) {
    return metadataAccessor('instance', options);
}
exports.instance = instance;
function project(options) {
    return metadataAccessor('project', options);
}
exports.project = project;
/**
 * Determine if the metadata server is currently available.
 */
function isAvailable() {
    return __awaiter(this, void 0, void 0, function () {
        var err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    // Attempt to read instance metadata. As configured, this will
                    // retry 3 times if there is a valid response, and fail fast
                    // if there is an ETIMEDOUT or ENOTFOUND error.
                    return [4 /*yield*/, metadataAccessor('instance', undefined, 0)];
                case 1:
                    // Attempt to read instance metadata. As configured, this will
                    // retry 3 times if there is a valid response, and fail fast
                    // if there is an ETIMEDOUT or ENOTFOUND error.
                    _a.sent();
                    return [2 /*return*/, true];
                case 2:
                    err_1 = _a.sent();
                    return [2 /*return*/, false];
                case 3: return [2 /*return*/];
            }
        });
    });
}
exports.isAvailable = isAvailable;
var _a;
//# sourceMappingURL=index.js.map