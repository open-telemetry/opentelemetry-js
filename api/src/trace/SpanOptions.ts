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

import { TimeInput } from '../common/Time';
import { SpanAttributes } from './attributes';
import { Link } from './link';
import { SpanKind } from './span_kind';

/**
 * Options needed for span creation
 *
 * @since 1.0.0
 */
export interface SpanOptions {
  /**
   * The SpanKind of a span
   * @default {@link SpanKind.INTERNAL}
   */
  kind?: SpanKind;

  /** A span's attributes */
  attributes?: SpanAttributes;

  /** {@link Link}s span to other spans */
  links?: Link[];

  /** A manually specified start time for the created `Span` object. */
  startTime?: TimeInput;

  /** The new span should be a root span. (Ignore parent from context). */
  root?: boolean;
}
