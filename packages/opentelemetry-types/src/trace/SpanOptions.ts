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

import { Span } from './span';
import { Attributes } from './attributes';
import { SpanKind } from './span_kind';
import { SpanContext } from './span_context';
import { Link } from './link';

/**
 * Options needed for span creation
 */
export interface SpanOptions {
  /** The SpanKind of a span */
  kind?: SpanKind;

  /** A spans attributes */
  attributes?: Attributes;

  /** Indicates that if this Span is active and recording information like events with the `AddEvent` operation and attributes using `setAttributes`. */
  isRecording?: boolean;

  /** A spans links */
  links?: Link[];

  /**
   * A parent SpanContext (or Span, for convenience) that the newly-started
   * span will be the child of.
   */
  parent?: Span | SpanContext;

  /** A manually specified start time for the created Span object. */
  startTime?: number;
}
