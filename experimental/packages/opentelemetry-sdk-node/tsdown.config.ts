import { defineConfig } from 'tsdown';
import baseConfig from '../../../tsdown.config.ts';

export default defineConfig({
  ...baseConfig,
  entry: ['src/index.ts'],
  // Optional peer dep loaded via `require()` only when configured; it is not a
  // declared dependency, so keep tsdown from bundling it (and its transitive
  // tree, e.g. semver, which trips rolldown's CJS interop) into dist.
  external: ['@opentelemetry/shim-opencensus'],
});
