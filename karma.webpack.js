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
      // tsdown's CJS output for instrumentation's `instrumentationNodeModuleFile.ts`
      // inlines `path.normalize` from `platform/node/normalize.ts` (instead of
      // preserving the platform indirection like ESM does), so the dist-level
      // browser swap can't catch it. Stub `path` to an empty module for the browser
      // bundle — InstrumentationNodeModuleFile is a node-only class and browser code
      // paths never reach `path.normalize`. If that assumption ever breaks, the
      // failure will be loud: `TypeError: path.normalize is not a function`.
      "path": false,
    },
  },
  devtool: 'eval-source-map',
  plugins: [
    // Karma+webpack bundles each package's src/ directly, so the dist-level
    // `package.json#browser` field doesn't apply during tests. This plugin
    // performs the equivalent test-time path-swap at the source level —
    // `./platform`, `./platform/index`, `./detectors/platform` (and their
    // `/index` variants) get rewritten to their `/browser/` equivalents.
    // Skipped for issuers in node_modules (third-party packages).
    new webpack.NormalModuleReplacementPlugin(
      /(^|[\\/])(?:detectors[\\/])?platform([\\/]index(\.ts)?)?$/,
      function (resource) {
        if (/[\\/]browser([\\/]|$)/.test(resource.request)) return;
        const issuer = resource.contextInfo && resource.contextInfo.issuer;
        if (!issuer || /[\\/]node_modules[\\/]/.test(issuer)) return;
        const original = resource.request;
        const rewritten = original.replace(
          /platform([\\/]index)?$/,
          'platform/browser$1'
        );
        if (rewritten === original) {
          throw new Error(
            `karma platform-swap: outer regex matched ${JSON.stringify(original)} ` +
            `but inner replace did not rewrite it. The two regexes have drifted out of sync.`
          );
        }
        resource.request = rewritten;
      }
    ),
    new webpack.ProvidePlugin({
      // Make a global `process` variable that points to the `process` package,
      // because the `util` package expects there to be a global variable named `process`.
      // Thanks to https://stackoverflow.com/a/65018686/14239942
      // NOTE: I wish there was a better way as this pollutes the tests with a defined 'process' global.
      process: 'process/browser.js'
    }),
    // Benchmark.js checks for AMD's define function which doesn't exist in webpack.
    // NOTE: This pollutes tests with a defined 'self.define' global.
    new webpack.BannerPlugin({
      banner: 'self.define = self.define || Object.assign(function(){}, {amd: false});',
      raw: true
    })
  ],
  module: {
    rules: [
      {
        test: /\.ts$/,
        // transpileOnly skips type checking and the composite-project lookup
        // for `.tsbuildinfo`. We use tsdown for actual builds and don't run
        // `tsc -b`, so `composite` is set in tsconfig.base.json but no
        // `.tsbuildinfo` exists. ts-loader's default mode requires one;
        // transpileOnly bypasses that.
        use: { loader: 'ts-loader', options: { transpileOnly: true } },
      },
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
