import { defineConfig } from 'tsdown';
import baseConfig from '../tsdown.config.ts';

// `@opentelemetry/api` promises Node >=8.0.0 (see package.json#engines), so
// override the workspace-wide es2022 target to es2017 — the highest level
// Node 8.10 fully supports — to keep the backcompat smoke test honest.
export default defineConfig({
  ...baseConfig,
  entry: ['src/index.ts', 'src/experimental/index.ts'],
  target: 'es2017',
});
