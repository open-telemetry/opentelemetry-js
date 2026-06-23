/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

const karmaWebpackConfig = require('../../karma.webpack');
const karmaBaseConfig = require('../../karma.base');

module.exports = (config) => {
  config.set(Object.assign({}, karmaBaseConfig, {
    frameworks: karmaBaseConfig.frameworks.concat(['jquery-1.8.3']),
    webpack: karmaWebpackConfig
  }))
};
