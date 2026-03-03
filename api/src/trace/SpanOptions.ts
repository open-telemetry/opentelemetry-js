/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
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
