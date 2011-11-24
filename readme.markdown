# mw-pipes

connect-compatible middleware connector, but with more elegant support for streams.

allow better support for streams that modify the request or response.

``` js
var pipes = require('mw-pipes')
  , http = require('http')
  
http.createServer(
  pipes(
    function (req, res, next) {
      var x = new XStream()
      var y = new YStream()
  
      req.pipe(x)
      y.pipe(y)
    
      next(null, x, y)
    },
    ...
```
the properties of `req` and `res` will be copied onto x and y with getters/setters so that
they will behave just like a regular `ServerRequest` and `ServerResponse` to downstream middleware.

## Example

the following would fail using `connect`

``` js
var http = require('http')
  , pipes = require('mw-pipes')
  , BufferedStream = require('morestreams').BufferedStream
  ;

http.createServer(pipes(
  function (req, res, next) {
    var b = new BufferedStream()
    req.pipe(b)
    // replace the req stream with a buffered stream.
    // data events will be buffered until the pipe method is called.
    next(null, b)
  },
  function (req, res, next) {
    // this wouldn't work with connect.
    // the data events would get lost,
    setTimeout(function () {
      res.writeHeader(202)
      req.pipe(res)
    }, 1000)
  }
)).listen(8080)
```