/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import * as assert from 'assert';
import { BatchSpanProcessor } from '../../src/BatchSpanProcessor-shim';
import {
  BatchSpanProcessor as SdkTraceBatchSpanProcessor,
  InMemorySpanExporter,
} from '@opentelemetry/sdk-trace';

describe('BatchSpanProcessor shim - Browser', () => {
  it('should create instance of sdk-trace BatchSpanProcessor', () => {
    const processor = new BatchSpanProcessor(new InMemorySpanExporter(), {
      // Should support the additional option from type BatchSpanProcessorBrowserConfig.
      disableAutoFlushOnDocumentHide: true,
    });

    assert.ok(processor instanceof BatchSpanProcessor);
    assert.ok(processor instanceof SdkTraceBatchSpanProcessor);
    processor.shutdown();
  });
});
