# Township Auth Client Module

[![Travis](https://travis-ci.org/joehand/township-client.svg)](https://travis-ci.org/joehand/township-client) [![npm](https://img.shields.io/npm/v/township-client.svg?style=flat-square)](https://npmjs.org/package/township-client)

Client library to for users to login, register, change password with a [township](https://github.com/township/township) auth server.

## API

### `var township = Township(opts)`

Options include:

```js
opts = {
  server: 'https://api.township.com',// Township API server
  config: {
    filename: '.townshiprc', // configuration filename (stored in os homedir)
    filepath: '~/.townshiprc' // full config file path 
  }
}
```

### `township.register(opts, cb)`

`opts.email` and `opts.password` required.

### `township.login(opts, cb)`

`opts.email` required

### `township.changePassword(opts, cb)`

Reset password. `opts.email`, `opts.password`, and `opts.newPassword` required.

### `var config = township.config`

Get current login info, configuration, etc.

### `config.get('currentLogin')`

Get the current login information.

#### `config.getLogin([server])`

Get current login info, or login info for a `server`.

## License
[MIT](LICENSE.md)
