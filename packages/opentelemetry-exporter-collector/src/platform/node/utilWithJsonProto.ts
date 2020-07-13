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

import { ReadableSpan } from '@opentelemetry/tracing';
import * as path from 'path';
import { Type } from 'protobufjs';
import * as protobufjs from 'protobufjs';
import { toCollectorExportTraceServiceRequest } from '../../transform';
import * as collectorTypes from '../../types';
import { CollectorTraceExporter } from './CollectorTraceExporter';
import { CollectorExporterConfigNode } from './types';
import { sendDataUsingHttp } from './util';

export const DEFAULT_COLLECTOR_URL_JSON_PROTO =
  'http://localhost:55680/v1/trace';

let ExportTraceServiceRequestProto: Type | undefined;

export function getExportTraceServiceRequestProto(): Type | undefined {
  return ExportTraceServiceRequestProto;
}

export function onInitWithJsonProto(
  _collector: CollectorTraceExporter,
  _config: CollectorExporterConfigNode
): void {
  const dir = path.resolve(__dirname, 'protos');
  const root = new protobufjs.Root();
  root.resolvePath = function (origin, target) {
    return `${dir}/${target}`;
  };
  const proto = root.loadSync([
    'opentelemetry/proto/common/v1/common.proto',
    'opentelemetry/proto/resource/v1/resource.proto',
    'opentelemetry/proto/trace/v1/trace.proto',
    'opentelemetry/proto/collector/trace/v1/trace_service.proto',
  ]);
  ExportTraceServiceRequestProto = proto?.lookupType(
    'ExportTraceServiceRequest'
  );
}

/**
 * Send spans using proto over http
 * @param collector
 * @param spans
 * @param onSuccess
 * @param onError
 */
export function sendSpansUsingJsonProto(
  collector: CollectorTraceExporter,
  spans: ReadableSpan[],
  onSuccess: () => void,
  onError: (error: collectorTypes.CollectorExporterError) => void
): void {
  const exportTraceServiceRequest = toCollectorExportTraceServiceRequest(
    spans,
    collector
  );

  const message = ExportTraceServiceRequestProto?.create(
    exportTraceServiceRequest
  );

  if (message) {
    const body = ExportTraceServiceRequestProto?.encode(message).finish();
    if (body) {
      sendDataUsingHttp(
        collector,
        Buffer.from(body),
        'application/x-protobuf',
        onSuccess,
        onError
      );
    }
  }
}
