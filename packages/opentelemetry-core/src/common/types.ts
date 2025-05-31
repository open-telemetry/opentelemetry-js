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

import { Exception } from '@opentelemetry/api';

/**
 * This interface defines a fallback to read a timeOrigin when it is not available on performance.timeOrigin,
 * this happens for example on Safari Mac
 * then the timeOrigin is taken from fetchStart - which is the closest to timeOrigin
 */
export interface TimeOriginLegacy {
  timing: {
    fetchStart: number;
  };
}

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
