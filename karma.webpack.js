/*!
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

const webpack = require('webpack')

// This is the webpack configuration for browser Karma tests with coverage.
module.exports = {
  mode: 'development',
  target: 'web',
  output: {filename: 'bundle.js'},
  resolve: {
    extensions: ['.ts', '.js'],
    fallback: {
      // Enable the assert library polyfill because that is used in tests
      "assert": require.resolve('assert/'),
      "util": require.resolve('util/'),
    },
  },
  devtool: 'eval-source-map',
  plugins: [
    new webpack.ProvidePlugin({
      // Make a global `process` variable that points to the `process` package,
      // because the `util` package expects there to be a global variable named `process`.
      // Thanks to https://stackoverflow.com/a/65018686/14239942
      // NOTE: I wish there was a better way as this pollutes the tests with a defined 'process' global.
      process: 'process/browser.js'
    })
  ],
  module: {
    rules: [
      {test: /\.ts$/, use: 'ts-loader'},
      {
        test: /\.js$/,
        exclude: {
          and: [/node_modules/], // Exclude libraries in node_modules ...
          not: [
            // Except for a few of them that needs to be transpiled because they use modern syntax
            /zone.js/,
          ],
        },
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'],
          }
        },
      },
      {
        enforce: 'post',
        exclude: /(node_modules|\.test\.[tj]sx?$)/,
        test: /\.ts$/,
        use: {
          loader: 'babel-loader',
          options: {
            plugins: ['babel-plugin-istanbul'],
          }
        },
      },
    ],
  },
};
