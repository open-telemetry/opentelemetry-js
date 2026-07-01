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
import { NoopTracerProvider } from '../../../../src/trace/NoopTracerProvider';
import { NoopTracer } from '../../../../src/trace/NoopTracer';
import { Span } from '../../../../src';
import { Context, SpanOptions } from '../../../../src';
import { NonRecordingSpan } from '../../../../src/trace/NonRecordingSpan';
import { decorators } from '../../../../src/experimental';

describe('decorators/trace', function () {
  class TestTracer extends NoopTracer {
    public calls: IArguments[] = [];
    public span = new NonRecordingSpan();

    override startActiveSpan<F extends (span: Span) => ReturnType<F>>(
      name: string,
      arg2?: SpanOptions,
      arg3?: Context,
      arg4?: F
    ): ReturnType<F> | undefined {
      this.calls.push(arguments);
      return super.startActiveSpan(name, arg2, arg3, () => {
        return arg4?.(this.span);
      });
    }
  }

  class TestTracerProvider extends NoopTracerProvider {
    override getTracer() {
      return new TestTracer();
    }
  }

  const tracer = new TestTracerProvider().getTracer();

  afterEach(() => {
    tracer.calls = [];
    tracer.span = new NonRecordingSpan();
  });

  const error = new Error('test error');
  class TestClass {
    @decorators.trace.startActiveSpan(tracer)
    foo(throws = false) {
      if (throws) throw error;
      return 'foo';
    }

    @decorators.trace.startActiveSpan(tracer)
    async asyncFoo(throws = false) {
      if (throws) throw error;
      return 'asyncFoo';
    }

    @decorators.trace.startActiveSpan(tracer)
    #privateFoo(throws = false) {
      if (throws) throw error;
      return 'privateFoo';
    }

    @decorators.trace.startActiveSpan(tracer, 'customSpanName', {
      attributes: { 'custom-attribute': 'value' },
    })
    customMethodName() {
      return;
    }

    callPrivateFoo(throws = false) {
      return this.#privateFoo(throws);
    }
  }

  describe('startActiveSpan', () => {
    it('should trace sync method', function () {
      const endStub = sinon.stub(tracer.span, 'end');
      const test = new TestClass();

      assert.strictEqual(test.foo.name, 'foo');
      const ret = test.foo();
      assert.strictEqual(ret, 'foo');

      assert.strictEqual(tracer.calls.length, 1);
      assert.strictEqual(tracer.calls[0][0], 'TestClass.foo');

      assert.strictEqual(endStub.callCount, 1);
    });

    it('should trace method with custom options', function () {
      const endStub = sinon.stub(tracer.span, 'end');
      const test = new TestClass();

      assert.strictEqual(test.customMethodName.name, 'customMethodName');
      test.customMethodName();

      assert.strictEqual(tracer.calls.length, 1);
      assert.strictEqual(tracer.calls[0][0], 'customSpanName');
      assert.strictEqual(
        tracer.calls[0][1].attributes['custom-attribute'],
        'value'
      );

      assert.strictEqual(endStub.callCount, 1);
    });

    it('should trace async method', async function () {
      const endStub = sinon.stub(tracer.span, 'end');
      const test = new TestClass();

      assert.strictEqual(test.asyncFoo.name, 'asyncFoo');
      const ret = test.asyncFoo();
      assert.strictEqual(typeof ret.then, 'function');

      assert.strictEqual(tracer.calls.length, 1);
      assert.strictEqual(tracer.calls[0][0], 'TestClass.asyncFoo');

      // The promise is not resolved yet.
      assert.strictEqual(endStub.callCount, 0);

      assert.strictEqual(await ret, 'asyncFoo');
      // After the promise is resolved, span should be ended.
      assert.strictEqual(endStub.callCount, 1);
    });

    it('should trace private method', async function () {
      const endStub = sinon.stub(tracer.span, 'end');
      const test = new TestClass();

      const ret = test.callPrivateFoo();
      assert.strictEqual(ret, 'privateFoo');

      assert.strictEqual(tracer.calls.length, 1);
      assert.strictEqual(tracer.calls[0][0], 'TestClass.#privateFoo');

      assert.strictEqual(endStub.callCount, 1);
    });
  });

  describe('startActiveSpan() with exceptions', function () {
    it('should trace sync method', function () {
      const endStub = sinon.stub(tracer.span, 'end');
      const recordExceptionStub = sinon.stub(tracer.span, 'recordException');
      const test = new TestClass();

      try {
        test.foo(true);
      } catch {
        /* ignore */
      }

      assert.strictEqual(tracer.calls.length, 1);
      assert.strictEqual(tracer.calls[0][0], 'TestClass.foo');

      assert.strictEqual(endStub.callCount, 1);
      assert.strictEqual(recordExceptionStub.args[0][0], error);
    });

    it('should trace async method', async function () {
      const endStub = sinon.stub(tracer.span, 'end');
      const recordExceptionStub = sinon.stub(tracer.span, 'recordException');
      const test = new TestClass();

      const ret = test.asyncFoo(true).catch(() => {});

      assert.strictEqual(tracer.calls.length, 1);
      assert.strictEqual(tracer.calls[0][0], 'TestClass.asyncFoo');

      // The promise is not settled yet.
      assert.strictEqual(endStub.callCount, 0);

      await ret;
      // After the promise is settled, span should be ended.
      assert.strictEqual(endStub.callCount, 1);
      // Promise rejection should be recorded.
      assert.strictEqual(recordExceptionStub.args[0][0], error);
    });

    it('should trace private method', async function () {
      const endStub = sinon.stub(tracer.span, 'end');
      const recordExceptionStub = sinon.stub(tracer.span, 'recordException');
      const test = new TestClass();

      try {
        test.callPrivateFoo(true);
      } catch {
        /* ignore */
      }

      assert.strictEqual(tracer.calls.length, 1);
      assert.strictEqual(tracer.calls[0][0], 'TestClass.#privateFoo');

      assert.strictEqual(endStub.callCount, 1);
      assert.strictEqual(recordExceptionStub.args[0][0], error);
    });
  });
});
