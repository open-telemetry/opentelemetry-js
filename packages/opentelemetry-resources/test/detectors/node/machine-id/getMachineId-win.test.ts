/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import * as sinon from 'sinon';
import * as assert from 'assert';
import { PromiseWithChild } from 'child_process';
import * as util from '../../../../src/detectors/platform/node/machine-id/execAsync';
import { getMachineId } from '../../../../src/detectors/platform/node/machine-id/getMachineId-win';

describe('getMachineId on Windows', () => {
  const expectedMachineId = 'fe11b90a-d48c-4c3b-b386-e40cc383fd30';
  const cmdOutput =
    '\n    MachineGuid    REG_SZ    fe11b90a-d48c-4c3b-b386-e40cc383fd30\n';

  afterEach(() => {
    sinon.restore();
  });

  it('reads machine-id', async () => {
    const stub = sinon.stub(util, 'execAsync').returns(
      Promise.resolve({ stdout: cmdOutput, stderr: '' }) as PromiseWithChild<{
        stdout: string;
        stderr: string;
      }>
    );

    const machineId = await getMachineId();

    assert.equal(machineId, expectedMachineId);
    assert.equal(stub.callCount, 1);
  });

  it('handles failure', async () => {
    const stub = sinon.stub(util, 'execAsync').returns(
      Promise.reject(new Error('not found')) as PromiseWithChild<{
        stdout: string;
        stderr: string;
      }>
    );

    const machineId = await getMachineId();

    assert.strictEqual(machineId, undefined);
    assert.equal(stub.callCount, 1);
  });
});
