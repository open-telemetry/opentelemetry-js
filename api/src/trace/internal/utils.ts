/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import type { TraceState } from '../trace_state';
import { TraceStateImpl } from './tracestate-impl';

/**
 * @deprecated Use TraceState from "@opentelemetry/core". This will be removed in the next major version.
 * @since 1.1.0
 */
export function createTraceState(rawTraceState?: string): TraceState {
  return new TraceStateImpl(rawTraceState);
}
