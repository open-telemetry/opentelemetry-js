// eslint-disable-next-line import/no-extraneous-dependencies
const webpack = require('webpack');
// eslint-disable-next-line import/no-extraneous-dependencies
const webpackMerge = require('webpack-merge');
const path = require('path');

const directory = path.resolve(__dirname);

const common = {
  mode: 'production',
  entry: {
    metrics: 'examples/metrics/index.js',
    fetch: 'examples/fetch/index.js',
    'xml-http-request': 'examples/xml-http-request/index.js',
    fetchXhr: 'examples/fetchXhr/index.js',
    fetchXhrB3: 'examples/fetchXhrB3/index.js',
    zipkin: 'examples/zipkin/index.js',
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js',
    sourceMapFilename: '[file].map',
  },
  target: 'web',
  module: {
    rules: [
      {
        test: /\.js[x]?$/,
        exclude: /(node_modules)/,
        use: {
          loader: 'babel-loader',
        },
      },
      {
        test: /\.ts$/,
        exclude: /(node_modules)/,
        use: {
          loader: 'ts-loader',
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
  optimization: {
    minimize: true,
  },
};

module.exports = webpackMerge.merge(common, {
  devtool: 'source-map',
  devServer: {
    static: {
      directory: path.resolve(__dirname, 'examples'),
    },
    compress: true,
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('production'),
    }),
  ],
});
