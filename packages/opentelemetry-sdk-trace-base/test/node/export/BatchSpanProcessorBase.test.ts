/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
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
      const exporter = new InMemorySpanExporter();
      const bspConfig = {
        OTEL_BSP_MAX_EXPORT_BATCH_SIZE: 256,
        OTEL_BSP_SCHEDULE_DELAY: 2500,
      };

      let env: Record<string, any>;
      if (global.process?.versions?.node === undefined) {
        env = globalThis as unknown as Record<string, any>;
      } else {
        env = process.env as Record<string, any>;
      }

      Object.entries(bspConfig).forEach(([k, v]) => {
        env[k] = v;
      });

      const processor = new BatchSpanProcessor(exporter);
      assert.ok(processor instanceof BatchSpanProcessor);
      assert.strictEqual(processor['_maxExportBatchSize'], 256);
      assert.strictEqual(processor['_scheduledDelayMillis'], 2500);
      processor.shutdown();

      Object.keys(bspConfig).forEach(k => delete env[k]);
    });
  });
});
