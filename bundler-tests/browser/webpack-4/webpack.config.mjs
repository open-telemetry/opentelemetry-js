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
    alias: {
      // Webpack 4 doesn't support package.json exports field, so we need to manually map subpath exports
      '@opentelemetry/otlp-exporter-base/browser-http':
        '@opentelemetry/otlp-exporter-base/build/esm/index-browser-http.js',
      // @bufbuild/protobuf subpath exports
      '@bufbuild/protobuf/codegenv1':
        '@bufbuild/protobuf/dist/esm/codegenv1/index.js',
      '@bufbuild/protobuf/wkt': '@bufbuild/protobuf/dist/esm/wkt/index.js',
      '@bufbuild/protobuf/wire': '@bufbuild/protobuf/dist/esm/wire/index.js',
      '@bufbuild/protobuf/reflect':
        '@bufbuild/protobuf/dist/esm/reflect/index.js',
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
