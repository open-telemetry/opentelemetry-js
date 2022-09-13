module.exports = {
  // Enable the assert library polyfill because that is used in tests
  assert: true,
  // The assert polyfill from github.com/browserify/commonjs-assert
  // also requires the `global` polyfill.
  global: true,

  // Turn off all other Node.js API polyfills for the browser tests to
  // make sure that we are not attempting to use Node-specific APIs in
  // the browser code. Instead, we will write browser specific
  // implementations of platform functionality we need under the
  // `./src/platform/browser` folder. This allows for writing browser
  // optimized implementations of the specific needed functionality
  // rather than bringing in (sometimes large) polyfills for the
  // corresponding Node APIs.
  Buffer: false,
  __dirname: false,
  __filename: false,
  buffer: false,
  child_process: false,
  cluster: false,
  console: false,
  constants: false,
  crypto: false,
  dgram: false,
  dns: false,
  domain: false,
  events: false,
  fs: false,
  http: false,
  https: false,
  module: false,
  net: false,
  os: false,
  path: false,
  process: false,
  punycode: false,
  querystring: false,
  readline: false,
  repl: false,
  setImmediate: false,
  stream: false,
  string_decoder: false,
  sys: false,
  timers: false,
  tls: false,
  tty: false,
  url: false,
  util: false,
  vm: false,
  zlib: false
};
