/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
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
