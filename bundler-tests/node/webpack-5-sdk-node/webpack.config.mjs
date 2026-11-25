import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('./node_modules/@types/webpack').Configuration} */
export default {
  mode: 'production',
  entry: './src/index.js',
  target: 'node',
  resolve: {
    mainFields: ['main'],
  },
  // debug's optional supports-color require only resolves when it is hoisted.
  ignoreWarnings: [/Critical dependency/, /Can't resolve 'supports-color'/],
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
  },
};
