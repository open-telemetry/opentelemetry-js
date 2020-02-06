'use strict';

const opentelemetry = require('@opentelemetry/api');
const { LogLevel } = require('@opentelemetry/core');
const { NodeTracerProvider } = require('@opentelemetry/node');
const { SimpleSpanProcessor, ConsoleSpanExporter } = require('@opentelemetry/tracing');
const { CollectorExporter } = require('@opentelemetry/exporter-collector');

const provider = new NodeTracerProvider({
  logLevel: LogLevel.DEBUG,
  plugins: {
    winston: {
      enabled: true,
      path: '@opentelemetry/plugin-winston',
    },
  },
});

const exporter = new CollectorExporter({ serviceName: 'basic-service' });
provider.addSpanProcessor(new SimpleSpanProcessor(exporter));

provider.addSpanProcessor(new SimpleSpanProcessor(new ConsoleSpanExporter()));
opentelemetry.trace.initGlobalTracerProvider(provider);

const tracer = provider.getTracer('example-winston');

const winston = require('winston');

const span = tracer.startSpan('main');
tracer.withSpan(span, () => {
  winston.info('Log this info - trace will be added automatically');
});

span.end();
