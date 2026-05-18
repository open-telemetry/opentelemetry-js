/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import { diag } from '@opentelemetry/api';

export async function getMachineId(): Promise<string | undefined> {
  diag.debug('could not read machine-id: unsupported platform');
  return undefined;
}
