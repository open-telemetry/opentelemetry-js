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
import { Instrumentation } from '@opentelemetry/instrumentation';
import { Resource, ResourceDetector } from '@opentelemetry/resources';
import { LogRecordProcessor } from '@opentelemetry/sdk-logs';
import { IMetricReader, ViewOptions } from '@opentelemetry/sdk-metrics';
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
  textMapPropagator: TextMapPropagator | null;
  /** @deprecated use logRecordProcessors instead*/
  logRecordProcessor: LogRecordProcessor;
  logRecordProcessors?: LogRecordProcessor[];
  /** @deprecated use metricReaders instead*/
  metricReader: IMetricReader;
  metricReaders?: IMetricReader[];
  views: ViewOptions[];
  instrumentations: (Instrumentation | Instrumentation[])[];
  resource: Resource;
  resourceDetectors: Array<ResourceDetector>;
  sampler: Sampler;
  serviceName?: string;
  /** @deprecated use spanProcessors instead*/
  spanProcessor?: SpanProcessor;
  spanProcessors?: SpanProcessor[];
  traceExporter: SpanExporter;
  spanLimits: SpanLimits;
  idGenerator: IdGenerator;
}
/**
 * @experimental Options for new experimental SDK setup
 */
export interface SDKOptions {
  autoDetectResources?: boolean;
  instrumentations?: (Instrumentation | Instrumentation[])[];
  logRecordProcessors?: LogRecordProcessor[];
  resource?: Resource;
  resourceDetectors?: ResourceDetector[];
  serviceName?: string;
  textMapPropagator?: TextMapPropagator | null;
}
