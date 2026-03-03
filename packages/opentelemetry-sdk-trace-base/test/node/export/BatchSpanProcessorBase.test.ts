/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import * as assert from 'assert';
import { BufferConfig, InMemorySpanExporter } from '../../../src';
import { BatchSpanProcessorBase } from '../../../src/export/BatchSpanProcessorBase';

class BatchSpanProcessor extends BatchSpanProcessorBase<BufferConfig> {
  onShutdown() {}
}

describe('BatchSpanProcessorBase', () => {
  describe('constructor', () => {
    it('should read defaults from environment', () => {
      const bspConfig = {
        OTEL_BSP_MAX_EXPORT_BATCH_SIZE: 256,
        OTEL_BSP_SCHEDULE_DELAY: 2500,
      };

      Object.assign(process.env, bspConfig);

      const processor = new BatchSpanProcessor(new InMemorySpanExporter());

      assert.ok(processor instanceof BatchSpanProcessor);
      assert.strictEqual(processor['_maxExportBatchSize'], 256);
      assert.strictEqual(processor['_scheduledDelayMillis'], 2500);
      processor.shutdown();

      Object.keys(bspConfig).forEach(k => delete process.env[k]);
    });
  });
});
