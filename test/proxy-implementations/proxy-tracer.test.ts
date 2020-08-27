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
import {
  NoopSpan,
  NOOP_SPAN,
  ProxyTracerProvider,
  SpanKind,
  TracerProvider,
  ProxyTracer,
  Tracer,
  Span,
  NoopTracer,
} from '../../src';

describe('ProxyTracer', () => {
  let provider: ProxyTracerProvider;

  beforeEach(() => {
    provider = new ProxyTracerProvider();
  });

  describe('when no delegate is set', () => {
    it('should return proxy tracers', () => {
      const tracer = provider.getTracer('test');

      assert.ok(tracer instanceof ProxyTracer);
    });

    it('startSpan should return Noop Spans', () => {
      const tracer = provider.getTracer('test');

      assert.deepStrictEqual(tracer.startSpan('span-name'), NOOP_SPAN);
      assert.deepStrictEqual(
        tracer.startSpan('span-name1', { kind: SpanKind.CLIENT }),
        NOOP_SPAN
      );
      assert.deepStrictEqual(
        tracer.startSpan('span-name2', {
          kind: SpanKind.CLIENT,
        }),
        NOOP_SPAN
      );

      assert.deepStrictEqual(tracer.getCurrentSpan(), NOOP_SPAN);
    });
  });

  describe('when delegate is set before getTracer', () => {
    let delegate: TracerProvider;
    const sandbox = sinon.createSandbox();
    let getTracerStub: sinon.SinonStub;

    beforeEach(() => {
      getTracerStub = sandbox.stub().returns(new NoopTracer());
      delegate = {
        getTracer: getTracerStub,
      };
      provider.setDelegate(delegate);
    });

    afterEach(() => {
      sandbox.restore();
    });

    it('should return tracers directly from the delegate', () => {
      const tracer = provider.getTracer('test', 'v0');

      sandbox.assert.calledOnce(getTracerStub);
      assert.strictEqual(getTracerStub.firstCall.returnValue, tracer);
      assert.deepEqual(getTracerStub.firstCall.args, ['test', 'v0']);
    });
  });

  describe('when delegate is set after getTracer', () => {
    let tracer: Tracer;
    let delegate: TracerProvider;
    let delegateSpan: Span;
    let delegateTracer: Tracer;

    beforeEach(() => {
      delegateSpan = new NoopSpan();
      delegateTracer = {
        bind(target) {
          return target;
        },
        getCurrentSpan() {
          return delegateSpan;
        },
        startSpan() {
          return delegateSpan;
        },
        withSpan(span, fn) {
          return fn();
        },
      };

      tracer = provider.getTracer('test');

      delegate = {
        getTracer() {
          return delegateTracer;
        },
      };
      provider.setDelegate(delegate);
    });

    it('should create spans using the delegate tracer', () => {
      const span = tracer.startSpan('test');

      assert.strictEqual(span, delegateSpan);
    });
  });
});
