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
  context,
  ProxyTracer,
  ROOT_CONTEXT,
  Span,
  SpanKind,
  SpanOptions,
  Tracer,
  TracerProvider,
} from '../../../src';
import { NonRecordingSpan } from '../../../src/trace/NonRecordingSpan';
import { NoopTracer } from '../../../src/trace/NoopTracer';
import { ProxyTracerProvider } from '../../../src/trace/ProxyTracerProvider';

describe('ProxyTracer', function () {
  let provider: ProxyTracerProvider;
  const sandbox = sinon.createSandbox();

  beforeEach(() => {
    provider = new ProxyTracerProvider();
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('when no delegate is set', function () {
    it('should return proxy tracers', function () {
      const tracer = provider.getTracer('test');

      assert.ok(tracer instanceof ProxyTracer);
    });

    it('startSpan should return Noop Spans', function () {
      const tracer = provider.getTracer('test');

      assert.ok(tracer.startSpan('span-name') instanceof NonRecordingSpan);
      assert.ok(
        tracer.startSpan('span-name1', { kind: SpanKind.CLIENT }) instanceof
          NonRecordingSpan
      );
      assert.ok(
        tracer.startSpan('span-name2', { kind: SpanKind.CLIENT }) instanceof
          NonRecordingSpan
      );
    });
  });

  describe('when delegate is set before getTracer', function () {
    let delegate: TracerProvider;
    let getTracerStub: sinon.SinonStub;

    beforeEach(() => {
      getTracerStub = sandbox.stub().returns(new NoopTracer());
      delegate = {
        getTracer: getTracerStub,
        forEntity: sandbox.stub().returnsThis(),
      };
      provider.setDelegate(delegate);
    });

    it('should return tracers directly from the delegate', function () {
      const tracer = provider.getTracer('test', 'v0');

      sandbox.assert.calledOnce(getTracerStub);
      assert.strictEqual(getTracerStub.firstCall.returnValue, tracer);
      assert.deepStrictEqual(getTracerStub.firstCall.args, [
        'test',
        'v0',
        undefined,
      ]);
    });

    it('should return tracers directly from the delegate with schema url', function () {
      const tracer = provider.getTracer('test', 'v0', {
        schemaUrl: 'https://opentelemetry.io/schemas/1.7.0',
      });

      sandbox.assert.calledOnce(getTracerStub);
      assert.strictEqual(getTracerStub.firstCall.returnValue, tracer);
      assert.deepStrictEqual(getTracerStub.firstCall.args, [
        'test',
        'v0',
        { schemaUrl: 'https://opentelemetry.io/schemas/1.7.0' },
      ]);
    });
  });

  describe('when delegate is set after getTracer', function () {
    let tracer: Tracer;
    let delegate: TracerProvider;
    let delegateSpan: Span;
    let delegateTracer: Tracer;

    beforeEach(() => {
      delegateSpan = new NonRecordingSpan();
      delegateTracer = {
        startSpan() {
          return delegateSpan;
        },

        startActiveSpan() {
          // stubbed
        },
      };

      tracer = provider.getTracer('test');

      delegate = {
        getTracer() {
          return delegateTracer;
        },
        forEntity: sandbox.stub().returnsThis(),
      };
      provider.setDelegate(delegate);
    });

    it('should create spans using the delegate tracer', function () {
      const span = tracer.startSpan('test');

      assert.strictEqual(span, delegateSpan);
    });

    it('should create active spans using the delegate tracer', function () {
      // sinon types are broken with overloads, hence the any
      // https://github.com/DefinitelyTyped/DefinitelyTyped/issues/36436
      const startActiveSpanStub = sinon.stub<Tracer, any>(
        delegateTracer,
        'startActiveSpan'
      );

      const name = 'span-name';
      const fn = (span: Span) => {
        try {
          return 1;
        } finally {
          span.end();
        }
      };
      const opts = { attributes: { foo: 'bar' } };
      const ctx = context.active();

      startActiveSpanStub.withArgs(name, fn).returns(1);
      startActiveSpanStub.withArgs(name, opts, fn).returns(2);
      startActiveSpanStub.withArgs(name, opts, ctx, fn).returns(3);

      assert.strictEqual(tracer.startActiveSpan(name, fn), 1);
      assert.strictEqual(tracer.startActiveSpan(name, opts, fn), 2);
      assert.strictEqual(tracer.startActiveSpan(name, opts, ctx, fn), 3);
    });

    it('should pass original arguments to DelegateTracer#startSpan', function () {
      const startSpanStub = sandbox.stub(delegateTracer, 'startSpan');

      const name = 'name1';
      const options: SpanOptions = {};
      const ctx = ROOT_CONTEXT.setValue(Symbol('test'), 1);
      tracer.startSpan(name, options, ctx);

      // Assert the proxy tracer has the full API of the NoopTracer
      assert.deepStrictEqual(Object.getOwnPropertyNames(NoopTracer.prototype), [
        'constructor',
        'startSpan',
        'startActiveSpan',
      ]);
      sandbox.assert.calledOnceWithExactly(startSpanStub, name, options, ctx);
    });
  });
});
