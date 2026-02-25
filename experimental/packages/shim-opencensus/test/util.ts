/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
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
