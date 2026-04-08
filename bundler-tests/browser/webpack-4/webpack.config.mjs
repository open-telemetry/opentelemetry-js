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
    // Prefer browser and ESM builds
    mainFields: ['browser', 'module', 'main'],
    extensions: ['.mjs', '.js', '.cjs', '.json'],
    alias: {
      // Webpack 4 doesn't support package.json exports field, so we need to manually map the browser-http subpath
      '@opentelemetry/otlp-exporter-base/browser-http':
        '@opentelemetry/otlp-exporter-base/build/browser-http/index.mjs',
      // Force webpack 4 to use ESM builds for packages with dual .mjs/.cjs outputs.
      // Without this, webpack 4 may resolve to the CJS entry (main field),
      // bypassing the browser field mappings which only cover .mjs paths.
      '@opentelemetry/resources': '@opentelemetry/resources/build/index.mjs',
      '@opentelemetry/instrumentation':
        '@opentelemetry/instrumentation/build/index.mjs',
    },
  },
  module: {
    rules: [
      {
        test: /\.(?:js|mjs|cjs)$/,
        type: 'javascript/auto',
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
