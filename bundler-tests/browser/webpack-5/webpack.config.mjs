import path from 'node:path';
import { fileURLToPath } from 'node:url';
import webpack from 'webpack';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('./node_modules/@types/webpack').Configuration} */
export default {
  mode: 'production',
  entry: './src/index.js',
  target: 'web',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
  },
  resolve: {
    // tsdown's rolldown runtime emits `import { createRequire } from "node:module"`
    // for ESM->CJS interop (e.g. protobufjs in @opentelemetry/otlp-transformer).
    // Stub it for browser builds; the createRequire helper is only reached on
    // node-only code paths that aren't bundled here.
    fallback: {
      module: false,
      path: false,
      fs: false,
      util: false,
      os: false,
    },
  },
  plugins: [
    // Webpack 5 doesn't strip the `node:` URI prefix; map it to the bare module
    // name so resolve.fallback can pick it up.
    new webpack.NormalModuleReplacementPlugin(/^node:/, resource => {
      resource.request = resource.request.replace(/^node:/, '');
    }),
  ],
};
