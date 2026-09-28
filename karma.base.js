/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

module.exports = {
  listenAddress: 'localhost',
  hostname: 'localhost',
  browsers: ['ChromeHeadless'],
  frameworks: ['mocha'],
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
