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
import * as sinon from 'sinon';
import { SpanExporter } from '../../../src';
import { BatchSpanProcessor } from '../../../src/platform/browser/export/BatchSpanProcessor';
import { TestTracingSpanExporter } from '../../common/export/TestTracingSpanExporter';
import {
  loggingErrorHandler,
  setGlobalErrorHandler,
} from '@opentelemetry/core';

/**
 * VisibilityState has been removed from TypeScript 4.6.0+
 * So just defining a simple replacement
 */
type WebVisibilityState = 'visible' | 'hidden';

const describeDocument =
  typeof document === 'object' ? describe : describe.skip;

describeDocument('BatchSpanProcessor - web main context', () => {
  // TODO: change to DocumentVisibilityState when TypeScript is upgraded to 4.6+
  let visibilityState: WebVisibilityState = 'visible';
  let exporter: SpanExporter;
  let processor: BatchSpanProcessor;
  let forceFlushSpy: sinon.SinonStub;
  let visibilityChangeEvent: Event;
  let pageHideEvent: Event;
  let globalErrorHandlerStub: sinon.SinonStub;

  beforeEach(() => {
    sinon.replaceGetter(document, 'visibilityState', () => visibilityState);
    visibilityState = 'visible';
    exporter = new TestTracingSpanExporter();
    processor = new BatchSpanProcessor(exporter, {});
    forceFlushSpy = sinon
      .stub(processor, 'forceFlush')
      .returns(Promise.resolve());
    visibilityChangeEvent = new Event('visibilitychange');
    pageHideEvent = new Event('pagehide');
    globalErrorHandlerStub = sinon.stub();
    setGlobalErrorHandler(globalErrorHandlerStub);
  });

  afterEach(async () => {
    sinon.restore();
    setGlobalErrorHandler(loggingErrorHandler());
  });

  describe('when document becomes hidden', () => {
    const testDocumentHide = (hideDocument: () => void) => {
      it('should force flush spans', () => {
        assert.strictEqual(forceFlushSpy.callCount, 0);
        hideDocument();
        assert.strictEqual(forceFlushSpy.callCount, 1);
      });

      it('should catch any error thrown by forceFlush', done => {
        const forceFlushError = new Error('forceFlush failed');
        forceFlushSpy.rejects(forceFlushError);
        hideDocument();
        sinon.assert.calledOnce(forceFlushSpy);

        // queue a microtask since hideDocument() returns before forceFlush() rejects
        queueMicrotask(() => {
          try {
            sinon.assert.calledOnceWithExactly(
              globalErrorHandlerStub,
              forceFlushError
            );
            done();
          } catch (e) {
            done(e);
          }
        });
      });

      describe('AND shutdown has been called', () => {
        it('should NOT force flush spans', async () => {
          assert.strictEqual(forceFlushSpy.callCount, 0);
          await processor.shutdown();
          hideDocument();
          assert.strictEqual(forceFlushSpy.callCount, 0);
        });
      });

      describe('AND disableAutoFlushOnDocumentHide configuration option', () => {
        it('set to false should force flush spans', () => {
          processor = new BatchSpanProcessor(exporter, {
            disableAutoFlushOnDocumentHide: false,
          });
          forceFlushSpy = sinon.stub(processor, 'forceFlush').resolves();
          assert.strictEqual(forceFlushSpy.callCount, 0);
          hideDocument();
          assert.strictEqual(forceFlushSpy.callCount, 1);
        });

        it('set to true should NOT force flush spans', () => {
          processor = new BatchSpanProcessor(exporter, {
            disableAutoFlushOnDocumentHide: true,
          });
          forceFlushSpy = sinon.stub(processor, 'forceFlush').resolves();
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
    it('should NOT force flush spans', () => {
      assert.strictEqual(forceFlushSpy.callCount, 0);
      document.dispatchEvent(visibilityChangeEvent);
      assert.strictEqual(forceFlushSpy.callCount, 0);
    });
  });
});

describe('BatchSpanProcessor', () => {
  it('without exception', async () => {
    const exporter = new TestTracingSpanExporter();
    const spanProcessor = new BatchSpanProcessor(exporter);
    assert.ok(spanProcessor instanceof BatchSpanProcessor);

    await spanProcessor.forceFlush();
    await spanProcessor.shutdown();
  });
});
