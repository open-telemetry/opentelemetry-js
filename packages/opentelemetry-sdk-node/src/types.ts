/*!
 * Copyright 2020, OpenTelemetry Authors
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
import type { api, core, metrics, node, resources, tracing } from '.';

export interface SDKConfiguration {
  autoDetectResources: boolean;
  defaultAttributes: api.Attributes;
  logger: api.Logger;
  logLevel: core.LogLevel;
  contextManager: ContextManager;
  metricBatcher: metrics.Batcher;
  metricExporter: metrics.MetricExporter;
  metricInterval: number;
  metricResource: resources.Resource;
  plugins: node.Plugins;
  httpTextPropagator: api.HttpTextPropagator;
  resource: resources.Resource;
  sampler: api.Sampler;
  spanProcessor: tracing.SpanProcessor;
  traceExporter: tracing.SpanExporter;
  traceParams: tracing.TraceParams;
  traceResource: resources.Resource;
}
