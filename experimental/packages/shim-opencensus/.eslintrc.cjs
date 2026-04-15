/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

const config = {
  env: {
    mocha: true,
    node: true,
  },
  ...require('../../../eslint.base.js'),
};

config.overrides.push({
  // this file has code from the OpenCensus project, so we want to keep the original header.
  files: ['src/OpenCensusMetricProducer.ts'],
  rules: {
    'header/header': 'off',
  },
});

module.exports = config;
