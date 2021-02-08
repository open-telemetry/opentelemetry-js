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

import type { ContextManager } from '@opentelemetry/context-base';
import type { api, core, metrics, resources, tracing } from '.';
import { InstrumentationOption } from '@opentelemetry/instrumentation';

export interface NodeSDKConfiguration {
  autoDetectResources: boolean;
  contextManager: ContextManager;
  defaultAttributes: api.SpanAttributes;
  textMapPropagator: api.TextMapPropagator;
  logger: api.Logger;
  logLevel: core.LogLevel;
  metricProcessor: metrics.Processor;
  metricExporter: metrics.MetricExporter;
  metricInterval: number;
  /* Deprecated */
  plugins: InstrumentationOption[];
  instrumentations: InstrumentationOption[];
  resource: resources.Resource;
  sampler: api.Sampler;
  spanProcessor: tracing.SpanProcessor;
  traceExporter: tracing.SpanExporter;
  traceParams: tracing.TraceParams;
}
