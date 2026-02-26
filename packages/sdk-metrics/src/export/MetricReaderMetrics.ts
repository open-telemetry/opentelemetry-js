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
import { Attributes, Histogram, Meter } from '@opentelemetry/api';
import {
  ATTR_ERROR_TYPE,
  ATTR_OTEL_COMPONENT_NAME,
  ATTR_OTEL_COMPONENT_TYPE,
  METRIC_OTEL_SDK_METRIC_READER_COLLECTION_DURATION,
} from '../semconv';

const componentCounter = new Map<string, number>();

/**
 * Generates `otel.sdk.metric_reader.*` metrics.
 * https://opentelemetry.io/docs/specs/semconv/otel/sdk-metrics/#metric-otelsdkmetric_readercollectionduration
 */
export class MetricReaderMetrics {
  private readonly collectionDuration: Histogram;
  private readonly standardAttrs: Attributes;

  constructor(componentType: string, meter: Meter) {
    const counter = componentCounter.get(componentType) ?? 0;
    componentCounter.set(componentType, counter + 1);

    this.standardAttrs = {
      [ATTR_OTEL_COMPONENT_TYPE]: componentType,
      [ATTR_OTEL_COMPONENT_NAME]: `${componentType}/${counter}`,
    };

    this.collectionDuration = meter.createHistogram(
      METRIC_OTEL_SDK_METRIC_READER_COLLECTION_DURATION,
      {
        unit: 's',
        description:
          'The duration of the collect operation of the metric reader.',
        advice: {
          explicitBucketBoundaries: [],
        },
      }
    );
  }

  recordCollection(durationSecs: number, error: string | undefined) {
    const attrs = error
      ? { ...this.standardAttrs, [ATTR_ERROR_TYPE]: error }
      : this.standardAttrs;
    this.collectionDuration.record(durationSecs, attrs);
  }
}
