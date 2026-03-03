/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import * as assert from 'assert';
import * as sinon from 'sinon';

import { LogRecordExporter } from '../../../src';
import { BatchLogRecordProcessor } from '../../../src/platform/browser/export/BatchLogRecordProcessor';
import { InMemoryLogRecordExporter } from './../../../src/export/InMemoryLogRecordExporter';

const describeDocument =
  typeof document === 'object' ? describe : describe.skip;

/**
 * VisibilityState has been removed from TypeScript 4.6.0+
 */
type WebVisibilityState = 'visible' | 'hidden';

describeDocument('BatchLogRecordProcessor - web main context', () => {
  // TODO: change to DocumentVisibilityState when TypeScript is upgraded to 4.6+
  let visibilityState: WebVisibilityState = 'visible';
  let exporter: LogRecordExporter;
  let processor: BatchLogRecordProcessor;
  let forceFlushSpy: sinon.SinonStub;
  let visibilityChangeEvent: Event;
  let pageHideEvent: Event;

  beforeEach(() => {
    sinon.replaceGetter(document, 'visibilityState', () => visibilityState);
    visibilityState = 'visible';
    exporter = new InMemoryLogRecordExporter();
    processor = new BatchLogRecordProcessor(exporter, {});
    forceFlushSpy = sinon.stub(processor, 'forceFlush');
    visibilityChangeEvent = new Event('visibilitychange');
    pageHideEvent = new Event('pagehide');
  });

  afterEach(async () => {
    sinon.restore();
  });

  describe('when document becomes hidden', () => {
    const testDocumentHide = (hideDocument: () => void) => {
      it('should force flush log records', () => {
        assert.strictEqual(forceFlushSpy.callCount, 0);
        hideDocument();
        assert.strictEqual(forceFlushSpy.callCount, 1);
      });

      describe('AND shutdown has been called', () => {
        it('should NOT force flush log records', async () => {
          assert.strictEqual(forceFlushSpy.callCount, 0);
          await processor.shutdown();
          hideDocument();
          assert.strictEqual(forceFlushSpy.callCount, 0);
        });
      });

      describe('AND disableAutoFlushOnDocumentHide configuration option', () => {
        it('set to false should force flush log records', () => {
          processor = new BatchLogRecordProcessor(exporter, {
            disableAutoFlushOnDocumentHide: false,
          });
          forceFlushSpy = sinon.stub(processor, 'forceFlush');
          assert.strictEqual(forceFlushSpy.callCount, 0);
          hideDocument();
          assert.strictEqual(forceFlushSpy.callCount, 1);
        });

        it('set to true should NOT force flush log records', () => {
          processor = new BatchLogRecordProcessor(exporter, {
            disableAutoFlushOnDocumentHide: true,
          });
          forceFlushSpy = sinon.stub(processor, 'forceFlush');
          assert.strictEqual(forceFlushSpy.callCount, 0);
          hideDocument();
          assert.strictEqual(forceFlushSpy.callCount, 0);
        });
      });
    };

    describe('by the visibilitychange event', () => {
      testDocumentHide(() => {
        visibilityState = 'hidden';
        document.dispatchEvent(visibilityChangeEvent);
      });
    });

    describe('by the pagehide event', () => {
      testDocumentHide(() => {
        document.dispatchEvent(pageHideEvent);
      });
    });
  });

  describe('when document becomes visible', () => {
    it('should NOT force flush log records', () => {
      assert.strictEqual(forceFlushSpy.callCount, 0);
      document.dispatchEvent(visibilityChangeEvent);
      assert.strictEqual(forceFlushSpy.callCount, 0);
    });
  });
});

describe('BatchLogRecordProcessor', () => {
  it('without exception', async () => {
    const exporter = new InMemoryLogRecordExporter();
    const logRecordProcessor = new BatchLogRecordProcessor(exporter);
    assert.ok(logRecordProcessor instanceof BatchLogRecordProcessor);

    await logRecordProcessor.forceFlush();
    await logRecordProcessor.shutdown();
  });
});
