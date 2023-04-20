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

import { TracerProvider, diag, trace } from '@opentelemetry/api';
import * as RequireInTheMiddle from 'require-in-the-middle';
import type { Tracer, CoreTracer } from '@opencensus/core';

import { ShimTracer } from './ShimTracer';
import { VERSION } from './version';

type CoreTracerConstructor = new (
  ...args: ConstructorParameters<typeof CoreTracer>
) => Tracer;

let hook: RequireInTheMiddle.Hooked | null = null;

interface OpenCensusShimConfig {
  tracerProvider?: TracerProvider | undefined;
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
  tracerProvider = trace.getTracerProvider(),
}: OpenCensusShimConfig = {}): void {
  const tracer = tracerProvider.getTracer(
    'opentelemetry-shim-opencensus',
    VERSION
  );

  diag.info('Installing OpenCensus shim require-in-the-middle hook');
  hook = RequireInTheMiddle<{
    CoreTracer: CoreTracerConstructor;
  }>(['@opencensus/core'], exports => {
    return {
      ...exports,
      CoreTracer: ShimTracer.bind(null, tracer),
    };
  });
}

export function uninstallShim(): void {
  hook?.unhook();
}
