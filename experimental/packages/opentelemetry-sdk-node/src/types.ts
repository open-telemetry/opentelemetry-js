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

import type { ContextManager, SpanAttributes } from '@opentelemetry/api';
import { Sampler, TextMapPropagator } from '@opentelemetry/api';
import { InstrumentationOption } from '@opentelemetry/instrumentation';
import { Resource } from '@opentelemetry/resources';
import { MetricReader } from '@opentelemetry/sdk-metrics-base';
import {
  SpanExporter,
  SpanLimits,
  SpanProcessor
} from '@opentelemetry/sdk-trace-base';

export interface NodeSDKConfiguration {
  autoDetectResources: boolean;
  contextManager: ContextManager;
  defaultAttributes: SpanAttributes;
  textMapPropagator: TextMapPropagator;
  metricReader: MetricReader;
  instrumentations: InstrumentationOption[];
  resource: Resource;
  sampler: Sampler;
  serviceName?: string;
  spanProcessor: SpanProcessor;
  traceExporter: SpanExporter;
  spanLimits: SpanLimits;
}
