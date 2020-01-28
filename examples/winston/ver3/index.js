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
const loggerOptions = {
  format: winston.format.json(),
  defaultMeta: { service: 'user-service' },
  transports: [
    new winston.transports.Console(),
  ]
};
const logger = winston.createLogger(loggerOptions);

const span = tracer.startSpan('test');
tracer.withSpan(span, () => {
  logger.info('Log this info - trace will be added automatically');
});
span.end();
