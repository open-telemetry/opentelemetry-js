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
import {
  MetricRecord,
  AggregatorKind,
  Distribution,
  MetricKind,
} from '@opentelemetry/metrics';
import { PrometheusCheckpoint } from './types';
import { Labels } from '@opentelemetry/api';
import { hrTimeToMilliseconds } from '@opentelemetry/core';

type PrometheusDataTypeLiteral =
  | 'counter'
  | 'gauge'
  | 'histogram'
  | 'summary'
  | 'untyped';

function escapeString(str: string) {
  return str.replace(/\\/g, '\\\\').replace(/\n/g, '\\n');
}

function escapeLabelValue(str: string) {
  if (typeof str !== 'string') {
    str = String(str);
  }
  return escapeString(str).replace(/"/g, '\\"');
}

const invalidCharacterRegex = /[^a-z0-9_]/gi;
/**
 * Ensures metric names are valid Prometheus metric names by removing
 * characters allowed by OpenTelemetry but disallowed by Prometheus.
 *
 * https://prometheus.io/docs/concepts/data_model/#metric-names-and-labels
 *
 * 1. Names must match `[a-zA-Z_:][a-zA-Z0-9_:]*`
 *
 * 2. Colons are reserved for user defined recording rules.
 * They should not be used by exporters or direct instrumentation.
 *
 * OpenTelemetry metric names are already validated in the Meter when they are created,
 * and they match the format `[a-zA-Z][a-zA-Z0-9_.\-]*` which is very close to a valid
 * prometheus metric name, so we only need to strip characters valid in OpenTelemetry
 * but not valid in prometheus and replace them with '_'.
 *
 * @param name name to be sanitized
 */
function sanitizePrometheusMetricName(name: string): string {
  return name.replace(invalidCharacterRegex, '_'); // replace all invalid characters with '_'
}

function valueString(value: number) {
  if (Number.isNaN(value)) {
    return 'Nan';
  } else if (!Number.isFinite(value)) {
    if (value < 0) {
      return '-Inf';
    } else {
      return '+Inf';
    }
  } else {
    return `${value}`;
  }
}

function toPrometheusType(
  metricKind: MetricKind,
  aggregatorKind: AggregatorKind
): PrometheusDataTypeLiteral {
  switch (aggregatorKind) {
    case AggregatorKind.SUM:
      if (
        metricKind === MetricKind.COUNTER ||
        metricKind === MetricKind.SUM_OBSERVER
      ) {
        return 'counter';
      }
      /** MetricKind.UP_DOWN_COUNTER and MetricKind.UP_DOWN_SUM_OBSERVER */
      return 'gauge';
    case AggregatorKind.LAST_VALUE:
      return 'gauge';
    case AggregatorKind.DISTRIBUTION:
      return 'summary';
    case AggregatorKind.HISTOGRAM:
      return 'histogram';
    default:
      return 'untyped';
  }
}

function stringify(
  metricName: string,
  labels: Labels,
  value: number,
  timestamp?: number,
  additionalLabels?: Labels
) {
  let hasLabel = false;
  let labelsStr = '';

  for (const [key, val] of Object.entries(labels)) {
    hasLabel = true;
    labelsStr += `${labelsStr.length > 0 ? ',' : ''}${key}="${escapeLabelValue(
      val
    )}"`;
  }
  if (additionalLabels) {
    for (const [key, val] of Object.entries(additionalLabels)) {
      hasLabel = true;
      labelsStr += `${
        labelsStr.length > 0 ? ',' : ''
      }${key}="${escapeLabelValue(val)}"`;
    }
  }

  if (hasLabel) {
    metricName += `{${labelsStr}}`;
  }

  return `${metricName} ${valueString(value)}${
    timestamp !== undefined ? ' ' + String(timestamp) : ''
  }\n`;
}

export class PrometheusSerializer {
  private _prefix: string | undefined;
  private _appendTimestamp: boolean;

  constructor(prefix?: string, appendTimestamp = true) {
    if (prefix) {
      this._prefix = prefix + '_';
    }
    this._appendTimestamp = appendTimestamp;
  }

  serialize(checkpointSet: PrometheusCheckpoint[]): string {
    let str = '';
    for (const checkpoint of checkpointSet) {
      str += this.serializeCheckpointSet(checkpoint) + '\n';
    }
    return str;
  }

  serializeCheckpointSet(checkpoint: PrometheusCheckpoint): string {
    let name = sanitizePrometheusMetricName(
      escapeString(checkpoint.descriptor.name)
    );
    if (this._prefix) {
      name = `${this._prefix}${name}`;
    }
    const help = `# HELP ${name} ${escapeString(
      checkpoint.descriptor.description || 'description missing'
    )}`;
    const type = `# TYPE ${name} ${toPrometheusType(
      checkpoint.descriptor.metricKind,
      checkpoint.aggregatorKind
    )}`;

    const results = checkpoint.records
      .map(it => this.serializeRecord(name, it))
      .join('');

    return `${help}\n${type}\n${results}`.trim();
  }

  serializeRecord(name: string, record: MetricRecord): string {
    let results = '';
    switch (record.aggregator.kind) {
      case AggregatorKind.SUM:
      case AggregatorKind.LAST_VALUE: {
        const { value, timestamp: hrtime } = record.aggregator.toPoint();
        const timestamp = hrTimeToMilliseconds(hrtime);
        results += stringify(
          name,
          record.labels,
          value,
          this._appendTimestamp ? timestamp : undefined,
          undefined
        );
        break;
      }
      case AggregatorKind.DISTRIBUTION: {
        const { value, timestamp: hrtime } = record.aggregator.toPoint();
        const timestamp = hrTimeToMilliseconds(hrtime);
        for (const key of ['count', 'sum'] as (keyof Distribution)[]) {
          results += stringify(
            name + '_' + key,
            record.labels,
            value[key],
            this._appendTimestamp ? timestamp : undefined,
            undefined
          );
        }
        results += stringify(
          name,
          record.labels,
          value.min,
          this._appendTimestamp ? timestamp : undefined,
          {
            quantile: '0',
          }
        );
        results += stringify(
          name,
          record.labels,
          value.max,
          this._appendTimestamp ? timestamp : undefined,
          {
            quantile: '1',
          }
        );
        break;
      }
      case AggregatorKind.HISTOGRAM: {
        const { value, timestamp: hrtime } = record.aggregator.toPoint();
        const timestamp = hrTimeToMilliseconds(hrtime);
        /** Histogram["bucket"] is not typed with `number` */
        for (const key of ['count', 'sum'] as ('count' | 'sum')[]) {
          results += stringify(
            name + '_' + key,
            record.labels,
            value[key],
            this._appendTimestamp ? timestamp : undefined,
            undefined
          );
        }
        for (const [idx, val] of value.buckets.counts.entries()) {
          const upperBound = value.buckets.boundaries[idx];
          results += stringify(
            name + '_bucket',
            record.labels,
            val,
            this._appendTimestamp ? timestamp : undefined,
            {
              le: upperBound === undefined ? '+Inf' : String(upperBound),
            }
          );
        }
        break;
      }
    }
    return results;
  }
}
