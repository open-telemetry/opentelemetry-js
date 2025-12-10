import { fileURLToPath } from 'url';
import path from 'path';
import HtmlWebpackPlugin from 'html-webpack-plugin';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('./node_modules/@types/webpack').Configuration} */
export default {
  mode: 'development',
  entry: './src/index.js',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
  },
  resolve: {
    // Prefer browser and ESM builds
    mainFields: ['browser', 'module', 'main'],
    extensions: ['.mjs', '.js', '.cjs', '.json'],
    alias: {
      // Webpack 4 doesn't support package.json exports field - subpath exports need aliases
      '@opentelemetry/otlp-exporter-base/browser-http':
        '@opentelemetry/otlp-exporter-base/build/browser-http/index.mjs',
      '@bufbuild/protobuf/codegenv1':
        '@bufbuild/protobuf/dist/esm/codegenv1/index.js',
      '@bufbuild/protobuf/wkt': '@bufbuild/protobuf/dist/esm/wkt/index.js',
      '@bufbuild/protobuf/wire': '@bufbuild/protobuf/dist/esm/wire/index.js',
      '@bufbuild/protobuf/reflect':
        '@bufbuild/protobuf/dist/esm/reflect/index.js',
      // Force ESM entry points (mainFields alone is insufficient for these packages)
      '@opentelemetry/api-logs$': '@opentelemetry/api-logs/build/index.mjs',
      '@opentelemetry/core$': '@opentelemetry/core/build/index.mjs',
      '@opentelemetry/otlp-exporter-base$':
        '@opentelemetry/otlp-exporter-base/build/index.mjs',
      '@opentelemetry/otlp-transformer$':
        '@opentelemetry/otlp-transformer/build/index.mjs',
      '@opentelemetry/resources$': '@opentelemetry/resources/build/index.mjs',
      '@opentelemetry/sdk-logs$': '@opentelemetry/sdk-logs/build/index.mjs',
      '@opentelemetry/sdk-metrics$':
        '@opentelemetry/sdk-metrics/build/index.mjs',
      '@opentelemetry/semantic-conventions$':
        '@opentelemetry/semantic-conventions/build/index.mjs',
    },
  },
  module: {
    rules: [
      {
        test: /\.mjs$/,
        type: 'javascript/auto',
      },
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
  devServer: {
    static: {
      directory: path.resolve(__dirname, 'dist/'),
    },
  },
  plugins: [
    new HtmlWebpackPlugin({
      title: 'Development',
      template: 'index.html',
    }),
  ],
};
