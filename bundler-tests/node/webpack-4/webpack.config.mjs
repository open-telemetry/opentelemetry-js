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
    mainFields: ['module', 'main'],
    alias: {
      // Webpack 4 doesn't support package.json exports field, so we need to manually map the node-http subpath
      '@opentelemetry/otlp-exporter-base/node-http':
        '@opentelemetry/otlp-exporter-base/dist/index-node-http.mjs',
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
            // modules: false leaves ESM imports/exports intact so webpack can
            // do its own tree-shaking; without this, preset-env converts to
            // CJS and named imports against the OpenTelemetry .mjs files fail.
            presets: [['@babel/preset-env', { modules: false }]],
          },
        },
      },
    ],
  },
};
