/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import type { ReadableSpan } from '@opentelemetry/sdk-trace-base';

import type { ISignal } from '../i-signal';

// IMPORTANT: exports added here are public
export type {
  IExportTracePartialSuccess,
  IExportTraceServiceResponse,
} from './export-response';

export const TraceSignal: ISignal<ReadableSpan[]> = {
  name: 'span',
  countItems: (request: ReadableSpan[]) => request.length,
};
