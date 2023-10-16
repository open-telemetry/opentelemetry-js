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

import type { ContextManager } from '@opentelemetry/api';
import { TextMapPropagator } from '@opentelemetry/api';
import { InstrumentationOption } from '@opentelemetry/instrumentation';
import { Detector, DetectorSync, IResource } from '@opentelemetry/resources';
import { LogRecordProcessor } from '@opentelemetry/sdk-logs';
import { MetricReader, View } from '@opentelemetry/sdk-metrics';
import {
  Sampler,
  SpanExporter,
  SpanLimits,
  SpanProcessor,
  IdGenerator,
} from '@opentelemetry/sdk-trace-base';

export interface NodeSDKConfiguration {
  autoDetectResources: boolean;
  contextManager: ContextManager;
  textMapPropagator: TextMapPropagator;
  logRecordProcessor: LogRecordProcessor;
  metricReader: MetricReader;
  views: View[];
  instrumentations: InstrumentationOption[];
  resource: IResource;
  resourceDetectors: Array<Detector | DetectorSync>;
  sampler: Sampler;
  serviceName?: string;
  spanProcessor: SpanProcessor;
  traceExporter: SpanExporter;
  spanLimits: SpanLimits;
  idGenerator: IdGenerator;
}
