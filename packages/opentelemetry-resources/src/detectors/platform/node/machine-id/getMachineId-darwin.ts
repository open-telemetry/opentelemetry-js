/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import { execFileAsync } from './execAsync';
import { diag } from '@opentelemetry/api';

const EXEC_TIMEOUT_MS = 5000;

export async function getMachineId(): Promise<string | undefined> {
  try {
    const result = await execFileAsync(
      '/usr/sbin/ioreg',
      ['-rd1', '-c', 'IOPlatformExpertDevice'],
      { timeout: EXEC_TIMEOUT_MS }
    );

    const idLine = result.stdout
      .split('\n')
      .find(line => line.includes('IOPlatformUUID'));

    if (!idLine) {
      return undefined;
    }

    const parts = idLine.split('" = "');
    if (parts.length === 2) {
      return parts[1].slice(0, -1);
    }
  } catch (e) {
    diag.debug(`error reading machine id: ${e}`);
  }

  return undefined;
}
