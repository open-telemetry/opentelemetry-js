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
import * as oc from '@opencensus/core';
import { ShimTracer, getRootSpan } from '../src/ShimTracer';
import {
  INVALID_SPANID,
  INVALID_TRACEID,
  SpanKind,
  context,
  createContextKey,
  Tracer,
} from '@opentelemetry/api';
import { withTestTracer, setupNodeContextManager } from './util';

function createStubTracer(): Tracer {
  return {
    startSpan: sinon.stub(),
    startActiveSpan: sinon.stub(),
  } as unknown as Tracer;
}

describe('ShimTracer', () => {
  setupNodeContextManager(before, after);

  it('should initially be inactive', () => {
    const shimTracer = new ShimTracer(createStubTracer());
    assert.ok(!shimTracer.active);
  });
  describe('start', () => {
    it('should set the tracer as active', () => {
      const shimTracer = new ShimTracer(createStubTracer());
      shimTracer.start({});
      assert.ok(shimTracer.active);
    });
  });
  describe('stop', () => {
    it('should set the tracer as inactive', () => {
      const shimTracer = new ShimTracer(createStubTracer());
      shimTracer.start({});
      assert.ok(shimTracer.active);
    });
  });

  describe('startRootSpan', () => {
    it('should create an OTel span with name', async () => {
      const otelSpans = await withTestTracer(shimTracer => {
        shimTracer.startRootSpan({ name: 'test' }, span => span.end());
      });
      assert.strictEqual(otelSpans[0].name, 'test');
    });

    it('should create an OTel span with kind', async () => {
      const otelSpans = await withTestTracer(shimTracer => {
        shimTracer.startRootSpan(
          { name: 'test', kind: oc.SpanKind.CLIENT },
          span => span.end()
        );
      });
      assert.strictEqual(otelSpans[0].kind, SpanKind.CLIENT);
    });

    it('should create an OTel span with parent from provided spanContext', async () => {
      const otelSpans = await withTestTracer(shimTracer => {
        shimTracer.startRootSpan(
          {
            name: 'test',
            spanContext: {
              traceId: '9e7ecdc193765065fee1efe757fdd874',
              spanId: '4bf6239d37d8b0f0',
            },
          },
          span => span.end()
        );
      });
      assert.strictEqual(
        otelSpans[0].spanContext().traceId,
        '9e7ecdc193765065fee1efe757fdd874'
      );
      assert.strictEqual(
        otelSpans[0].parentSpanContext?.spanId,
        '4bf6239d37d8b0f0'
      );
    });

    it('should set the span as root span in context', async () => {
      await withTestTracer(shimTracer => {
        shimTracer.startRootSpan({ name: 'test' }, span => {
          assert.strictEqual(getRootSpan(context.active()), span);
        });
      });
    });
  });

  describe('currentRootSpan', () => {
    it('should return an span with invalid span context if there is no root', async () => {
      await withTestTracer(shimTracer => {
        assert.strictEqual(shimTracer.currentRootSpan.traceId, INVALID_TRACEID);
        assert.strictEqual(shimTracer.currentRootSpan.id, INVALID_SPANID);
      });
    });

    it('should return the current root span', async () => {
      await withTestTracer(shimTracer => {
        shimTracer.startRootSpan({ name: 'test' }, span => {
          assert.strictEqual(shimTracer.currentRootSpan, span);
        });
      });
    });
  });

  describe('startChildSpan', () => {
    it('should create an OTel span with a default name', async () => {
      const otelSpans = await withTestTracer(shimTracer => {
        shimTracer.startChildSpan().end();
      });
      assert.strictEqual(otelSpans[0].name, 'span');
    });

    it('should create an OTel span with name', async () => {
      const otelSpans = await withTestTracer(shimTracer => {
        shimTracer.startChildSpan({ name: 'test' }).end();
      });
      assert.strictEqual(otelSpans[0].name, 'test');
    });

    it('should create an OTel span with kind', async () => {
      const otelSpans = await withTestTracer(shimTracer => {
        shimTracer
          .startChildSpan({ name: 'test', kind: oc.SpanKind.CLIENT })
          .end();
      });
      assert.strictEqual(otelSpans[0].kind, SpanKind.CLIENT);
    });

    it('should create an OTel span with parent from childOf', async () => {
      const [childSpan, parentSpan] = await withTestTracer(shimTracer => {
        const parent = shimTracer.startChildSpan({
          name: 'parent',
        });
        shimTracer.startChildSpan({ name: 'child', childOf: parent }).end();
        parent.end();
      });
      assert.strictEqual(
        childSpan.parentSpanContext?.spanId,
        parentSpan.spanContext().spanId
      );
    });

    it('should create an OTel span with parent from root in context', async () => {
      const [childSpan, rootSpan] = await withTestTracer(shimTracer => {
        shimTracer.startRootSpan(
          {
            name: 'parent',
          },
          root => {
            shimTracer.startChildSpan({ name: 'child', childOf: root }).end();
            root.end();
          }
        );
      });
      assert.strictEqual(
        childSpan.parentSpanContext?.spanId,
        rootSpan.spanContext().spanId
      );
    });
  });

  describe('wrap', () => {
    it('should bind the provided function to active context at time of wrapping', () => {
      const shimTracer = new ShimTracer(createStubTracer());
      const key = createContextKey('key');
      const fnToWrap = () =>
        assert.strictEqual(context.active().getValue(key), 'value');

      const fn = context.with(context.active().setValue(key, 'value'), () =>
        shimTracer.wrap(fnToWrap)
      );
      fn();
    });
  });
});
