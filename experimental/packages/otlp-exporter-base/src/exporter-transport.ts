/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import { ExportResponse } from './export-response';

export interface IExporterTransport {
  send(data: Uint8Array, timeoutMillis: number): Promise<ExportResponse>;
  shutdown(): void;
}
