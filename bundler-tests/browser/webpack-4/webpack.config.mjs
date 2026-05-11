import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('./node_modules/@types/webpack').Configuration} */
export default {
  mode: 'production',
  entry: './src/index.js',
  target: 'web',
  performance: { hints: false },
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
  },
  resolve: {
    // Webpack 4 doesn't read the package.json `exports` field, so consumers
    // on webpack 4 must manually alias each @opentelemetry package they use
    // to its ESM `.mjs` build. Add an entry per top-level package and per
    // subpath export. The map below covers everything this test imports
    // (directly or transitively); copy and trim as needed for your own app.
    alias: {
      '@opentelemetry/api$':
        '@opentelemetry/api/dist/index.mjs',
      '@opentelemetry/api-logs$':
        '@opentelemetry/api-logs/dist/index.mjs',
      '@opentelemetry/core$':
        '@opentelemetry/core/dist/index.mjs',
      '@opentelemetry/exporter-logs-otlp-http$':
        '@opentelemetry/exporter-logs-otlp-http/dist/index.mjs',
      '@opentelemetry/exporter-metrics-otlp-http$':
        '@opentelemetry/exporter-metrics-otlp-http/dist/index.mjs',
      '@opentelemetry/exporter-trace-otlp-http$':
        '@opentelemetry/exporter-trace-otlp-http/dist/index.mjs',
      '@opentelemetry/instrumentation$':
        '@opentelemetry/instrumentation/dist/index.mjs',
      '@opentelemetry/instrumentation-fetch$':
        '@opentelemetry/instrumentation-fetch/dist/index.mjs',
      '@opentelemetry/instrumentation-xml-http-request$':
        '@opentelemetry/instrumentation-xml-http-request/dist/index.mjs',
      '@opentelemetry/opentelemetry-browser-detector$':
        '@opentelemetry/opentelemetry-browser-detector/dist/index.mjs',
      '@opentelemetry/propagator-b3$':
        '@opentelemetry/propagator-b3/dist/index.mjs',
      '@opentelemetry/resources$':
        '@opentelemetry/resources/dist/index.mjs',
      '@opentelemetry/sdk-logs$':
        '@opentelemetry/sdk-logs/dist/index.mjs',
      '@opentelemetry/sdk-metrics$':
        '@opentelemetry/sdk-metrics/dist/index.mjs',
      '@opentelemetry/sdk-trace-base$':
        '@opentelemetry/sdk-trace-base/dist/index.mjs',
      '@opentelemetry/sdk-trace-web$':
        '@opentelemetry/sdk-trace-web/dist/index.mjs',
      '@opentelemetry/web-common$':
        '@opentelemetry/web-common/dist/index.mjs',

      '@opentelemetry/otlp-exporter-base$':
        '@opentelemetry/otlp-exporter-base/dist/index.mjs',
      '@opentelemetry/semantic-conventions$':
        '@opentelemetry/semantic-conventions/dist/index.mjs',

      // Subpath exports (also invisible to webpack 4 without manual mapping).
      '@opentelemetry/semantic-conventions/incubating':
        '@opentelemetry/semantic-conventions/dist/index-incubating.mjs',
      '@opentelemetry/otlp-exporter-base/browser-http':
        '@opentelemetry/otlp-exporter-base/dist/index-browser-http.mjs',

      // Browser-only entry: protobuf doesn't run in browsers (CSPs block the
      // dynamic code evaluation protobufjs uses), and pulling protobufjs in
      // forces rolldown to emit a `node:module` import that breaks bundling.
      // Use the JSON-only entry from `@opentelemetry/otlp-transformer`'s
      // exports `browser` condition.
      '@opentelemetry/otlp-transformer$':
        '@opentelemetry/otlp-transformer/dist/index-browser.mjs',
    },
  },
  module: {
    rules: [
      {
        test: /\.(?:js|mjs|cjs)$/,
        // Include OpenTelemetry ES2022 packages for transpilation
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
