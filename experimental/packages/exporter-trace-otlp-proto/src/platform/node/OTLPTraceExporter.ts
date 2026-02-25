/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import { ReadableSpan, SpanExporter } from '@opentelemetry/sdk-trace-base';
import {
  OTLPExporterNodeConfigBase,
  OTLPExporterBase,
} from '@opentelemetry/otlp-exporter-base';
import { ProtobufTraceSerializer } from '@opentelemetry/otlp-transformer';
import {
  createOtlpHttpExportDelegate,
  convertLegacyHttpOptions,
} from '@opentelemetry/otlp-exporter-base/node-http';

/**
 * Collector Trace Exporter for Node with protobuf
 */
export class OTLPTraceExporter
  extends OTLPExporterBase<ReadableSpan[]>
  implements SpanExporter
{
  constructor(config: OTLPExporterNodeConfigBase = {}) {
    super(
      createOtlpHttpExportDelegate(
        convertLegacyHttpOptions(config, 'TRACES', 'v1/traces', {
          'Content-Type': 'application/x-protobuf',
        }),
        ProtobufTraceSerializer
      )
    );
  }
}
