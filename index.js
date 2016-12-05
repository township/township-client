var assert = require('assert')
var request = require('nets')
var Config = require('./lib/config')

module.exports = TownshipClient

function TownshipClient (opts) {
  if (!(this instanceof TownshipClient)) return new TownshipClient(opts)

  var self = this
  self.config = Config(opts.config)
  self.config.init()
  self.server = opts.server
    ? opts.server.indexOf('http') > -1
      ? opts.server
      : 'https://' + opts.server
    : self.config.getLogin().server

  self.routes = opts.routes || {
    register: '/register',
    login: '/login',
    updatePassword: '/updatepassword'
  }

  return self
}

TownshipClient.prototype.register = function (opts, cb) {
  opts = opts || {}
  if (!opts.email) return cb(new Error('Email is required to register'))
  if (!opts.password) return cb(new Error('Password is required to register'))

  var self = this
  var server = self._getServer(opts)

  return self._request({
    method: 'POST',
    server: server,
    url: server + self.routes.register,
    json: {
      email: opts.email,
      password: opts.password
    }
  }, function (err, res, body) {
    if (err) return cb(err.message)
    body.server = server
    body.email = opts.email
    self.config.setLogin(body)
    self.server = server
    cb()
  })
}

TownshipClient.prototype.login = function (opts, cb) {
  opts = opts || {}
  if (!opts.email) return cb(new Error('Email is required to login'))
  if (!opts.password) return cb(new Error('Password is required to login'))

  var self = this
  var server = self._getServer(opts)

  return self._request({
    method: 'POST',
    server: server,
    url: server + self.routes.login,
    json: {
      email: opts.email,
      password: opts.password
    }
  }, function (err, res, body) {
    if (err) return cb(err.message)
    body.server = server
    body.email = opts.email
    self.config.setLogin(body)
    self.server = server
    cb()
  })
}

TownshipClient.prototype.updatePassword = function (opts, cb) {
  opts = opts || {}
  if (!opts.email) return cb(new Error('Email is required to change password'))
  if (!opts.password) return cb(new Error('Password is required to change password'))
  if (!opts.newPassword) return cb(new Error('New password is required to change password'))

  var self = this
  var server = self._getServer(opts)

  return self._request({
    method: 'POST',
    server: server,
    url: server + self.routes.updatePassword,
    json: {
      email: opts.email,
      password: opts.password,
      newPassword: opts.newPassword
    }
  }, function (err, res, body) {
    if (err) return cb(err.message)
    body.server = server
    body.email = opts.email
    self.config.setLogin(body)
    self.server = server
    cb()
  })
}

TownshipClient.prototype.getLogin = function (server) {
  var self = this
  server = self._getServer({server: server})
  return self.config.getLogin(server)
}

TownshipClient.prototype._getServer = function (opts) {
  opts = opts || {}
  assert.ok(opts.server || this.server, 'Server must be specified to make an auth request')
  return opts.server || this.server
}

TownshipClient.prototype.secureRequest = function (opts, cb) {
  var self = this
  var server = self._getServer(opts)

  if (!self.getLogin(server)) return cb(new Error('Must login to server for secure request.'))
  if (!opts.server) opts.server = server
  opts.url = opts.url
    ? opts.url.indexOf(server) > -1
      ? opts.url
      : server + opts.url
    : server // TODO: Error here if no URL?

  return self._request(opts, cb)
}

TownshipClient.prototype._request = function (opts, cb) {
  var self = this
  opts.token = opts.token || self.getLogin(opts.server).token

  if (opts.token) {
    opts.withCredentials = true
    opts.headers = { authorization: 'Bearer ' + opts.token }
  } else {
    delete opts.token // Throwing errors in server
  }

  return request(opts, function (err, res, body) {
    if (err) return cb(err)
    if (res.statusCode >= 400) return cb(body)
    return cb(null, res, body)
  })
}
