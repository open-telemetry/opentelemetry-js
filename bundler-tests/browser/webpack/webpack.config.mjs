import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default {
  entry: './src/emit-event.js',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
    clean: false
  },
  devServer: {
    static: {
      directory: path.resolve(__dirname, 'dist/'),
    },
  },
  mode: 'development'
};
