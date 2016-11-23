var assert = require('assert')
var fs = require('fs')
var path = require('path')
var homedir = require('os-homedir')
var isNumber = require('is-number')
var isString = require('is-string')
var req = require('nets')

module.exports = TownshipClient

function TownshipClient (opts) {
  if (!(this instanceof TownshipClient)) return new TownshipClient(opts)

  var self = this
  self.config = self._config(opts.config)
  self.config.init()
  if (opts.server) self.server = opts.server.indexOf('http') > -1 ? opts.server : 'https://' + opts.server
  else if (config.currentLogin) self.server = config.currentLogin.server

  self.register = function (opts, cb) {
    assert.ok(opts.server || self.server, 'server must be specified before making auth request')
    if (!opts.password) return cb(new Error('password is required to register'))
    if (!opts.email) return cb(new Error('email is required to register'))
    var server = opts.server || self.server

    return self._request({
      method: 'POST',
      url: server + '/auth',
      json: {
        email: opts.email,
        password: opts.password
      }
    }, function (err, res, body) {
      if (err) return cb(err.message)
      body.server = server
      body.email = opts.email
      self.config.setLogin(body)
      cb()
    })
  }

  self.login = function (opts, cb) {
    assert.ok(opts.server || self.server, 'server must be specified before making auth request')
    if (!opts.email) return cb(new Error('email is required to login'))
    var server = opts.server || self.server

    return self._request({
      method: 'POST',
      url: server + '/auth/verify',
      json: {
        email: opts.email,
        password: opts.password
      }
    }, function (err, res, body) {
      if (err) return cb(err.message)
      body.server = server
      body.email = opts.email
      self.config.setLogin(body)
      cb()
    })
  }

  self.password = function (opts, cb) {
    assert.ok(opts.server || self.server, 'server must be specified before making auth request')
    if (!opts.email) return cb(new Error('email is required to change password'))
    if (!opts.token) return cb(new Error('token is required to change password'))
    if (!opts.currentPassword) return cb(new Error('new password is required to change password'))
    if (!opts.newPassword) return cb(new Error('old password is required to change password'))
    var server = opts.server || self.server

    return self._request({
      method: 'POST',
      url: server + '/auth/password',
      json: {
        email: opts.email,
        token: opts.token,
        currentPassword: opts.currentPassword,
        newPassword: opts.newPassword
      }
    }, cb)
  }

  return self
}

TownshipClient.prototype._request = function (opts, cb) {
  return req(opts, function (err, res, body) {
    if (err) return cb(err)
    if (res.statusCode >= 400) return cb(body)
    return cb(null, res, body)
  })
}

TownshipClient.prototype._config = function (opts) {
  var self = this
  opts = opts || {}
  var config = {}
  config.filename = opts.filename || '.townshiprc'
  config.filepath = opts.filepath || path.join(homedir(), config.filename)

  config.init = function () {
    if (config.read()) {
      return
    } else {
      config.write({
        currentLogin: null,
        logins: []
      })
    }
  }

  config.read = function () {
    var file

    try {
      file = fs.readFileSync(config.filepath, 'utf8')
    } catch (err) {
      // file not found
    }

    if (!file || file instanceof Error) return false
    return JSON.parse(file)
  }

  config.write = function (data) {
    var file = JSON.stringify(data, true, 2)
    fs.writeFileSync(config.filepath, file)
  }

  config.get = function (key) {
    var data = config.read()
    if (!key) return data
    var keys = parseKeys(key)
    var current = keys[0]
    if (keys.length === 1) return data[current]
  }

  config.set = function (key, value) {
    var data = config.read()
    var keys = parseKeys(key)
    var current = keys[0]

    if (keys.length === 1) {
      data[current] = value
      config.write(data)
    }
  }

  config.getLogin = function (server) {
    var logins = config.get('logins')

    if (!server) {
      return config.get('currentLogin')
    }

    var login = logins.find(function (item) {
      if (item === null) return
      return item.server === server
    })

    if (!login) return false
    login.server = server
    return login
  }

  config.setLogin = function (opts) {
    config._setLogin(opts)
    self.server = config.currentLogin.server
  }

  config._setLogin = function (opts) {
    var logins = config.get('logins')
    var found = false

    logins = logins.map(function (login) {
      if (login === null) return
      if (login.server === opts.server) {
        found = true
        return opts
      }
    })

    if (!found) {
      logins.push(opts)
    }

    config.set('logins', logins)
    config.set('currentLogin', opts)
  }

  function parseKeys (key) {
    if (isString(key)) {
      var keys = key.split('.').map(function (key) {
        if (isNumber(key)) return parseInt(key)
        return key
      })
      return keys
    }
    return key
  }

  return config
}
