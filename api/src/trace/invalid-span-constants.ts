/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import { SpanContext } from './span_context';
import { TraceFlags } from './trace_flags';

/**
 * @since 1.0.0
 */
export const INVALID_SPANID = '0000000000000000';

/**
 * @since 1.0.0
 */
export const INVALID_TRACEID = '00000000000000000000000000000000';

/**
 * @since 1.0.0
 */
export const INVALID_SPAN_CONTEXT: SpanContext = {
  traceId: INVALID_TRACEID,
  spanId: INVALID_SPANID,
  traceFlags: TraceFlags.NONE,
};
