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
import { promises as fs } from 'fs';

import { getMachineId } from '../../../../src/detectors/platform/node/machine-id/getMachineId-linux';

describe('getMachineId on linux', () => {
  const expectedMachineId = 'f2c668b579780554f70f72a063dc0864';
  const fileContents = `${expectedMachineId}\n`;

  afterEach(() => {
    sinon.restore();
  });

  it('reads machine-id from primary', async () => {
    const stub = sinon
      .stub(fs, 'readFile')
      .returns(Promise.resolve(fileContents));

    const machineId = await getMachineId();

    assert.equal(machineId, expectedMachineId);
    assert.equal(stub.callCount, 1);
  });

  it('reads machine-id from fallback when primary fails', async () => {
    const stub = sinon
      .stub(fs, 'readFile')
      .onFirstCall()
      .returns(Promise.reject(new Error('not found')))
      .onSecondCall()
      .returns(Promise.resolve(fileContents));

    const machineId = await getMachineId();

    assert.equal(machineId, expectedMachineId);
    assert.equal(stub.callCount, 2);
  });

  it('handles failure to read primary and fallback', async () => {
    const stub = sinon
      .stub(fs, 'readFile')
      .returns(Promise.reject(new Error('not found')));

    const machineId = await getMachineId();

    assert.strictEqual(machineId, undefined);
    assert.equal(stub.callCount, 2);
  });
});
