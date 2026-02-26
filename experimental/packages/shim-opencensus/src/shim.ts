/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import { diag, trace, Tracer } from '@opentelemetry/api';
import { Hook } from 'require-in-the-middle';
import * as oc from '@opencensus/core';

import { ShimTracer } from './ShimTracer';
import { VERSION } from './version';

type CoreTracerConstructor = new (
  ...args: ConstructorParameters<typeof oc.CoreTracer>
) => oc.Tracer;

let hook: Hook | null = null;

interface OpenCensusShimConfig {
  /**
   * An optional OpenTelemetry tracer to send OpenCensus spans to. If not provided, one will be
   * created for you.
   */
  tracer?: Tracer | undefined;
}

/**
 * Patches OpenCensus to redirect all instrumentation to OpenTelemetry. Uses
 * require-in-the-middle to override the implementation of OpenCensus's CoreTracer.
 *
 * Use {@link uninstallShim} to undo the effects of this function.
 *
 * @param config
 */
export function installShim({
  tracer = trace.getTracer('@opentelemetry/shim-opencensus', VERSION),
}: OpenCensusShimConfig = {}): void {
  diag.info('Installing OpenCensus shim require-in-the-middle hook');

  hook = new Hook(['@opencensus/core'], exports => {
    const CoreTracer: CoreTracerConstructor = ShimTracer.bind(null, tracer);
    return {
      ...exports,
      CoreTracer,
    };
  });
}

export function uninstallShim(): void {
  hook?.unhook();
}
