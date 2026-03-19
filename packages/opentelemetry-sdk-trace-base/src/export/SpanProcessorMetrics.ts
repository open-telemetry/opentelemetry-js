/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import type { Attributes, Counter, Meter } from '@opentelemetry/api';
import {
  ATTR_ERROR_TYPE,
  ATTR_OTEL_COMPONENT_NAME,
  ATTR_OTEL_COMPONENT_TYPE,
  METRIC_OTEL_SDK_PROCESSOR_SPAN_PROCESSED,
  METRIC_OTEL_SDK_PROCESSOR_SPAN_QUEUE_CAPACITY,
  METRIC_OTEL_SDK_PROCESSOR_SPAN_QUEUE_SIZE,
} from '../semconv';

const componentCounter = new Map<string, number>();

interface QueueConfig {
  capacity: number;
  getQueueSize: () => number;
}

export class SpanProcessorMetrics {
  private readonly processedSpans: Counter;

  private readonly standardAttrs: Attributes;
  private readonly droppedAttrs: Attributes;

  constructor(componentType: string, meter: Meter, queueConfig?: QueueConfig) {
    const counter = componentCounter.get(componentType) ?? 0;
    componentCounter.set(componentType, counter + 1);

    this.standardAttrs = {
      [ATTR_OTEL_COMPONENT_TYPE]: componentType,
      [ATTR_OTEL_COMPONENT_NAME]: `${componentType}/${counter}`,
    };

    this.droppedAttrs = {
      ...this.standardAttrs,
      [ATTR_ERROR_TYPE]: 'queue_full',
    };

    this.processedSpans = meter.createCounter(
      METRIC_OTEL_SDK_PROCESSOR_SPAN_PROCESSED,
      {
        unit: '{span}',
        description:
          'The number of spans for which the processing has finished, either successful or failed.',
      }
    );

    if (queueConfig) {
      const { capacity, getQueueSize } = queueConfig;
      const queueCapacity = meter.createUpDownCounter(
        METRIC_OTEL_SDK_PROCESSOR_SPAN_QUEUE_CAPACITY,
        {
          unit: '{span}',
          description:
            'The maximum number of spans the queue of a given instance of an SDK span processor can hold.',
        }
      );
      queueCapacity.add(capacity, this.standardAttrs);

      const queueSize = meter.createObservableUpDownCounter(
        METRIC_OTEL_SDK_PROCESSOR_SPAN_QUEUE_SIZE,
        {
          unit: '{span}',
          description:
            'The number of spans in the queue of a given instance of an SDK span processor.',
        }
      );
      queueSize.addCallback(result =>
        result.observe(getQueueSize(), this.standardAttrs)
      );
    }
  }

  dropSpans(count: number) {
    this.processedSpans.add(count, this.droppedAttrs);
  }

  finishSpans(count: number, error: Error | undefined) {
    if (!error) {
      this.processedSpans.add(count, this.standardAttrs);
      return;
    }

    const attrs = {
      ...this.standardAttrs,
      [ATTR_ERROR_TYPE]: error.name,
    };
    this.processedSpans.add(count, attrs);
  }
}
