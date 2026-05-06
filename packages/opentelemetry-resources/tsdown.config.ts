import { defineConfig } from 'tsdown';
import baseConfig from '../../tsdown.config.ts';

// Adding the platform barrels as entries prevents tsdown's tree-shaking
// from inlining `import './detectors/platform'` in consuming modules down
// to the node-specific implementation. Keeping the indirection in dist
// lets the package.json#browser field path-swap node->browser at bundle
// time for downstream consumers.
export default defineConfig({
  ...baseConfig,
  entry: [
    'src/index.ts',
    'src/detectors/platform/index.ts',
    'src/detectors/platform/browser/index.ts',
  ],
});
