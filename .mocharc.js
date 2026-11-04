/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

const path = require('path');

module.exports = {
  require: [
    'ts-node/register',
    path.join(__dirname, 'scripts/mocha-otel-condition.cjs'),
  ],
};
