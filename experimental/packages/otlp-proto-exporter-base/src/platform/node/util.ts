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

import { OTLPProtoExporterNodeBase } from './OTLPProtoExporterNodeBase';
import {
  CompressionAlgorithm,
  OTLPExporterError,
  sendWithHttp,
} from '@opentelemetry/otlp-exporter-base';

import { getExportRequestProto } from '../util';

export function send<ExportItem, ServiceRequest>(
  collector: OTLPProtoExporterNodeBase<ExportItem, ServiceRequest>,
  objects: ExportItem[],
  compression: CompressionAlgorithm,
  onSuccess: () => void,
  onError: (error: OTLPExporterError) => void
): void {
  const serviceRequest = collector.convert(objects);

  const exportRequestType = getExportRequestProto<ServiceRequest>(
    collector.getServiceClientType()
  );
  const message = exportRequestType.create(serviceRequest);
  if (message) {
    const body = exportRequestType.encode(message).finish();
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
    onError(new OTLPExporterError('No proto'));
  }
}
