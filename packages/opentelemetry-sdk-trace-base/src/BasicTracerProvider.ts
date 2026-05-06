/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import type {
  TracerProvider as ApiTracerProvider,
  Tracer as ApiTracer,
} from '@opentelemetry/api';
import { merge } from '@opentelemetry/core';
import { loadDefaultConfig } from './config';
import type { TracerConfig } from './types';
import { reconfigureLimits } from './utility';
import { TracerProvider } from './TracerProvider';

export enum ForceFlushState {
  'resolved',
  'timeout',
  'error',
  'unresolved',
}

/**
 * This class represents a basic tracer provider which platform libraries can extend
 *
 * @deprecated this class and package will be removed in next major (3.0) and replaced by
 * the `TracerProvider` class of the future `@opentelemetry/sdk-trace` package.
 */
export class BasicTracerProvider implements ApiTracerProvider {
  private _delegate: TracerProvider;
  constructor(config: TracerConfig = {}) {
    const mergedConfig = merge(
      {},
      loadDefaultConfig(),
      reconfigureLimits(config)
    );
    this._delegate = new TracerProvider(mergedConfig);
  }

  getTracer(
    name: string,
    version?: string,
    options?: { schemaUrl?: string }
  ): ApiTracer {
    return this._delegate.getTracer(name, version, options);
  }

  forceFlush(): Promise<void> {
    return this._delegate.forceFlush();
  }

  shutdown(): Promise<void> {
    return this._delegate.shutdown();
  }
}
