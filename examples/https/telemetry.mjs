// Setup the OpenTelemetry SDK for tracing, and instrumenting `https` usage.
// This doesn't currently setup for metrics or logs.

import { context, propagation, trace } from '@opentelemetry/api';
import { SimpleSpanProcessor, TracerProvider } from '@opentelemetry/sdk-trace';
import { CompositePropagator, W3CBaggagePropagator, W3CTraceContextPropagator } from '@opentelemetry/core';
import { AsyncLocalStorageContextManager } from '@opentelemetry/context-async-hooks';
import { ZipkinExporter } from '@opentelemetry/exporter-zipkin';
import { ATTR_SERVICE_NAME } from '@opentelemetry/semantic-conventions';
import { defaultResource, resourceFromAttributes } from '@opentelemetry/resources';
import { registerInstrumentations } from '@opentelemetry/instrumentation';
import { HttpInstrumentation } from '@opentelemetry/instrumentation-http';

const serviceName = process.env.OTEL_SERVICE_NAME;

const exporter = new ZipkinExporter();
const tracerProvider = new TracerProvider({
  resource: defaultResource().merge(
    resourceFromAttributes({ [ATTR_SERVICE_NAME]: serviceName }),
  ),
  spanProcessors: [new SimpleSpanProcessor({ exporter })]
});
trace.setGlobalTracerProvider(tracerProvider);

context.setGlobalContextManager(new AsyncLocalStorageContextManager());

propagation.setGlobalPropagator(new CompositePropagator({
  propagators: [new W3CTraceContextPropagator(), new W3CBaggagePropagator()],
}));

registerInstrumentations({
  instrumentations: [ new HttpInstrumentation() ],
});
