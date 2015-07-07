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
  setResponse('error');

  numCalls = 0;

  RetryHttp.get('test_url', {
    retry: {
      baseTimeout: 1,
      maxTimeout: 10,
      shouldRetry: function (error, res, callback) {
        test.equal(error, 'error');
        callback(null, false);
      }
    }
  }, function (error) {
    test.equal(error, 'error');
    test.equal(numCalls, 1);
    complete();
  });
});

Tinytest.addAsync('HttpRetry - shouldRetry times out', function (test, complete) {
  numCalls = 0;
  setResponse('error');

  // The test fails if this timeout is not
  // cleared before shouldRetryTimeout.
  var failTimeoutId = Meteor.setTimeout(function () {
    test.fail();
    complete();
  }, 15);

  RetryHttp.get('test_url', {
    retry: {
      shouldRetry: function (error, res, callback) {
        // Do nothing to trigger timeout
      },
      shouldRetryTimeout: 10
    }
  }, function (error) {
    Meteor.clearTimeout(failTimeoutId);
    test.equal(numCalls, 1);
    complete();
  });
});

Tinytest.add('HttpRetry - finish', function () {
  HTTP.call = _originalCall;
});
