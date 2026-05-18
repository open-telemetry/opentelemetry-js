/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

module.exports = {
  env: {
    mocha: true,
    commonjs: true,
    node: true,
    browser: true,
  },
  ...require('../../eslint.base.js'),
};
