/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
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
