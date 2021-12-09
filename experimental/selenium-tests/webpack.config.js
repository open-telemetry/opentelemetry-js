const webpack = require('webpack');
const webpackMerge = require('webpack-merge');
const path = require('path');

const directory = path.resolve(__dirname);

const common = {
  mode: 'development',
  entry: {
    fetch: 'pages/fetch/index.js',
    // xhr: 'pages/xhr/index.js',
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
          options: {
            babelrc: false,
            configFile: path.resolve(__dirname, 'babel.config.js'),
            presets: ['@babel/preset-env'],
          },
        },
        include: [
          path.resolve(__dirname, 'pages/helper.js'),
        ],
      },
    ],
  },
  resolve: {
    modules: [
      path.resolve(directory),
      'node_modules',
    ],
    extensions: ['.js', '.jsx', '.json'],
  },
};

module.exports = webpackMerge(common, {
  devtool: 'eval-source-map',
  devServer: {
    static: path.resolve(__dirname),
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('development'),
    }),
  ],
});
