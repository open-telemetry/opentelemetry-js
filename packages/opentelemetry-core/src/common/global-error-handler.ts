/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import { Exception } from '@opentelemetry/api';
import { loggingErrorHandler } from './logging-error-handler';
import { ErrorHandler } from './types';

/** The global error handler delegate */
let delegateHandler = loggingErrorHandler();

/**
 * Set the global error handler
 * @param {ErrorHandler} handler
 */
export function setGlobalErrorHandler(handler: ErrorHandler): void {
  delegateHandler = handler;
}

/**
 * Return the global error handler
 * @param {Exception} ex
 */
export function globalErrorHandler(ex: Exception): void {
  try {
    delegateHandler(ex);
  } catch {} // eslint-disable-line no-empty
}
