'use strict';

const { GraphQLInstrumentation } = require('@opentelemetry/instrumentation-graphql');

const { ConsoleSpanExporter, SimpleSpanProcessor } = require('@opentelemetry/tracing');
const { NodeTracerProvider } = require('@opentelemetry/node');
const { BasicTracerProvider } = require('@opentelemetry/tracing');
const { CollectorTraceExporter } = require('@opentelemetry/exporter-collector');
const { registerInstrumentations } = require('@opentelemetry/instrumentation');
const httpPlugin = require('@opentelemetry/plugin-http').plugin;
const httpsPlugin = require('@opentelemetry/plugin-https').plugin;
const expressPlugin = require('@opentelemetry/plugin-express').plugin;
const { ConsoleLogger } = require('@opentelemetry/core');
const { AsyncHooksContextManager, AsyncLocalStorageContextManager } = require('@opentelemetry/context-async-hooks');

const provider = new BasicTracerProvider();

// const provider = new NodeTracerProvider({
//   plugins: {
//     http: { enabled: false },
//     https: { enabled: false },
//     express: { enabled: false },
//   },
// });

const currentDir = __dirname;
registerInstrumentations({
  instrumentations: [
    // new GraphQLInstrumentation(),
    GraphQLInstrumentation,
    {
      plugins: {
        // http: { enabled: true, path: `${currentDir}/node_modules/@opentelemetry/plugin-http/build/src/` },
        https: { enabled: false, path: `${currentDir}/node_modules/@opentelemetry/plugin-https/build/src/` },
        express: { enabled: true, path: `${currentDir}/node_modules/@opentelemetry/plugin-express/build/src/` },

        http: { enabled: true, plugin: httpPlugin },
        // https: { enabled: true, plugin: httpsPlugin },
        // express: { enabled: true, path: '@opentelemetry/plugin-express' },

        // http: { enabled: false, path: '@opentelemetry/plugin-http' },
        // https: { enabled: false, path: '@opentelemetry/plugin-https' },
        // express: { enabled: true, plugin: expressPlugin },
      },
    },
  ],
  tracerProvider: provider,
  logger: new ConsoleLogger()
});

const exporter = new CollectorTraceExporter({
  serviceName: 'basic-service',
});

// const provider = new NodeTracerProvider({
//   plugins: {
//     http: { enabled: false },
//     https: { enabled: false },
//     express: { enabled: false },
//         http: { enabled: true, path: `${currentDir}/node_modules/@opentelemetry/plugin-http/build/src/` },
//         https: { enabled: false, path: `${currentDir}/node_modules/@opentelemetry/plugin-https/build/src/` },
//         express: { enabled: true, path: `${currentDir}/node_modules/@opentelemetry/plugin-express/build/src/` },
//   },
// });

// const graphQLInstrumentation = new GraphQLInstrumentation({
//   // allowAttributes: true,
//   // depth: 2,
//   // mergeItems: true,
// });
//
// graphQLInstrumentation.setTracerProvider(provider);
//
// graphQLInstrumentation.enable();
//
provider.addSpanProcessor(new SimpleSpanProcessor(exporter));
provider.addSpanProcessor(new SimpleSpanProcessor(new ConsoleSpanExporter()));
    // if (config.contextManager === undefined) {
    //   const ContextManager = semver.gte(process.version, '14.8.0')
    //     ? AsyncLocalStorageContextManager
    //     : AsyncHooksContextManager;
    //   config.contextManager = new ContextManager();
    //   config.contextManager.enable();
    // }

provider.register({
  contextManager: new AsyncLocalStorageContextManager(),
  // contextManager: new AsyncHooksContextManager(),
});
