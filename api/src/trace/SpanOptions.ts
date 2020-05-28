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

import { Attributes } from './attributes';
import { Link } from './link';
import { SpanKind } from './span_kind';
import { Span } from './span';
import { SpanContext } from './span_context';

/**
 * Options needed for span creation
 */
export interface SpanOptions {
  /**
   * The SpanKind of a span
   * @default {@link SpanKind.INTERNAL}
   */
  kind?: SpanKind;

  /** A span's attributes */
  attributes?: Attributes;

  /** {@link Link}s span to other spans */
  links?: Link[];

  /**
   * This option is NOT RECOMMENDED for normal use and should ONLY be used
   * if your application manages context manually without the global context
   * manager, or you are trying to override the parent extracted from context.
   *
   * A parent `SpanContext` (or `Span`, for convenience) that the newly-started
   * span will be the child of. This overrides the parent span extracted from
   * the currently active context.
   *
   * A null value here should prevent the SDK from extracting a parent from
   * the current context, forcing the new span to be a root span.
   */
  parent?: Span | SpanContext | null;

  /** A manually specified start time for the created `Span` object. */
  startTime?: number;
}
