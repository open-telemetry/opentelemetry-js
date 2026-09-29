/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

module.exports = {
  listenAddress: 'localhost',
  hostname: 'localhost',
  browsers: ['ChromeHeadless'],
  frameworks: ['mocha'],
  // Karma's default 'karma-*' scan only sees plugins hoisted beside karma
  // itself; requiring them here resolves from the repo root in any layout.
  plugins: [
    require('karma-chrome-launcher'),
    require('karma-coverage'),
    require('karma-mocha'),
    require('karma-mocha-webworker'),
    require('karma-spec-reporter'),
    require('karma-webpack'),
  ],
  coverageReporter: {
    type : 'json',
    subdir: '.',
    dir : 'coverage/'
  },
  reporters: ['spec', 'coverage'],
  files: ['test/index-webpack.ts'],
  preprocessors: {
    'test/index-webpack*.ts': ['webpack']
  },
  webpackMiddleware: { noInfo: true }
};
