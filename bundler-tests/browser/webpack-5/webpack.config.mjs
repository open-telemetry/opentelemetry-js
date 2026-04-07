import path from 'node:path';
import { fileURLToPath } from 'node:url';

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
  module: {
    rules: [
      {
        // Packages like protobufjs lack an "exports" field, so webpack 5
        // falls back to file-path resolution for subpath imports (e.g.
        // "protobufjs/minimal"). In .mjs files, fullySpecified mode then
        // requires a file extension on the resolved path, which fails.
        // Disabling fullySpecified restores normal node_modules resolution.
        test: /\.m?js/,
        resolve: {
          fullySpecified: false,
        },
      },
    ],
  },
};
