/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import { NoopTracer } from './NoopTracer';
import { Tracer } from './tracer';
import { TracerOptions } from './tracer_options';
import { TracerProvider } from './tracer_provider';

/**
 * An implementation of the {@link TracerProvider} which returns an impotent
 * Tracer for all calls to `getTracer`.
 *
 * All operations are no-op.
 */
export class NoopTracerProvider implements TracerProvider {
  getTracer(
    _name?: string,
    _version?: string,
    _options?: TracerOptions
  ): Tracer {
    return new NoopTracer();
  }
}
