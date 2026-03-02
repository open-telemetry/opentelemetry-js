/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import { context } from '@opentelemetry/api';
import { ExportResult } from '../ExportResult';
import { suppressTracing } from '../trace/suppress-tracing';

export interface Exporter<T> {
  export(arg: T, resultCallback: (result: ExportResult) => void): void;
}

/**
 * @internal
 * Shared functionality used by Exporters while exporting data, including suppression of Traces.
 */
export function _export<T>(
  exporter: Exporter<T>,
  arg: T
): Promise<ExportResult> {
  return new Promise(resolve => {
    // prevent downstream exporter calls from generating spans
    context.with(suppressTracing(context.active()), () => {
      exporter.export(arg, resolve);
    });
  });
}
