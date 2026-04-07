import { defineConfig, mergeConfig } from 'vitest/config';
import baseConfig from '../../../vitest.base.browser.config.mts';

export default mergeConfig(
  baseConfig,
  defineConfig({
    test: {
      include: ['test/**/*.test.ts'],
      exclude: [
        // TODO: re-enable after protobuf codegen supports ESM (currently requires CommonJS)
        'test/trace.test.ts',
        'test/logs.test.ts',
        'test/metrics.test.ts',
        'test/protobuf/common-serializer.test.ts',
        'test/protobuf/protobuf-writer.test.ts',
      ],
    },
  })
);
