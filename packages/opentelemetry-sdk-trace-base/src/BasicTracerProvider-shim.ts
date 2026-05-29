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
import type { TracerConfig } from './types-shim';
import { reconfigureLimits } from './utility';
import { TracerProvider } from '@opentelemetry/sdk-trace';
// XXX
// import type { InspectFn, InspectStylizeOptions } from './inspect';
// import { inspectCustom } from './inspect';

// XXX could we *subclass* TracerProvider?

/**
 * A TracerProvider implementation that reads configuration defaults from
 * OTEL_* environment variables per
 * https://opentelemetry.io/docs/specs/otel/configuration/sdk-environment-variables/
 *
 * XXX deprecate when have an alternative init function that handles envvars
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

  // XXX use inspectCustom in core?
  // [inspectCustom](
  //   depth: number,
  //   options: InspectStylizeOptions | undefined,
  //   inspect: InspectFn | undefined
  // ): unknown {
  //   return this._delegate[inspectCustom](depth, options, inspect);
  // }
}
