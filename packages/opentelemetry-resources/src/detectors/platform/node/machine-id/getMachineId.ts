/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */
import * as process from 'process';

let getMachineIdImpl: undefined | (() => Promise<string | undefined>);

export async function getMachineId(): Promise<string | undefined> {
  if (!getMachineIdImpl) {
    switch (process.platform) {
      case 'darwin':
        getMachineIdImpl = (await import('./getMachineId-darwin.js'))
          .getMachineId;
        break;
      case 'linux':
        getMachineIdImpl = (await import('./getMachineId-linux.js'))
          .getMachineId;
        break;
      case 'freebsd':
        getMachineIdImpl = (await import('./getMachineId-bsd.js')).getMachineId;
        break;
      case 'win32':
        getMachineIdImpl = (await import('./getMachineId-win.js')).getMachineId;
        break;
      default:
        getMachineIdImpl = (await import('./getMachineId-unsupported.js'))
          .getMachineId;
        break;
    }
  }

  return getMachineIdImpl();
}
