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

import {
  AlwaysOnSampler,
  BasicTracerProvider,
  InMemorySpanExporter,
  ReadableSpan,
  SimpleSpanProcessor,
} from '@opentelemetry/sdk-trace-base';
import { ShimTracer } from '../src/ShimTracer';
import { AsyncLocalStorageContextManager } from '@opentelemetry/context-async-hooks';
import { Tracer, TracerProvider, context } from '@opentelemetry/api';

export async function withTestTracer(
  func: (shimTracer: ShimTracer, otelTracer: Tracer) => void | Promise<void>
): Promise<ReadableSpan[]> {
  return await withTestTracerProvider(tracerProvider =>
    func(
      new ShimTracer(tracerProvider.getTracer('test-shim')),
      tracerProvider.getTracer('test-otel')
    )
  );
}

export async function withTestTracerProvider(
  func: (otelTracerProvider: TracerProvider) => void | Promise<void>
): Promise<ReadableSpan[]> {
  const inMemExporter = new InMemorySpanExporter();
  const tracerProvider = new BasicTracerProvider({
    sampler: new AlwaysOnSampler(),
    spanProcessors: [new SimpleSpanProcessor(inMemExporter)],
  });

  await func(tracerProvider);

  await tracerProvider.forceFlush();
  const spans = inMemExporter.getFinishedSpans();
  await tracerProvider.shutdown();
  return spans;
}

export function setupNodeContextManager(
  before: Mocha.HookFunction,
  after: Mocha.HookFunction
) {
  const instance = new AsyncLocalStorageContextManager();
  instance.enable();
  before(() => context.setGlobalContextManager(instance));
  after(() => context.disable());
}
