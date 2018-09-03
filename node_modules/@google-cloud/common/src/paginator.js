/*!
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

/*!
 * @module common/paginator
 */

'use strict';

const arrify = require('arrify');
const concat = require('concat-stream');
const extend = require('extend');
const is = require('is');
const split = require('split-array-stream');

/**
 * @type {module:common/util}
 * @private
 */
const util = require('./util.js');

/*! Developer Documentation
 *
 * paginator is used to auto-paginate `nextQuery` methods as well as
 * streamifying them.
 *
 * Before:
 *
 *   search.query('done=true', function(err, results, nextQuery) {
 *     search.query(nextQuery, function(err, results, nextQuery) {});
 *   });
 *
 * After:
 *
 *   search.query('done=true', function(err, results) {});
 *
 * Methods to extend should be written to accept callbacks and return a
 * `nextQuery`.
 */
const paginator = {};

/**
 * Cache the original method, then overwrite it on the Class's prototype.
 *
 * @param {function} Class - The parent class of the methods to extend.
 * @param {string|string[]} methodNames - Name(s) of the methods to extend.
 */
paginator.extend = function(Class, methodNames) {
  methodNames = arrify(methodNames);

  methodNames.forEach(function(methodName) {
    const originalMethod = Class.prototype[methodName];

    // map the original method to a private member
    Class.prototype[methodName + '_'] = originalMethod;

    // overwrite the original to auto-paginate
    Class.prototype[methodName] = function() {
      const parsedArguments = paginator.parseArguments_(arguments);
      return paginator.run_(parsedArguments, originalMethod.bind(this));
    };
  });
};

/**
 * Wraps paginated API calls in a readable object stream.
 *
 * This method simply calls the nextQuery recursively, emitting results to a
 * stream. The stream ends when `nextQuery` is null.
 *
 * `maxResults` will act as a cap for how many results are fetched and emitted
 * to the stream.
 *
 * @param {string} methodName - Name of the method to streamify.
 * @return {function} - Wrapped function.
 */
paginator.streamify = function(methodName) {
  return function() {
    const parsedArguments = paginator.parseArguments_(arguments);
    const originalMethod = this[methodName + '_'] || this[methodName];

    return paginator.runAsStream_(parsedArguments, originalMethod.bind(this));
  };
};

/**
 * Parse a pseudo-array `arguments` for a query and callback.
 *
 * @param {array} args - The original `arguments` pseduo-array that the original
 *     method received.
 */
paginator.parseArguments_ = function(args) {
  let query;
  let autoPaginate = true;
  let maxApiCalls = -1;
  let maxResults = -1;
  let callback;

  const firstArgument = args[0];
  const lastArgument = args[args.length - 1];

  if (is.fn(firstArgument)) {
    callback = firstArgument;
  } else {
    query = firstArgument;
  }

  if (is.fn(lastArgument)) {
    callback = lastArgument;
  }

  if (is.object(query)) {
    query = extend(true, {}, query);

    // Check if the user only asked for a certain amount of results.
    if (is.number(query.maxResults)) {
      // `maxResults` is used API-wide.
      maxResults = query.maxResults;
    } else if (is.number(query.pageSize)) {
      // `pageSize` is Pub/Sub's `maxResults`.
      maxResults = query.pageSize;
    }

    if (is.number(query.maxApiCalls)) {
      maxApiCalls = query.maxApiCalls;
      delete query.maxApiCalls;
    }

    if (
      callback &&
      (maxResults !== -1 || // The user specified a limit.
        query.autoPaginate === false)
    ) {
      autoPaginate = false;
    }
  }

  const parsedArguments = {
    query: query || {},
    autoPaginate: autoPaginate,
    maxApiCalls: maxApiCalls,
    maxResults: maxResults,
    callback: callback,
  };

  parsedArguments.streamOptions = extend(true, {}, parsedArguments.query);
  delete parsedArguments.streamOptions.autoPaginate;
  delete parsedArguments.streamOptions.maxResults;
  delete parsedArguments.streamOptions.pageSize;

  return parsedArguments;
};

/**
 * This simply checks to see if `autoPaginate` is set or not, if it's true
 * then we buffer all results, otherwise simply call the original method.
 *
 * @param {array} parsedArguments - Parsed arguments from the original method
 *     call.
 * @param {object=|string=} parsedArguments.query - Query object. This is most
 *     commonly an object, but to make the API more simple, it can also be a
 *     string in some places.
 * @param {function=} parsedArguments.callback - Callback function.
 * @param {boolean} parsedArguments.autoPaginate - Auto-pagination enabled.
 * @param {boolean} parsedArguments.maxApiCalls - Maximum API calls to make.
 * @param {number} parsedArguments.maxResults - Maximum results to return.
 * @param {function} originalMethod - The cached method that accepts a callback
 *     and returns `nextQuery` to receive more results.
 */
paginator.run_ = function(parsedArguments, originalMethod) {
  const query = parsedArguments.query;
  const callback = parsedArguments.callback;
  const autoPaginate = parsedArguments.autoPaginate;

  if (autoPaginate) {
    this.runAsStream_(parsedArguments, originalMethod)
      .on('error', callback)
      .pipe(
        concat(function(results) {
          callback(null, results);
        })
      );
  } else {
    originalMethod(query, callback);
  }
};

/**
 * This method simply calls the nextQuery recursively, emitting results to a
 * stream. The stream ends when `nextQuery` is null.
 *
 * `maxResults` will act as a cap for how many results are fetched and emitted
 * to the stream.
 *
 * @param {object=|string=} parsedArguments.query - Query object. This is most
 *     commonly an object, but to make the API more simple, it can also be a
 *     string in some places.
 * @param {function=} parsedArguments.callback - Callback function.
 * @param {boolean} parsedArguments.autoPaginate - Auto-pagination enabled.
 * @param {boolean} parsedArguments.maxApiCalls - Maximum API calls to make.
 * @param {number} parsedArguments.maxResults - Maximum results to return.
 * @param {function} originalMethod - The cached method that accepts a callback
 *     and returns `nextQuery` to receive more results.
 * @return {stream} - Readable object stream.
 */
paginator.runAsStream_ = function(parsedArguments, originalMethod) {
  let query = parsedArguments.query;
  let resultsToSend = parsedArguments.maxResults;

  const limiter = util.createLimiter(makeRequest, {
    maxApiCalls: parsedArguments.maxApiCalls,
    streamOptions: parsedArguments.streamOptions,
  });

  const stream = limiter.stream;

  stream.once('reading', function() {
    makeRequest(query);
  });

  function makeRequest(query) {
    originalMethod(query, onResultSet);
  }

  function onResultSet(err, results, nextQuery) {
    if (err) {
      stream.destroy(err);
      return;
    }

    if (resultsToSend >= 0 && results.length > resultsToSend) {
      results = results.splice(0, resultsToSend);
    }

    resultsToSend -= results.length;

    split(results, stream, function(streamEnded) {
      if (streamEnded) {
        return;
      }

      if (nextQuery && resultsToSend !== 0) {
        limiter.makeRequest(nextQuery);
        return;
      }

      stream.push(null);
    });
  }

  return limiter.stream;
};

module.exports = paginator;
