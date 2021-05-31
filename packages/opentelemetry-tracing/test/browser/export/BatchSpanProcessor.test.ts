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
import { BatchSpanProcessor } from '../../../src';
import { TestTracingSpanExporter } from '../../common/export/TestTracingSpanExporter';

describe('BatchSpanProcessor - web', () => {
  let visibilityState: VisibilityState = 'visible';
  let processor: BatchSpanProcessor;
  let forceFlushSpy: sinon.SinonStub;
  let visibilityChangeEvent: Event;

  beforeEach(() => {
    sinon.replaceGetter(document, 'visibilityState', () => visibilityState);
    visibilityState = 'visible';
    const exporter = new TestTracingSpanExporter();
    processor = new BatchSpanProcessor(exporter, {});
    forceFlushSpy = sinon.stub(processor, 'forceFlush');
    visibilityChangeEvent = new Event('visibilitychange');
  });

  afterEach(() => {
    processor.onShutdown();
    sinon.restore();
  });

  it('forces flush when page becomes hidden', () => {
    assert.strictEqual(forceFlushSpy.callCount, 0);
    visibilityState = 'hidden';
    document.dispatchEvent(visibilityChangeEvent);
    assert.strictEqual(forceFlushSpy.callCount, 1);
  });

  it("doesn't force flush when page becomes visible", () => {
    assert.strictEqual(forceFlushSpy.callCount, 0);
    document.dispatchEvent(visibilityChangeEvent);
    assert.strictEqual(forceFlushSpy.callCount, 0);
  });

  it("doesn't force flush when page becomes hidden after shutting down", async () => {
    assert.strictEqual(forceFlushSpy.callCount, 0);
    await processor.shutdown();
    visibilityState = 'hidden';
    document.dispatchEvent(visibilityChangeEvent);
    assert.strictEqual(forceFlushSpy.callCount, 0);
  });
});
