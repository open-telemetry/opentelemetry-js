/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Any exports here may change at any time and without warning
 * @module @opentelemetry/api/experimental
 */

export { wrapTracer, SugaredTracer } from './trace/SugaredTracer';
export type { SugaredSpanOptions } from './trace/SugaredOptions';
export { createNoopLogger, logs, SeverityNumber } from './logs';
export type { Logger, LoggerOptions, LoggerProvider, LogRecord } from './logs';
