/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import type { Context } from '../context/types';
import type { TextMapPropagator } from './TextMapPropagator';

/**
 * No-op implementations of {@link TextMapPropagator}.
 */
export class NoopTextMapPropagator implements TextMapPropagator {
  /** Noop inject function does nothing */
  inject(_context: Context, _carrier: unknown): void {}
  /** Noop extract function does nothing and returns the input context */
  extract(context: Context, _carrier: unknown): Context {
    return context;
  }
  fields(): string[] {
    return [];
  }
}
