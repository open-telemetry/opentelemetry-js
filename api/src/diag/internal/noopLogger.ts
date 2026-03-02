/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import { DiagLogger } from '../types';

function noopLogFunction() {}

/**
 * Returns a No-Op Diagnostic logger where all messages do nothing.
 * @implements {@link DiagLogger}
 * @returns {DiagLogger}
 */
export function createNoopDiagLogger(): DiagLogger {
  return {
    verbose: noopLogFunction,
    debug: noopLogFunction,
    info: noopLogFunction,
    warn: noopLogFunction,
    error: noopLogFunction,
  };
}
