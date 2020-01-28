/*!
 * Copyright 2019, OpenTelemetry Authors
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

/**
 * This is based on
 * opencensus-node/packages/opencensus-core/src/metrics/export/types.ts
 *
 * Proto definition:
 * opentelemetry-proto/opentelemetry/proto/metrics/v1/metrics.proto
 */

import { HrTime, ValueType } from '@opentelemetry/api';
import { ExportResult } from '@opentelemetry/base';
import { Aggregator } from './Aggregator';
import { LabelSet } from '../LabelSet';

/** The kind of metric. */
export enum MetricKind {
  COUNTER,
  GAUGE,
  MEASURE,
}

/** Sum returns an aggregated sum. */
export type Sum = number;

/** LastValue returns the latest value that was aggregated. */
export type LastValue = {
  value: number;
  timestamp: HrTime;
};

export interface Distribution {
  min: number;
  max: number;
  count: number;
  sum: number;
}

export interface MetricRecord {
  readonly descriptor: Descriptor;
  readonly labels: LabelSet;
  readonly aggregator: Aggregator;
}

export interface Descriptor {
  readonly name: string;
  readonly description: string;
  readonly unit: string;
  readonly metricKind: MetricKind;
  readonly valueType: ValueType;
  readonly labelKeys: string[];
  readonly monotonic: boolean;
}

/**
 * Base interface that represents a metric exporter
 */
export interface MetricExporter {
  /** Exports the list of a given {@link MetricRecord} */
  export(
    metrics: MetricRecord[],
    resultCallback: (result: ExportResult) => void
  ): void;

  /** Stops the exporter. */
  shutdown(): void;
}
