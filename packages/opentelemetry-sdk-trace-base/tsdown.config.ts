import { defineConfig } from 'tsdown';
import baseConfig from '../../tsdown.config.ts';

// Now a thin compat shim re-exporting @opentelemetry/sdk-trace; the platform
// barrels moved to that package, so the only entry is the shim.
export default defineConfig({
  ...baseConfig,
  entry: ['src/index-shim.ts'],
});
