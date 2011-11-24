function augment(orig, aug) {
  if(orig === aug || !aug)
    return orig
  console.error('aug', aug)
  for (var k in orig) {
    (function (key) {
      if(!aug[key]) {
        if('function' == typeof orig[key]) {
          // if it's a function, return a function that binds to the orig.
          aug[key] = function () {
            return orig[key].apply(orig, arguments)
          }    
        } else {
          // else make a getter and setter that retrive the original property.
          aug.__defineGetter__(key, function () {
            return orig[key]
          })
          aug.__defineSetter__(key, function (val) {
            return orig[key] = val
          })
        }
      }
    })(k)
  }
  return aug
}

module.exports = 
function pipes () {
  var stack = [].slice.call(arguments)
  
  function connected (req, res, next) {
    function make(i) {
      return function (err, _req, _res) {
        // pass req, res, to each handler.
        // if a new req or res is passed through,
        // copy the props from the last stream.
        req = augment(req, _req)
        res = augment(res, _res)
          
        var _next = i+1 < stack.length ? make(i + 1) : next
          , arity = stack[i].length 

        if(err && arity == 4)
          stack[i](err, req, res, _next)
        else if (!err && arity < 4)
          stack[i](req, res, _next)
        else
          _next(err)            
      }
    }
    return make(0)() //call the first handler
  }
  connected.use = function (handler) {
    // could add support for a optional path here. 
    // (would automatically skip this middleware if the path doesn't a prefix of the url)
    // see https://github.com/senchalabs/connect/blob/master/lib/proto.js#L161

    stack.push(handler)
    return connected
  }
  return connected
}