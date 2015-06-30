/* global RetryHttp:true */

RetryHttp = {};

/**
 * Wrapper for regular http that takes an extra option: retry.
 * {Number}   [options.baseTimeout] Starts from this timeout. Defaults to 100 milliseconds.
 * {Number}   [options.maxTimeout] Starts from this timeout. Defaults to 5000 milliseconds.
 * {Function} [options.shouldRetry(error, response, callback(tryRetry))] A function which will determine whether or not to retry based on the error.
 * {Number}   [options.times] The number of times to retry. Defaults to 5.
 */
RetryHttp.call = Meteor.wrapAsync(function (type, url, options, callback) {
  options.retry = options.retry || {};

  check(options.retry, {
    baseTimeout: Match.Optional(Number),
    maxTimeout: Match.Optional(Number),
    times: Match.Optional(Number),
    shouldRetry: Match.Optional(Function)
  });

  var retryOpts = options.retry;

  // Default the shouldRetry function to return true
  if (!retryOpts.shouldRetry) {
    retryOpts.shouldRetry = function (err, res, callback) {
      callback(null, true);
    };
  }

  var retries = 0;

  var retry = new Retry({
    baseTimeout: retryOpts.baseTimeout || 100,
    maxTimeout: retryOpts.maxTimeout || 5000
  });

  var checkRetry = function (err, res, cb) {
    // Retry if we are below the number of retry times
    // and shouldRetry returns true
    if (retries < (retryOpts.times || 5)) {
      retryOpts.shouldRetry(err, res, cb);
    } else {
      cb(null, false);
    }
  };

  function httpCall() {
    HTTP.call(type, url, options || {}, function (httpError, httpResponse) {
      // If there is an error check if we should retry
      if (httpError) {
        checkRetry(httpError, httpResponse, function (err, shouldRetry) {
          // If we should retry -- then retry
          if (shouldRetry) {
            retry.retryLater(++retries, httpCall);
          }
          // otherwise pass along the error
          else {
            callback(httpError, httpResponse);
          }
        });
      }
      // if there is not an error pass along the result
      else {
        callback(null, httpResponse);
      }
    });
  }

  httpCall();
});

RetryHttp.get = Meteor.wrapAsync(function (url, options, callback) {
  return RetryHttp.call('GET', url, options, callback);
});

RetryHttp.post = Meteor.wrapAsync(function (url, options, callback) {
  return RetryHttp.call('POST', url, options, callback);
});

RetryHttp.patch = Meteor.wrapAsync(function (url, options, callback) {
  return RetryHttp.call('PATCH', url, options, callback);
});

RetryHttp.put = Meteor.wrapAsync(function (url, options, callback) {
  return RetryHttp.call('PUT', url, options, callback);
});

RetryHttp.delete = Meteor.wrapAsync(function (url, options, callback) {
  return RetryHttp.call('DELETE', url, options, callback);
});
