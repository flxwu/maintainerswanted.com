"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var axios_1 = require("axios");
/**
 * Attach the interceptor to the Axios instance.
 * @param instance The optional Axios instance on which to attach the
 * interceptor.
 * @returns The id of the interceptor attached to the axios instance.
 */
function attach(instance) {
    instance = instance || axios_1.default;
    return instance.interceptors.response.use(onFulfilled, onError);
}
exports.attach = attach;
/**
 * Eject the Axios interceptor that is providing retry capabilities.
 * @param interceptorId The interceptorId provided in the config.
 * @param instance The axios instance using this interceptor.
 */
function detach(interceptorId, instance) {
    instance = instance || axios_1.default;
    instance.interceptors.response.eject(interceptorId);
}
exports.detach = detach;
function onFulfilled(res) {
    return res;
}
function onError(err) {
    var config = err.config.raxConfig || {};
    config.currentRetryAttempt = config.currentRetryAttempt || 0;
    config.retry =
        (config.retry === undefined || config.retry === null) ? 3 : config.retry;
    config.retryDelay = config.retryDelay || 100;
    config.instance = config.instance || axios_1.default;
    config.httpMethodsToRetry =
        config.httpMethodsToRetry || ['GET', 'HEAD', 'PUT', 'OPTIONS', 'DELETE'];
    config.noResponseRetries = (config.noResponseRetries === undefined ||
        config.noResponseRetries === null) ?
        2 :
        config.noResponseRetries;
    // If this wasn't in the list of status codes where we want
    // to automatically retry, return.
    var retryRanges = [
        // https://en.wikipedia.org/wiki/List_of_HTTP_status_codes
        // 1xx - Retry (Informational, request still processing)
        // 2xx - Do not retry (Success)
        // 3xx - Do not retry (Redirect)
        // 4xx - Do not retry (Client errors)
        // 429 - Retry ("Too Many Requests")
        // 5xx - Retry (Server errors)
        [100, 199], [429, 429], [500, 599]
    ];
    config.statusCodesToRetry = config.statusCodesToRetry || retryRanges;
    // Put the config back into the err
    err.config.raxConfig = config;
    // Determine if we should retry the request
    var shouldRetryFn = config.shouldRetry || shouldRetryRequest;
    if (!shouldRetryFn(err)) {
        return Promise.reject(err);
    }
    // Calculate time to wait with exponential backoff.
    // Formula: (2^c - 1 / 2) * 1000
    var delay = (Math.pow(2, config.currentRetryAttempt) - 1) / 2 * 1000;
    // We're going to retry!  Incremenent the counter.
    err.config.raxConfig.currentRetryAttempt += 1;
    // Create a promise that invokes the retry after the backOffDelay
    var backoff = new Promise(function (resolve) {
        setTimeout(resolve, delay);
    });
    // Notify the user if they added an `onRetryAttempt` handler
    if (config.onRetryAttempt) {
        config.onRetryAttempt(err);
    }
    // Return the promise in which recalls axios to retry the request
    return backoff.then(function () {
        return config.instance.request(err.config);
    });
}
/**
 * Determine based on config if we should retry the request.
 * @param err The AxiosError passed to the interceptor.
 */
function shouldRetryRequest(err) {
    var config = err.config.raxConfig;
    // If there's no config, or retries are disabled, return.
    if (!config || config.retry === 0) {
        return false;
    }
    // Check if this error has no response (ETIMEDOUT, ENOTFOUND, etc)
    if (!err.response &&
        ((config.currentRetryAttempt || 0) >= config.noResponseRetries)) {
        return false;
    }
    // Only retry with configured HttpMethods.
    if (!err.config.method ||
        config.httpMethodsToRetry.indexOf(err.config.method.toUpperCase()) < 0) {
        return false;
    }
    // If this wasn't in the list of status codes where we want
    // to automatically retry, return.
    if (err.response && err.response.status) {
        var isInRange = false;
        for (var _i = 0, _a = config.statusCodesToRetry; _i < _a.length; _i++) {
            var _b = _a[_i], min = _b[0], max = _b[1];
            var status = err.response.status;
            if (status >= min && status <= max) {
                isInRange = true;
                break;
            }
        }
        if (!isInRange) {
            return false;
        }
    }
    // If we are out of retry attempts, return
    config.currentRetryAttempt = config.currentRetryAttempt || 0;
    if (config.currentRetryAttempt >= config.retry) {
        return false;
    }
    return true;
}
/**
 * Acquire the raxConfig object from an AxiosError if available.
 * @param err The Axios error with a config object.
 */
function getConfig(err) {
    if (err && err.config) {
        return err.config.raxConfig;
    }
    return;
}
exports.getConfig = getConfig;
//# sourceMappingURL=index.js.map