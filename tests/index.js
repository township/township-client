var path = require('path')
var test = require('tape')

var TownshipClient = require('..')
var createServer = require('./server')
var server
var address
var client

test('start test server', function (t) {
  createServer(function (err, serv, add) {
    if (err) throw err
    server = serv
    address = add

    client = TownshipClient({
      server: address,
      config: {
        filepath: path.join(__dirname, 'test.txt')
      }
    })

    t.end()
  })
})

test('register', function (t) {
  client.register({email: 'joe', password: 'verysecret'}, function (err) {
    t.error(err)
    t.pass('registers')
    t.end()
  })
})

test('login okay', function (t) {
  client.login({email: 'joe', password: 'verysecret'}, function (err) {
    t.error(err)
    t.pass('login okay')
    t.end()
  })
})

test('login wrong pw', function (t) {
  client.login({email: 'joe', password: 'notsecret'}, function (err) {
    t.ok(err, 'errors')
    t.end()
  })
})

test('login wrong email', function (t) {
  client.login({email: 'notjoe', password: 'stillsecret'}, function (err) {
    t.ok(err, 'errors')
    t.end()
  })
})

test('change pw', function (t) {
  t.fail('todo')
  t.end()
})

test('stop test server', function (t) {
  server.close(function () {
    t.end()
  })
})
