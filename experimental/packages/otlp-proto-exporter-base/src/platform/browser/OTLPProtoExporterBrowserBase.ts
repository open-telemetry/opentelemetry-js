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

import { diag } from '@opentelemetry/api';
import { ServiceClientType } from '../types';
import {
  OTLPExporterBrowserBase as OTLPExporterBaseMain,
  OTLPExporterError,
  OTLPExporterConfigBase,
  sendWithXhr,
} from '@opentelemetry/otlp-exporter-base';
import * as root from '../../generated/root';

interface ExportRequestType<T, R = T & { toJSON: () => unknown }> {
  create(properties?: T): R;
  encode(message: T, writer?: protobuf.Writer): protobuf.Writer;
  decode(reader: protobuf.Reader | Uint8Array, length?: number): R;
}

/**
 * Collector Exporter abstract base class
 */
export abstract class OTLPProtoExporterBrowserBase<
  ExportItem,
  ServiceRequest
> extends OTLPExporterBaseMain<ExportItem, ServiceRequest> {
  constructor(config: OTLPExporterConfigBase = {}) {
    super(config);
  }

  private _getExportRequestProto(
    clientType: ServiceClientType
  ): ExportRequestType<ServiceRequest> {
    if (clientType === ServiceClientType.SPANS) {
      // eslint-disable-next-line
      return root.opentelemetry.proto.collector.trace.v1.ExportTraceServiceRequest as unknown as ExportRequestType<ServiceRequest>;
    } else {
      // eslint-disable-next-line
      return root.opentelemetry.proto.collector.metrics.v1.ExportMetricsServiceRequest as unknown as ExportRequestType<ServiceRequest>;
    }
  }

  override send(
    objects: ExportItem[],
    onSuccess: () => void,
    onError: (error: OTLPExporterError) => void
  ): void {
    if (this._shutdownOnce.isCalled) {
      diag.debug('Shutdown already started. Cannot send objects');
      return;
    }

    const serviceRequest = this.convert(objects);
    const exportRequestType = this._getExportRequestProto(
      this.getServiceClientType()
    );
    const message = exportRequestType.create(serviceRequest);

    if (message) {
      const body = exportRequestType.encode(message).finish();
      if (body) {
        sendWithXhr(
          new Blob([body], { type: 'application/x-protobuf' }),
          this.url,
          {
            ...this._headers,
            'Content-Type': 'application/x-protobuf',
            Accept: 'application/x-protobuf',
          },
          this.timeoutMillis,
          onSuccess,
          onError
        );
      }
    } else {
      onError(new OTLPExporterError('No proto'));
    }
  }

  abstract getServiceClientType(): ServiceClientType;
}
