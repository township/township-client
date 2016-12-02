# Township Auth Client

Client library to for users to login, register, etc. with a township auth server.

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

### `township.password(opts, cb)`

Reset password. `opts.email`, `opts.password`, `opts.token`, and `opts.newPassword` required.

### `township.config`

Get current login info, configuration, etc.

## License
[MIT](LICENSE.md)
