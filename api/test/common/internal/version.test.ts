/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import * as assert from 'assert';
import { VERSION } from '../../../src/version';

describe('version', function () {
  it('should have generated VERSION.ts', function () {
    // Skip in case we're not running in Node.js
    if (global.process?.versions?.node === undefined) {
      this.skip();
    }

    const pjson = require('../../../package.json');
    assert.strictEqual(pjson.version, VERSION);
  });

  it('prerelease tag versions are banned', function () {
    // see https://github.com/open-telemetry/opentelemetry-js-api/issues/74
    assert.ok(VERSION.match(/^\d+\.\d+\.\d+$/));
  });
});
