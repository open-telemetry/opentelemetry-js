const webpack = require('webpack');
const webpackMerge = require('webpack-merge');
const path = require('path');
const mainPath = path.resolve('');
const directory = path.resolve(__dirname);

const common = {
  mode: 'development',
  entry: 'index.js',
  target: 'web',
  module: {
    rules: [
      {
        test: /\.js[x]?$/,
        exclude: /(node_modules)/,
        use: {
          loader: 'babel-loader'
        }
      },
      {
        test: /\.ts$/,
        exclude: /(node_modules)/,
        use: {
          loader: 'ts-loader'
        }
      }
    ]
  },
  plugins: [
    new webpack.ProvidePlugin({
      jQuery: 'jquery',
      $: 'jquery',
      jquery: 'jquery',
      'window.jQuery': 'jquery'
    })
  ],
  resolve: {
    modules: [
      path.resolve(mainPath, 'src'),
      path.resolve(directory),
      'node_modules'
    ],
    extensions: ['.ts', '.js', '.jsx', '.json']
  }
};

module.exports = webpackMerge(common, {
  devtool: 'eval-source-map',
  output: {
    filename: 'bundle.js',
    sourceMapFilename: '[file].map'
  },
  devServer: {
    contentBase: path.resolve(__dirname),
    // contentBase: path.resolve('.'),
    // historyApiFallback: true
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('development')
    })
  ]
});
