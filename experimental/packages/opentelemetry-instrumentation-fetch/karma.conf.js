/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

const karmaWebpackConfig = require('../../../karma.webpack');
const karmaBaseConfig = require('../../../karma.base');

module.exports = config => {
  config.set(
    Object.assign({}, karmaBaseConfig, {
      proxies: {
        '/mockServiceWorker.js': '/base/test/mockServiceWorker.js',
      },
      files: [...karmaBaseConfig.files, 'test/mockServiceWorker.js'],
      webpack: karmaWebpackConfig,
    })
  );
};
