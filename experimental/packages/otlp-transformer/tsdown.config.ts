import { defineConfig } from 'tsdown';
import baseConfig from '../../../tsdown.config.ts';

// Three entry points:
// - `index.ts`: full surface (JSON + Protobuf serializers). Pulls in
//   rolldown's CJS-interop runtime helper for protobufjs, so it's not
//   browser-safe.
// - `index-browser.ts`: JSON-only surface for browser consumers. Routed via
//   the `browser` condition in package.json `exports["."]`.
// - `index-protobuf.ts`: Protobuf-only surface, exposed via `exports["./protobuf"]`.
//   Used by the OTLP-over-protobuf exporters; node-only at bundle time.
export default defineConfig({
  ...baseConfig,
  entry: [
    'src/index.ts',
    'src/index-browser.ts',
    'src/index-protobuf.ts',
  ],
});
