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
import {
  createExportPromiseQueue,
  createRetryingTransport,
  createOtlpExportDelegate,
} from '@opentelemetry/otlp-exporter-base';
import {
  createOtlpMetricsExporter,
  createMetricsPartialSuccessHandler,
  getMetricsConfigurationFromEnvironment,
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
  createHttpExporterTransport,
  getHttpConfigurationFromEnvironment,
  mergeNodeHttpConfigurationWithDefaults,
} from '@opentelemetry/otlp-http-exporter-node-base';

import { OtlpHttpProtoMetricsConfiguration } from './configuration';
import { createProtobufMetricsSerializer } from '../../internal/metrics-serializer';
import { createProtobufMetricsTransformer } from '../../internal/metrics-transformer';
import { REQUIRED_HEADERS } from '@opentelemetry/otlp-http-exporter-node-base';

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

/**
 * Creates an OTLP (http/protobuf) Metrics Exporter using the provided configuration, and configuration via the environment.
 * Falls back to defaults if neither are configured.
 *
 * @param options
 */
export function createMetricsExporter(
  options: Partial<OtlpHttpProtoMetricsConfiguration>
): PushMetricExporter {
  const httpEnvironmentConfiguration = getHttpConfigurationFromEnvironment(
    'METRICS',
    'v1/metrics'
  );

  const metricsConfiguration = mergeMetricsConfigurationWithDefaults(
    options,
    getMetricsConfigurationFromEnvironment()
  );

  const httpConfiguration = mergeOtlpHttpConfigurationWithDefaults(
    options,
    httpEnvironmentConfiguration,
    DEFAULTS
  );

  const nodeHttpConfiguration = mergeNodeHttpConfigurationWithDefaults(options);

  const transport = createHttpExporterTransport({
    url: httpConfiguration.url,
    headers: httpConfiguration.headers,
    compression: httpConfiguration.compression,
    timeoutMillis: httpConfiguration.timeoutMillis,
    agentOptions: nodeHttpConfiguration.agentOptions,
  });

  const retryingTransport = createRetryingTransport({
    transport,
  });

  const promiseQueue = createExportPromiseQueue({
    concurrencyLimit: httpConfiguration.concurrencyLimit,
  });

  const exportDelegate = createOtlpExportDelegate({
    transport: retryingTransport,
    transformer: createProtobufMetricsTransformer(),
    serializer: createProtobufMetricsSerializer(),
    promiseQueue,
    responseHandler: createMetricsPartialSuccessHandler(),
  });

  return createOtlpMetricsExporter(
    exportDelegate,
    metricsConfiguration.temporalitySelector
  );
}
