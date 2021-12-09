const path = require('path');
const directory = path.resolve(__dirname);

module.exports = {
  entry: {
    fetch: 'pages/fetch/index.js',
    fetch_worker: 'pages/fetch_worker/worker.js',
    fetch_worker_index: 'pages/fetch_worker/index.js',
    xhr: 'pages/xhr/index.js',
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js',
    sourceMapFilename: '[file].map',
  },
  target: 'webworker',
  module: {
    rules: [
      {
        test: /\.js[x]?$/,
        exclude: /(node_modules)/,
        use: {
          loader: 'babel-loader',
          options: {
            babelrc: false,
            configFile: path.resolve(__dirname, 'babel.config.js'),
            presets: ['@babel/preset-env'],
          },
        },
      },
    ],
  },
  resolve: {
    modules: [
      path.resolve(directory),
      'node_modules',
    ],
    extensions: ['.ts', '.js', '.jsx', '.json'],
  },
};
