/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import * as assert from 'assert';
import * as sinon from 'sinon';
import { hostDetector } from '../../../src';
import { resourceFromDetectedResource } from '../../../src/ResourceImpl';
import { describeNode } from '../../util';
import {
  ATTR_HOST_ARCH,
  ATTR_HOST_ID,
  ATTR_HOST_NAME,
} from '../../../src/semconv';

describeNode('hostDetector() on Node.js', () => {
  afterEach(() => {
    sinon.restore();
  });

  it('should return resource information about the host', async () => {
    const os = require('os');
    const mid = require('../../../src/detectors/platform/node/machine-id/getMachineId');

    const expectedHostId = 'f2c668b579780554f70f72a063dc0864';

    sinon.stub(os, 'arch').returns('x64');
    sinon.stub(os, 'hostname').returns('opentelemetry-test');
    sinon.stub(mid, 'getMachineId').returns(Promise.resolve(expectedHostId));

    const resource = resourceFromDetectedResource(hostDetector.detect());
    await resource.waitForAsyncAttributes?.();

    assert.strictEqual(
      resource.attributes[ATTR_HOST_NAME],
      'opentelemetry-test'
    );
    assert.strictEqual(resource.attributes[ATTR_HOST_ARCH], 'amd64');
    assert.strictEqual(resource.attributes[ATTR_HOST_ID], expectedHostId);
  });

  it('should pass through arch string if unknown', async () => {
    const os = require('os');

    sinon.stub(os, 'arch').returns('some-unknown-arch');

    const resource = resourceFromDetectedResource(hostDetector.detect());

    assert.strictEqual(
      resource.attributes[ATTR_HOST_ARCH],
      'some-unknown-arch'
    );
  });

  it('should handle missing machine id', async () => {
    const os = require('os');
    const mid = require('../../../src/detectors/platform/node/machine-id/getMachineId');

    sinon.stub(os, 'arch').returns('x64');
    sinon.stub(os, 'hostname').returns('opentelemetry-test');
    sinon.stub(mid, 'getMachineId').returns(Promise.resolve(undefined));

    const resource = resourceFromDetectedResource(hostDetector.detect());
    await resource.waitForAsyncAttributes?.();

    assert.strictEqual(
      resource.attributes[ATTR_HOST_NAME],
      'opentelemetry-test'
    );
    assert.strictEqual(resource.attributes[ATTR_HOST_ARCH], 'amd64');
    assert.strictEqual(false, ATTR_HOST_ID in resource.attributes);
  });
});
