/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import * as assert from 'assert';
import { VERSION } from '../../../src/version';

describe('version', function () {
  it('should have generated VERSION.ts', function () {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const pjson = require('../../../package.json');
    assert.strictEqual(pjson.version, VERSION);
  });

  it('prerelease tag versions are banned', function () {
    // see https://github.com/open-telemetry/opentelemetry-js-api/issues/74
    assert.ok(VERSION.match(/^\d+\.\d+\.\d+$/));
  });
});
