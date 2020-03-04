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

import { ValueType } from '@opentelemetry/api';
import { ExportResult } from '@opentelemetry/base';
import { LabelSet } from '../LabelSet';

/** The kind of metric. */
export enum MetricKind {
  COUNTER,
  MEASURE,
  OBSERVER,
}

/** Sum returns an aggregated sum. */
export type Sum = number;

/** LastValue returns last value. */
export type LastValue = number;

export interface Distribution {
  min: number;
  max: number;
  count: number;
  sum: number;
}

export interface MetricRecord {
  readonly descriptor: MetricDescriptor;
  readonly labels: LabelSet;
  readonly aggregator: Aggregator;
}

export interface MetricDescriptor {
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

/**
 * Base interface for aggregators. Aggregators are responsible for holding
 * aggregated values and taking a snapshot of these values upon export.
 */
export interface Aggregator {
  /** Updates the current with the new value. */
  update(value: number): void;

  /** Returns snapshot of the current value. */
  value(): Sum | Distribution;
}
