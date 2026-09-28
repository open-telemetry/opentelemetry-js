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

  it('is a release or a development/rc pre-release', function () {
    // Arbitrary prerelease tags used to be banned outright
    // (https://github.com/open-telemetry/opentelemetry-js-api/issues/74). The release
    // workflow can now cut `development` and `rc` pre-releases of the API, which go out on
    // the `canary` dist-tag - see doc/contributing/releasing.md. Any other pre-release tag
    // is still a mistake: _makeCompatibilityCheck() in src/internal/semver.ts degrades to
    // exact string equality as soon as a version carries one, so it must only ever happen
    // deliberately, for a version nobody gets from a plain `npm install`.
    assert.ok(
      VERSION.match(/^\d+\.\d+\.\d+(-(development|rc)\.\d+)?$/),
      `unexpected version: ${VERSION}`
    );
  });
});
