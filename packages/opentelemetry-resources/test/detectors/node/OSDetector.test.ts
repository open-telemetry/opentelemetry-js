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
import * as sinon from 'sinon';
import { osDetector } from '../../../src';
import { describeNode } from '../../util';
import { ATTR_OS_TYPE, ATTR_OS_VERSION } from '../../../src/semconv';

describeNode('osDetector() on Node.js', () => {
  afterEach(() => {
    sinon.restore();
  });

  it('should return resource information from process', async () => {
    const os = require('os');

    sinon.stub(os, 'platform').returns('win32');
    sinon.stub(os, 'release').returns('2.2.1(0.289/5/3)');

    const resource = osDetector.detect();
    assert.ok(resource.attributes);

    assert.strictEqual(resource.attributes[ATTR_OS_TYPE], 'windows');
    assert.strictEqual(
      resource.attributes[ATTR_OS_VERSION],
      '2.2.1(0.289/5/3)'
    );
  });

  it('should pass through type string if unknown', async () => {
    const os = require('os');

    sinon.stub(os, 'platform').returns('some-unknown-platform');

    const resource = osDetector.detect();
    assert.ok(resource.attributes);

    assert.strictEqual(
      resource.attributes[ATTR_OS_TYPE],
      'some-unknown-platform'
    );
  });
});
