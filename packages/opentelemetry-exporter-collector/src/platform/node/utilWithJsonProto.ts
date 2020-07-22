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

import * as path from 'path';
import { Type } from 'protobufjs';
import * as protobufjs from 'protobufjs';
import * as collectorTypes from '../../types';
import { CollectorExporterNodeBase } from './CollectorExporterNodeBase';
import { CollectorExporterConfigNode } from './types';
import { sendWithHttp } from './util';

let ExportTraceServiceRequestProto: Type | undefined;

export function getExportTraceServiceRequestProto(): Type | undefined {
  return ExportTraceServiceRequestProto;
}

export function initWithJsonProto<ExportItem, ServiceRequest>(
  _collector: CollectorExporterNodeBase<ExportItem, ServiceRequest>,
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

export function sendWithJsonProto<ExportItem, ServiceRequest>(
  collector: CollectorExporterNodeBase<ExportItem, ServiceRequest>,
  objects: ExportItem[],
  onSuccess: () => void,
  onError: (error: collectorTypes.CollectorExporterError) => void
): void {
  const serviceRequest = collector.convert(objects);

  const message = ExportTraceServiceRequestProto?.create(serviceRequest);
  if (message) {
    const body = ExportTraceServiceRequestProto?.encode(message).finish();
    if (body) {
      sendWithHttp(
        collector,
        Buffer.from(body),
        'application/x-protobuf',
        onSuccess,
        onError
      );
    }
  } else {
    onError({
      message: 'No proto',
    });
  }
}
