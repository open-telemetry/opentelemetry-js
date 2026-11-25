import { defineConfig } from 'tsdown';
import baseConfig from '../tsdown.config.ts';

// `@opentelemetry/api` supports Node >=8.0.0 (package.json#engines), so target
// es2017, the highest level Node 8.10 fully supports, not the shared es2022.
export default defineConfig({
  ...baseConfig,
  entry: ['src/index.ts', 'src/experimental/index.ts'],
  target: 'es2017',
});
