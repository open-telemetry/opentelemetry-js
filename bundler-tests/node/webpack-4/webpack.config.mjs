import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('./node_modules/@types/webpack').Configuration} */
export default {
  mode: 'production',
  entry: './src/index.js',
  target: 'node',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
  },
  resolve: {
    // Webpack 4 doesn't read the package.json `exports` field, so consumers
    // on webpack 4 must manually alias each @opentelemetry package they use
    // to a concrete dist file. We point at the `.cjs` builds for the node
    // target because webpack 4 cannot parse `import.meta.url`, which appears
    // in the rolldown ESM->CJS interop helper that some packages emit. The
    // map below covers everything this test imports (directly or transitively);
    // copy and trim as needed for your own app.
    alias: {
      '@opentelemetry/api$':
        '@opentelemetry/api/dist/index.cjs',
      '@opentelemetry/api-logs$':
        '@opentelemetry/api-logs/dist/index.cjs',
      '@opentelemetry/core$':
        '@opentelemetry/core/dist/index.cjs',
      '@opentelemetry/exporter-logs-otlp-http$':
        '@opentelemetry/exporter-logs-otlp-http/dist/index.cjs',
      '@opentelemetry/exporter-metrics-otlp-http$':
        '@opentelemetry/exporter-metrics-otlp-http/dist/index.cjs',
      '@opentelemetry/exporter-trace-otlp-http$':
        '@opentelemetry/exporter-trace-otlp-http/dist/index.cjs',
      '@opentelemetry/instrumentation$':
        '@opentelemetry/instrumentation/dist/index.cjs',
      '@opentelemetry/otlp-exporter-base$':
        '@opentelemetry/otlp-exporter-base/dist/index.cjs',
      '@opentelemetry/otlp-transformer$':
        '@opentelemetry/otlp-transformer/dist/index.cjs',
      '@opentelemetry/propagator-b3$':
        '@opentelemetry/propagator-b3/dist/index.cjs',
      '@opentelemetry/resources$':
        '@opentelemetry/resources/dist/index.cjs',
      '@opentelemetry/sdk-logs$':
        '@opentelemetry/sdk-logs/dist/index.cjs',
      '@opentelemetry/sdk-metrics$':
        '@opentelemetry/sdk-metrics/dist/index.cjs',
      '@opentelemetry/sdk-trace-base$':
        '@opentelemetry/sdk-trace-base/dist/index.cjs',
      '@opentelemetry/semantic-conventions$':
        '@opentelemetry/semantic-conventions/dist/index.cjs',

      // Subpath exports (also invisible to webpack 4 without manual mapping).
      '@opentelemetry/semantic-conventions/incubating':
        '@opentelemetry/semantic-conventions/dist/index-incubating.cjs',
      '@opentelemetry/otlp-exporter-base/node-http':
        '@opentelemetry/otlp-exporter-base/dist/index-node-http.cjs',
    },
  },
  module: {
    rules: [
      {
        test: /\.(?:js|mjs|cjs)$/,
        exclude: /node_modules\/(?!@opentelemetry)/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [['@babel/preset-env']],
          },
        },
      },
    ],
  },
};
