// Stub out HTTP.call

var error = null;
var response = null;
var numCalls = 0;

var setResponse = function (err, res) {
  error = err;
  response = res;
};

var _stubCall = function () {
  var cb = arguments[arguments.length - 1];
  numCalls++;
  cb(error, response);
};

var _originalCall = HTTP.call;

Tinytest.add('HttpRetry - prepare', function () {
  HTTP.call = _stubCall;
});

Tinytest.addAsync('HttpRetry - retries correct number of times', function (test, complete) {
  setResponse('error');

  RetryHttp.get('test_url', {
    retry: {
      baseTimeout: 1,
      maxTimeout: 10
    }
  }, function (error) {
    test.equal(error, 'error');
    test.equal(numCalls, 6);
    complete();
  });
});

Tinytest.addAsync('HttpRetry - only retries if shouldRetry is true', function (test, complete) {
  numCalls = 0;

  var retryOpts = {
    retry: {
      baseTimeout: 1,
      maxTimeout: 10,
      shouldRetry: function (error, res, callback) {
        test.equal(error, 'error');
        callback(null, false);
      }
    }
  };

  RetryHttp.get('test_url', retryOpts, function (error) {
    test.equal(error, 'error');
    test.equal(numCalls, 1);
    complete();
  });
});

Tinytest.add('HttpRetry - finish', function () {
  HTTP.call = _originalCall;
});
