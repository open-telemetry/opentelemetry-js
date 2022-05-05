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

const webpackNodePolyfills = require('./webpack.node-polyfills.js');

// This is the webpack configuration for browser Karma tests with coverage.
module.exports = {
  mode: 'development',
  target: 'web',
  output: { filename: 'bundle.js' },
  resolve: { extensions: ['.ts', '.js'] },
  devtool: 'eval-source-map',
  module: {
    rules: [
      { test: /\.ts$/, use: 'ts-loader' },
      {
        enforce: 'post',
        exclude: /(node_modules|\.test\.[tj]sx?$)/,
        test: /\.ts$/,
        use: {
          loader: 'istanbul-instrumenter-loader',
          options: { esModules: true }
        }
      },
      // This setting configures Node polyfills for the browser that will be
      // added to the webpack bundle for Karma tests.
      { parser: { node: webpackNodePolyfills } }
    ]
  }
};
