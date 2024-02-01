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

import { PushMetricExporter } from '@opentelemetry/sdk-metrics';
import { OtlpHttpProtoMetricsConfiguration } from './configuration';
import {
  createMetricsPartialSuccessHandler,
  createOtlpMetricsExporter,
  mergeMetricsConfigurationWithDefaults,
} from '@opentelemetry/otlp-metrics-exporter-base';
import {
  DEFAULT_COMPRESSION,
  DEFAULT_CONCURRENCY_LIMIT,
  DEFAULT_TIMEOUT,
  mergeOtlpHttpConfigurationWithDefaults,
  OtlpHttpConfiguration,
} from '@opentelemetry/otlp-http-exporter-base';
import {
  createRetryingTransport,
  createOtlpExportDelegate,
  createExportPromiseQueue,
} from '@opentelemetry/otlp-exporter-base';
import {
  REQUIRED_HEADERS,
  createSendBeaconTransport,
  createXhrTransport,
} from '@opentelemetry/otlp-http-exporter-browser-base';
import { createProtobufMetricsSerializer } from '../../internal/metrics-serializer';
import { createProtobufMetricsTransformer } from '../../internal/metrics-transformer';

const DEFAULTS: OtlpHttpConfiguration = {
  url: 'http://localhost:4318/v1/metrics',
  compression: DEFAULT_COMPRESSION,
  concurrencyLimit: DEFAULT_CONCURRENCY_LIMIT,
  headers: {
    ...REQUIRED_HEADERS,
    Accept: 'application/x-protobuf',
    'Content-Type': 'application/x-protobuf',
  },
  timeoutMillis: DEFAULT_TIMEOUT,
};

export function createMetricsExporter(
  options: Partial<OtlpHttpProtoMetricsConfiguration>
): PushMetricExporter {
  const metricsConfiguration = mergeMetricsConfigurationWithDefaults(
    options,
    {}
  );

  const httpConfiguration = mergeOtlpHttpConfigurationWithDefaults(
    options,
    {},
    DEFAULTS
  );

  const useXHR =
    !!options.headers || typeof navigator.sendBeacon !== 'function';

  const transport = useXHR
    ? createRetryingTransport({
        transport: createXhrTransport({
          url: httpConfiguration.url,
          headers: httpConfiguration.headers,
          timeoutMillis: httpConfiguration.timeoutMillis,
          blobType: 'application/x-protobuf',
        }),
      })
    : createSendBeaconTransport({
        url: httpConfiguration.url,
        blobType: 'application/x-protobuf',
      });

  const promiseQueue = createExportPromiseQueue({
    concurrencyLimit: httpConfiguration.concurrencyLimit,
  });

  const exporterDelegate = createOtlpExportDelegate({
    transport,
    responseHandler: createMetricsPartialSuccessHandler(),
    serializer: createProtobufMetricsSerializer(),
    transformer: createProtobufMetricsTransformer(),
    promiseQueue,
  });

  return createOtlpMetricsExporter(
    exporterDelegate,
    metricsConfiguration.temporalitySelector
  );
}
