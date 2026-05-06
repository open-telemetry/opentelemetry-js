import { defineConfig } from 'tsdown';
import baseConfig from '../../../tsdown.config.ts';

// Two entry points:
// - `index.ts`: full surface (includes Protobuf serializers via protobufjs).
//   This pulls in rolldown's CJS-interop runtime helper, which imports
//   `node:module` and is therefore not browser-safe.
// - `index-browser.ts`: JSON-only surface for browser consumers. Routed via
//   the `browser` condition in package.json `exports`.
export default defineConfig({
  ...baseConfig,
  entry: ['src/index.ts', 'src/index-browser.ts'],
});
