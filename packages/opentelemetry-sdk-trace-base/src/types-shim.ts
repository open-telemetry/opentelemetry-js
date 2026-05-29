/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import type { MeterProvider } from '@opentelemetry/api';
import type { Resource } from '@opentelemetry/resources';
import type {
  Sampler,
  SpanLimits,
  IdGenerator,
  SpanProcessor,
} from '@opentelemetry/sdk-trace';

/**
 * TracerConfig provides an interface for configuring a Basic Tracer.
 */
export interface TracerConfig {
  /**
   * Sampler determines if a span should be recorded or should be a NoopSpan.
   */
  sampler?: Sampler;

  /** General Limits */
  generalLimits?: GeneralLimits;

  /** Span Limits */
  spanLimits?: SpanLimits;

  /** Resource associated with trace telemetry  */
  resource?: Resource;

  /**
   * Generator of trace and span IDs
   * The default idGenerator generates random ids
   */
  idGenerator?: IdGenerator;

  /**
   * How long the forceFlush can run before it is cancelled.
   * The default value is 30000ms
   */
  forceFlushTimeoutMillis?: number;

  /**
   * List of SpanProcessor for the tracer
   */
  spanProcessors?: SpanProcessor[];

  /**
   * A meter provider to record trace SDK metrics to.
   * @experimental This option is experimental and is subject to breaking changes in minor releases.
   */
  meterProvider?: MeterProvider;
}

/** Global configuration limits of trace service */
export interface GeneralLimits {
  /** attributeValueLengthLimit is maximum allowed attribute value size */
  attributeValueLengthLimit?: number;
  /** attributeCountLimit is number of attributes per trace */
  attributeCountLimit?: number;
}
