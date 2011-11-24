

var test = require('tap').test
  , pipes = require('../pipes')
  , a = require('assertions')
  ;

test('simple example', function (t) {

  var _req = {}, _res = {}

  var h = pipes(
    function (req, res, next) {
      t.equal(req, _req, 'first arg is request')
      t.equal(req, _req, 'first arg is request')
//      t.equal(typeof next, 'function', 'next must be function')
      t.end()
    }
  )  
  h(_req, _res)
})

test('2 handlers', function (t) {
  var _req = {}, _res = {}
  var h = pipes(
    function (req, res, next) {
      t.equal(req, _req, 'first arg is request')
      t.equal(req, _req, 'first arg is response')
      t.equal(typeof next, 'function', 'next must be function')
      next()
    }, function (req, res, next) {
      t.equal(req, _req, 'first arg is still request in second handler')
      t.equal(req, _req, 'first arg is still response in second handler')
      t.end()
    }
  )  
  h(_req, _res)
})

test('error handler', function (t) {
  var _req = {}, _res = {}, _err = new Error('EXAMPLE')
  t.plan(6)
  var h = pipes(
    function (req, res, next) {
      t.equal(req, _req, 'first arg is request')
      t.equal(req, _req, 'first arg is response')
      t.equal(typeof next, 'function', 'next must be function')
      next(_err)
    },
    function (req, res, next) {
      t.fail('non error handler should get skipped')
      t.end()
    },
    function (err, req, res, next) {
      t.equal(req, _req, 'first arg is still request in second handler')
      t.equal(req, _req, 'first arg is still response in second handler')
      t.equal(err, _err, 'error should be passed to handler with arity == 4')
      t.end()
    }
  )  
  h(_req, _res)
})

test('skip error handler, if not error', function (t) {
  var _req = {}, _res = {}, _err = new Error('EXAMPLE')
  t.plan(5)
  var h = pipes(
    function (req, res, next) {
      t.equal(req, _req, 'first arg is request')
      t.equal(req, _req, 'first arg is response')
      t.equal(typeof next, 'function', 'next must be function')
      next()
    },
    function (err, req, res, next) {
      t.fail('non error handler should get skipped')
      t.end()
    },
    function (req, res, next) {
      t.equal(req, _req, 'first arg is still request in second handler')
      t.equal(req, _req, 'first arg is still response in second handler')
      t.end()
    }
  )
  h(_req, _res)
})


test('pipes handler accepts next callback', function (t) {
  var _req = {}, _res = {}, _err = new Error('EXAMPLE')
  t.plan(2)
  var d = pipes(
    function (req, res, next) {
      t.ok(true, 'called handler')
      next()
    }
  )
  d(_req, _res, function () {
    t.ok(true, "called handler's next")
    t.end()
  })
})


test('copies req and res', function (t) {
  var _req = {a: true}, _res = {b: true}
  t.plan(3)
  var h = pipes(
    function (req, res, next) {
      t.equal(req, _req)
      t.equal(res, _res)
      next (null, {c: true}, {d: true})
    },
    function (req, res, next) {
      a.deepEqual(req, {a: true, c: true}, 'req should be augmented with new properties')
      a.deepEqual(res, {b: true, d: true}, 'req should be augmented with new properties')
      t.ok(true)
      t.end()
    })
  
  h(_req, _res)

})