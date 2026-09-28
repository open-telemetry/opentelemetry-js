/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

const baseConfig = require('./karma.base');

module.exports = {
  ...baseConfig,
  frameworks: ['mocha-webworker'],

  files: [{
    pattern: 'test/index-webpack.worker.ts',
    included: false,
  }],
};
