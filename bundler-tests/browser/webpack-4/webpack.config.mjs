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
    alias: {
      // Webpack 4 doesn't support package.json exports field, so we need to manually map the browser-http subpath
      '@opentelemetry/otlp-exporter-base/browser-http':
        '@opentelemetry/otlp-exporter-base/build/esm/index-browser-http.js',
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
