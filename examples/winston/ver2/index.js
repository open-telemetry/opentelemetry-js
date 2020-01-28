const opentelemetry = require('@opentelemetry/core');
const { NodeTracerRegistry } = require('@opentelemetry/node');
const { SimpleSpanProcessor, ConsoleSpanExporter } = require('@opentelemetry/tracing');
const { CollectorExporter } = require('@opentelemetry/exporter-collector');

const registry = new NodeTracerRegistry({
  logLevel: opentelemetry.LogLevel.DEBUG,
  plugins: {
    winston: {
      enabled: true,
      path: '@opentelemetry/plugin-winston'
    }
  }
});

const exporter = new CollectorExporter({serviceName: 'basic-service'});
registry.addSpanProcessor(new SimpleSpanProcessor(exporter));

registry.addSpanProcessor(new SimpleSpanProcessor(new ConsoleSpanExporter()));
opentelemetry.initGlobalTracerRegistry(registry);

const tracer = opentelemetry.getTracer('example-winston');

const winston = require('winston');

const span = tracer.startSpan('main');
tracer.withSpan(span, () => {
  winston.info('Log this info - trace will be added automatically');
});

span.end();
