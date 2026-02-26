/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import * as sinon from 'sinon';
import * as assert from 'assert';
import { promises as fs } from 'fs';
import { PromiseWithChild } from 'child_process';
import * as util from '../../../../src/detectors/platform/node/machine-id/execAsync';
import { getMachineId } from '../../../../src/detectors/platform/node/machine-id/getMachineId-bsd';

describe('getMachineId on BSD', () => {
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
    const fsStub = sinon
      .stub(fs, 'readFile')
      .returns(Promise.reject(new Error('not found')));

    const execStub = sinon.stub(util, 'execAsync').returns(
      Promise.resolve({
        stdout: fileContents,
        stderr: '',
      }) as PromiseWithChild<{ stdout: string; stderr: string }>
    );

    const machineId = await getMachineId();

    assert.equal(machineId, expectedMachineId);
    assert.equal(fsStub.callCount, 1);
    assert.equal(execStub.callCount, 1);
  });

  it('handles failure to read primary and fallback', async () => {
    const fsStub = sinon
      .stub(fs, 'readFile')
      .returns(Promise.reject(new Error('not found')));

    const execStub = sinon.stub(util, 'execAsync').returns(
      Promise.reject(new Error('not found')) as PromiseWithChild<{
        stdout: string;
        stderr: string;
      }>
    );

    const machineId = await getMachineId();

    assert.strictEqual(machineId, undefined);
    assert.equal(fsStub.callCount, 1);
    assert.equal(execStub.callCount, 1);
  });
});
