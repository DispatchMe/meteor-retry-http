/* global RetryHttp:true */

RetryHttp = {};

/**
 * Wrapper for regular http that takes an extra option: retry.
 * {Number}   [options.baseTimeout] Starts from this timeout. Defaults to 100 milliseconds.
 * {Number}   [options.maxTimeout] Starts from this timeout. Defaults to 5000 milliseconds.
 * {Function} [options.shouldRetry(error, response)] A function which will determine whether or not to retry based on the error.
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

  var retries = 0;

  var retry = new Retry({
    baseTimeout: retryOpts.baseTimeout || 100,
    maxTimeout: retryOpts.maxTimeout || 5000
  });

  // Retry if we are below the number of retry times and if
  // the shouldRetry function returns true (or does not exist).
  var shouldRetry = function (err) {
    return retries < (retryOpts.times || 5) && (!retryOpts.shouldRetry || retryOpts.shouldRetry(err));
  };

  function httpCall() {
    HTTP.call(type, url, options || {}, function (err, res) {
      if (err && shouldRetry(err, res)) {
        return retry.retryLater(++retries, httpCall);
      }

      callback(err, res);
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
