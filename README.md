dispatch:retry-http [![Build Status](https://travis-ci.org/DispatchMe/meteor-retry-http.svg?branch=master)](https://travis-ci.org/DispatchMe/meteor-retry-http)
=======================

A simple wrapper of http that supports retry options.

```
RetryHttp.call('GET', 'http://myurl');

RetryHttp.get('http://myurl', {
  retry: {
    baseTimeout: 100,
    maxTimeout: 5000,
    shouldRetry: function (err, res, callback) {
      callback(null, true);
    },
    times: 5
  }
});
```
