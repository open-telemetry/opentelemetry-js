/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { ReadableSpan, SpanExporter } from '@opentelemetry/sdk-trace-base';
import {
  OTLPExporterNodeConfigBase,
  OTLPExporterBase,
} from '@opentelemetry/otlp-exporter-base';
import { ProtobufTraceSerializer } from '@opentelemetry/otlp-transformer';
import { VERSION } from '../../version';
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
          'User-Agent': `OTel-OTLP-Exporter-JavaScript/${VERSION}`,
          'Content-Type': 'application/x-protobuf',
        }),
        ProtobufTraceSerializer
      )
    );
  }
}
