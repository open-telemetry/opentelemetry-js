/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import * as sinon from 'sinon';
import * as assert from 'assert';
import { PromiseWithChild } from 'child_process';
import * as util from '../../../../src/detectors/platform/node/machine-id/execAsync';
import { getMachineId } from '../../../../src/detectors/platform/node/machine-id/getMachineId-darwin';

describe('getMachineId on Darwin', () => {
  const expectedMachineId = '81895B8D-9EF9-4EBB-B5DE-B00069CF53F0';
  const cmdOutput =
    '+-o J316sAP  <class IOPlatformExpertDevice, id 0x10000024d, registered, matched, active, busy 0 (132196 ms), retain 37>\n' +
    '{\n' +
    '  "IOPolledInterface" = "AppleARMWatchdogTimerHibernateHandler is not serializable"\n' +
    '  "#address-cells" = <02000000>\n' +
    '  "AAPL,phandle" = <01000000>\n' +
    '  "serial-number" = <94e1c79ec04cd3f153f600000000000000000000000000000000000000000000>\n' +
    '  "IOBusyInterest" = "IOCommand is not serializable"\n' +
    '  "target-type" = <"J316s">\n' +
    '  "platform-name" = <7436303030000000000000000000000000000000000000000000000000000000>\n' +
    '  "secure-root-prefix" = <"md">\n' +
    '  "name" = <"device-tree">\n' +
    '  "region-info" = <4c4c2f4100000000000000000000000000000000000000000000000000000000>\n' +
    '  "manufacturer" = <"Apple Inc.">\n' +
    '  "compatible" = <"J316sAP","MacBookPro18,1","AppleARM">\n' +
    '  "config-number" = <00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000>\n' +
    '  "IOPlatformSerialNumber" = "HDWLIF2LM7"\n' +
    '  "regulatory-model-number" = <4132343835000000000000000000000000000000000000000000000000000000>\n' +
    '  "time-stamp" = <"Fri Aug 5 20:25:38 PDT 2022">\n' +
    '  "clock-frequency" = <00366e01>\n' +
    '  "model" = <"MacBookPro18,1">\n' +
    '  "mlb-serial-number" = <5c92d268d6cd789e475ffafc0d363fc950000000000000000000000000000000>\n' +
    '  "model-number" = <5a31345930303136430000000000000000000000000000000000000000000000>\n' +
    '  "IONWInterrupts" = "IONWInterrupts"\n' +
    '  "model-config" = <"ICT;MoPED=0x03D053A605C84ED11C455A18D6C643140B41A239">\n' +
    '  "device_type" = <"bootrom">\n' +
    '  "#size-cells" = <02000000>\n' +
    '  "IOPlatformUUID" = "81895B8D-9EF9-4EBB-B5DE-B00069CF53F0"\n' +
    '}\n';

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
