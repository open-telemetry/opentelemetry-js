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

import type { z } from 'zod';
import { OpenTelemetryConfigurationSchema } from './opentelemetry-configuration';

// ---------------------------------------------------------------------------
// Leaf types
// ---------------------------------------------------------------------------

export interface AttributeNameValue {
  name: string;
  value?:
    | string
    | boolean
    | number
    | null
    | string[]
    | boolean[]
    | number[];
  type?: string;
}

export interface OtlpHttpExporter {
  endpoint?: string | null;
  compression?: string | null;
  encoding?: string;
  timeout?: number | null;
  headers?: Array<{ name: string; value: string | null }>;
  headers_list?: string | null;
  tls?: object | null;
}

export interface OtlpGrpcExporter {
  endpoint?: string | null;
  compression?: string | null;
  timeout?: number | null;
  headers?: Array<{ name: string; value: string | null }>;
  headers_list?: string | null;
  tls?: object | null;
}

export interface LogRecordExporterConfiguration {
  otlp_http?: OtlpHttpExporter | null;
  otlp_grpc?: OtlpGrpcExporter | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  console?: Record<string, any> | null;
  [key: string]: unknown;
}

export interface BatchLogRecordProcessor {
  schedule_delay?: number | null;
  export_timeout?: number | null;
  max_queue_size?: number | null;
  max_export_batch_size?: number | null;
  exporter: LogRecordExporterConfiguration;
}

export interface SimpleLogRecordProcessor {
  exporter: LogRecordExporterConfiguration;
}

export interface LogRecordProcessor {
  batch?: BatchLogRecordProcessor;
  simple?: SimpleLogRecordProcessor;
  [key: string]: unknown;
}

export interface LogRecordLimits {
  attribute_value_length_limit?: number | null;
  attribute_count_limit?: number | null;
}

export interface LoggerProvider {
  processors: LogRecordProcessor[];
  limits?: LogRecordLimits;
  [key: string]: unknown;
}

export interface TextMapPropagator {
  tracecontext?: object | null;
  baggage?: object | null;
  b3?: object | null;
  b3multi?: object | null;
  jaeger?: object | null;
  ottrace?: object | null;
  [key: string]: unknown;
}

export interface Propagator {
  composite?: TextMapPropagator[];
  composite_list?: string | null;
}

export interface ResourceDetector {
  host?: object | null;
  os?: object | null;
  process?: object | null;
  service?: object | null;
  env?: object | null;
  [key: string]: unknown;
}

export interface ExperimentalResourceDetection {
  detectors?: ResourceDetector[];
  [key: string]: unknown;
}

export interface Resource {
  attributes?: AttributeNameValue[];
  schema_url?: string | null;
  attributes_list?: string | null;
  'detection/development'?: ExperimentalResourceDetection;
  [key: string]: unknown;
}

export interface AttributeLimits {
  attribute_value_length_limit?: number | null;
  attribute_count_limit?: number | null;
}

export interface SpanLimits {
  attribute_value_length_limit?: number | null;
  attribute_count_limit?: number | null;
  event_count_limit?: number | null;
  link_count_limit?: number | null;
  event_attribute_count_limit?: number | null;
  link_attribute_count_limit?: number | null;
}

export interface SpanExporterConfiguration {
  otlp_http?: OtlpHttpExporter | null;
  otlp_grpc?: OtlpGrpcExporter | null;
  console?: object | null;
  [key: string]: unknown;
}

export interface BatchSpanProcessor {
  schedule_delay?: number | null;
  export_timeout?: number | null;
  max_queue_size?: number | null;
  max_export_batch_size?: number | null;
  exporter: SpanExporterConfiguration;
}

export interface SimpleSpanProcessor {
  exporter: SpanExporterConfiguration;
}

export interface SpanProcessor {
  batch?: BatchSpanProcessor;
  simple?: SimpleSpanProcessor;
  [key: string]: unknown;
}

export interface TracerProvider {
  processors?: SpanProcessor[];
  limits?: SpanLimits;
  sampler?: object;
  [key: string]: unknown;
}

export interface MetricReader {
  periodic?: object;
  pull?: object;
  [key: string]: unknown;
}

export interface MeterProvider {
  readers?: MetricReader[];
  views?: object[];
  exemplar_filter?: string;
  [key: string]: unknown;
}

// ---------------------------------------------------------------------------
// Top-level Configuration interface
// ---------------------------------------------------------------------------

export interface Configuration {
  file_format?: string;
  disabled?: boolean | null;
  log_level?: string;
  attribute_limits?: AttributeLimits;
  logger_provider?: LoggerProvider;
  meter_provider?: MeterProvider;
  propagator?: Propagator;
  tracer_provider?: TracerProvider;
  resource?: Resource;
  'instrumentation/development'?: object;
  distribution?: object;
  [key: string]: unknown;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const ConfigurationSchema: z.ZodType<Configuration> = OpenTelemetryConfigurationSchema as z.ZodType<Configuration>;
