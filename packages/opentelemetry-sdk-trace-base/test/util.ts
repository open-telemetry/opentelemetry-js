/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import { MetricReader } from '@opentelemetry/sdk-metrics';
import type { InstrumentationScope } from '@opentelemetry/core';
import { createNoopMeter } from '@opentelemetry/api';
import type { Resource } from '@opentelemetry/resources';
import { defaultResource } from '@opentelemetry/resources';
import type { TracerConfig } from '../src/types';
import type { SpanProcessor } from '../src';
import { AlwaysOnSampler, ParentBasedSampler, RandomIdGenerator } from '../src';
import { Tracer } from '../src/Tracer';

export function createTracer(
  instrumentationScope: InstrumentationScope,
  config: Omit<TracerConfig, 'generalLimits'>,
  resource: Resource,
  spanProcessor: SpanProcessor
): Tracer {
  return new Tracer(
    instrumentationScope,
    {
      resource: config.resource ?? defaultResource(),
      sampler:
        config.sampler ??
        new ParentBasedSampler({
          root: new AlwaysOnSampler(),
        }),
      forceFlushTimeoutMillis: 3000,
      spanLimits: {
        // We will check and set default value later
        attributeCountLimit: config.spanLimits?.attributeCountLimit ?? 128,
        attributeValueLengthLimit:
          config.spanLimits?.attributeValueLengthLimit ?? Infinity,
        eventCountLimit: config.spanLimits?.eventCountLimit ?? 128,
        linkCountLimit: config.spanLimits?.linkCountLimit ?? 128,
        attributePerEventCountLimit:
          config.spanLimits?.attributePerEventCountLimit ?? 128,
        attributePerLinkCountLimit:
          config.spanLimits?.attributePerLinkCountLimit ?? 128,
      },
      idGenerator: config.idGenerator || new RandomIdGenerator(),
      spanProcessors: config.spanProcessors ?? [],
      meterProvider: config.meterProvider ?? {
        getMeter() {
          return createNoopMeter();
        },
      },
    },
    resource,
    spanProcessor
  );
}

export const validAttributes = {
  string: 'string',
  number: 0,
  bool: true,
  'array<string>': ['str1', 'str2'],
  'array<number>': [1, 2],
  'array<bool>': [true, false],
};

export const invalidAttributes = {
  // invalid attribute type object
  object: { foo: 'bar' },
  // invalid attribute inhomogenous array
  'non-homogeneous-array': [0, ''],
  // This empty length attribute should not be set
  '': 'empty-key',
};

export function assertAssignable<T>(val: T): asserts val is T {}

export class TestMetricReader extends MetricReader {
  protected override onShutdown(): Promise<void> {
    return Promise.resolve();
  }
  protected override onForceFlush(): Promise<void> {
    return Promise.resolve();
  }
}
