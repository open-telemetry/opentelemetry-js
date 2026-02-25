/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import { Exception } from '@opentelemetry/api';

/**
 * This interface defines the params that are be added to the wrapped function
 * using the "shimmer.wrap"
 */
export interface ShimWrapped extends Function {
  __wrapped: boolean;
  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
  __unwrap: Function;
  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
  __original: Function;
}

/**
 * An instrumentation scope consists of the name and optional version
 * used to obtain a tracer or meter from a provider. This metadata is made
 * available on ReadableSpan and MetricRecord for use by the export pipeline.
 */
export interface InstrumentationScope {
  readonly name: string;
  readonly version?: string;
  readonly schemaUrl?: string;
}

/** Defines an error handler function */
export type ErrorHandler = (ex: Exception) => void;
