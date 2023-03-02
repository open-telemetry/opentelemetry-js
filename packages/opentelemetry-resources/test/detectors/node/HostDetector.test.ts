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

import * as sinon from 'sinon';
import * as assert from 'assert';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';
import { describeNode } from '../../util';
import { hostDetector, IResource } from '../../../src';

describeNode('hostDetector() on Node.js', () => {
  afterEach(() => {
    sinon.restore();
  });

  it('should return resource information about the host', async () => {
    const os = require('os');
    const mid = require('../../../src/platform/node/machine-id/getMachineId');

    const expectedHostId = 'f2c668b579780554f70f72a063dc0864';

    sinon.stub(os, 'arch').returns('x64');
    sinon.stub(os, 'hostname').returns('opentelemetry-test');
    sinon.stub(mid, 'getMachineId').returns(Promise.resolve(expectedHostId));

    const resource: IResource = await hostDetector.detect();
    await resource.waitForAsyncAttributes?.();

    assert.strictEqual(
      resource.attributes[SemanticResourceAttributes.HOST_NAME],
      'opentelemetry-test'
    );
    assert.strictEqual(
      resource.attributes[SemanticResourceAttributes.HOST_ARCH],
      'amd64'
    );
    assert.strictEqual(
      resource.attributes[SemanticResourceAttributes.HOST_ID],
      expectedHostId
    );
  });

  it('should pass through arch string if unknown', async () => {
    const os = require('os');

    sinon.stub(os, 'arch').returns('some-unknown-arch');

    const resource: IResource = await hostDetector.detect();

    assert.strictEqual(
      resource.attributes[SemanticResourceAttributes.HOST_ARCH],
      'some-unknown-arch'
    );
  });

  it('should handle missing machine id', async () => {
    const os = require('os');
    const mid = require('../../../src/platform/node/machine-id/getMachineId');

    sinon.stub(os, 'arch').returns('x64');
    sinon.stub(os, 'hostname').returns('opentelemetry-test');
    sinon.stub(mid, 'getMachineId').returns(Promise.resolve(''));

    const resource: IResource = await hostDetector.detect();
    await resource.waitForAsyncAttributes?.();

    assert.strictEqual(
      resource.attributes[SemanticResourceAttributes.HOST_NAME],
      'opentelemetry-test'
    );
    assert.strictEqual(
      resource.attributes[SemanticResourceAttributes.HOST_ARCH],
      'amd64'
    );
    assert.strictEqual(
      false,
      SemanticResourceAttributes.HOST_ID in resource.attributes
    );
  });
});
