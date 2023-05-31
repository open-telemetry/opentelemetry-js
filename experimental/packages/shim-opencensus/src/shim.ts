/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
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
