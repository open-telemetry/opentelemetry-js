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

import * as api from '@opentelemetry/api';

/**
 * Datadog Exporter config
 */
export interface DatadogExporterConfig {
  tags?: string;
  logger?: api.Logger;
  service_name?: string;
  agent_url?: string;
  version?: string;
  env?: string;
  flushInterval?: number;
  // Optional mapping overrides for OpenTelemetry status code and description.
}

/** Interface configuration for a Datadog buffer. */
export interface DatadogBufferConfig {
  /** Maximum size of a buffer. */
  maxQueueSize?: number;
  maxTraceSize?: number;
  /** Max time for a buffer can wait before being sent */
  bufferTimeout?: number;
  logger?: api.Logger;
}

export const id = require('dd-trace/packages/dd-trace/src/id'); /* eslint-disable-line @typescript-eslint/no-var-requires */
export const SpanContext = require('dd-trace/packages/dd-trace/src/opentracing/span_context'); /* eslint-disable-line @typescript-eslint/no-var-requires */
export const AgentExporter = require('dd-trace/packages/dd-trace/src/exporters/agent'); /* eslint-disable-line @typescript-eslint/no-var-requires */
export const format = require('dd-trace/packages/dd-trace/src/format'); /* eslint-disable-line @typescript-eslint/no-var-requires */
export const PrioritySampler = require('dd-trace/packages/dd-trace/src/priority_sampler'); /* eslint-disable-line @typescript-eslint/no-var-requires */
export const Sampler = require('dd-trace/packages/dd-trace/src/sampler'); /* eslint-disable-line @typescript-eslint/no-var-requires */
export const Span = require('dd-trace/packages/dd-trace/src/opentracing/span'); /* eslint-disable-line @typescript-eslint/no-var-requires */
export const NoopTracer = require('dd-trace/packages/dd-trace/src/noop/tracer'); /* eslint-disable-line @typescript-eslint/no-var-requires */
export const datadog = require('dd-trace'); /* eslint-disable-line @typescript-eslint/no-var-requires */
