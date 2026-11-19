/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import { promises as fs } from 'fs';
import { execFileAsync } from './execAsync';
import { diag } from '@opentelemetry/api';

const EXEC_TIMEOUT_MS = 5000;

export async function getMachineId(): Promise<string | undefined> {
  try {
    const result = await fs.readFile('/etc/hostid', { encoding: 'utf8' });
    return result.trim();
  } catch (e) {
    diag.debug(`error reading machine id: ${e}`);
  }

  try {
    const result = await execFileAsync(
      '/bin/kenv',
      ['-q', 'smbios.system.uuid'],
      { timeout: EXEC_TIMEOUT_MS }
    );
    return result.stdout.trim();
  } catch (e) {
    diag.debug(`error reading machine id: ${e}`);
  }

  return undefined;
}
