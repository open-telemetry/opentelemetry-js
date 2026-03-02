/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import { TraceState } from '../trace_state';
import { TraceStateImpl } from './tracestate-impl';

/**
 * @since 1.1.0
 */
export function createTraceState(rawTraceState?: string): TraceState {
  return new TraceStateImpl(rawTraceState);
}
