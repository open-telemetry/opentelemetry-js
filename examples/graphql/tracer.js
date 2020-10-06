'use strict';

const { GraphQLPlugin } = require('@opentelemetry/plugin-graphql');

const { ConsoleSpanExporter, SimpleSpanProcessor } = require('@opentelemetry/tracing');
const { NodeTracerProvider } = require('@opentelemetry/node');
const { CollectorTraceExporter } = require('@opentelemetry/exporter-collector');

const exporter = new CollectorTraceExporter({
  serviceName: 'basic-service',
});

const provider = new NodeTracerProvider({
  plugins: {
    http: { enabled: false, path: '@opentelemetry/plugin-http' },
    https: { enabled: false, path: '@opentelemetry/plugin-https' },
    express: { enabled: false, path: '@opentelemetry/plugin-express' },
  },
});

const graphQLPlugin = new GraphQLPlugin({
  // allowAttributes: true,
  // depth: 2,
  // mergeItems: true,
});

graphQLPlugin.setTracerProvider(provider);

graphQLPlugin.enable();

provider.addSpanProcessor(new SimpleSpanProcessor(exporter));
provider.addSpanProcessor(new SimpleSpanProcessor(new ConsoleSpanExporter()));
provider.register();
