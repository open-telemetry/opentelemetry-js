'use strict';

import { ConsoleSpanExporter, InMemorySpanExporter, SimpleSpanProcessor } from '@opentelemetry/sdk-trace-base';
import { WebTracerProvider } from '@opentelemetry/sdk-trace-web';
import { ZoneContextManager } from '@opentelemetry/context-zone-peer-dep';
import { registerInstrumentations } from '@opentelemetry/instrumentation';

/**
 * Function helper to load the tracing with predefined instrumentations
 * @param instrumentations
 * @return {WebTracerProvider}
 */
export function loadOtel(instrumentations) {
  const provider = new WebTracerProvider();
  const memoryExporter = new InMemorySpanExporter();
  provider.addSpanProcessor(new SimpleSpanProcessor(memoryExporter));
  provider.addSpanProcessor(new SimpleSpanProcessor(new ConsoleSpanExporter()));
  provider.register({
    contextManager: new ZoneContextManager(),
  });

  registerInstrumentations({
    instrumentations: [
      instrumentations,
    ],
  });
  window.otel = Object.assign({}, window.otel, {
    provider,
    memoryExporter,
  });
  return provider;
}