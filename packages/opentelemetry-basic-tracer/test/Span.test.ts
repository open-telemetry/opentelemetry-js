/**
 * Copyright 2019, OpenTelemetry Authors
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
import { performance } from 'perf_hooks';
import * as sinon from 'sinon';
import { Span } from '../src/Span';
import {
  SpanKind,
  CanonicalCode,
  TraceOptions,
  SpanContext,
} from '@opentelemetry/types';
import { BasicTracer } from '../src';
import { NoopScopeManager } from '@opentelemetry/scope-base';
import { NoopLogger } from '@opentelemetry/core';

describe('Span', () => {
  const tracer = new BasicTracer({
    scopeManager: new NoopScopeManager(),
    logger: new NoopLogger(),
  });
  const name = 'span1';
  const spanContext: SpanContext = {
    traceId: 'd4cda95b652f4a1592b449d5929fda1b',
    spanId: '6e0c63257de34c92',
    traceOptions: TraceOptions.SAMPLED,
  };

  it('should create a Span instance', () => {
    const span = new Span(tracer, name, spanContext, SpanKind.SERVER);
    assert.ok(span instanceof Span);
    assert.strictEqual(span.tracer(), tracer);
    span.end();
  });

  it('should have startTime > Date.now()', () => {
    const span = new Span(tracer, name, spanContext, SpanKind.SERVER);
    assert.ok(span.startTime[0] + span.startTime[1] > performance.timeOrigin);
  });

  it('should have endTime > Date.now()', () => {
    const span = new Span(tracer, name, spanContext, SpanKind.SERVER);
    span.end();
    assert.ok(span.endTime[0] >= span.startTime[0]);
    assert.ok(span.endTime[0] + span.endTime[1] > performance.timeOrigin);
  });

  it('should have a duration', () => {
    const span = new Span(tracer, name, spanContext, SpanKind.SERVER);
    span.end();
    assert.ok(span.duration[0] + span.duration[1] >= 0);
  });

  it('should have event.time > Date.now()', () => {
    const span = new Span(tracer, name, spanContext, SpanKind.SERVER);
    span.addEvent('my-event');
    assert.ok(span.events[0].time[0] + span.events[0].time[1] > Date.now());
  });

  it('should get the span context of span', () => {
    const span = new Span(tracer, name, spanContext, SpanKind.CLIENT);
    const context = span.context();
    assert.strictEqual(context.traceId, spanContext.traceId);
    assert.strictEqual(context.traceOptions, TraceOptions.SAMPLED);
    assert.strictEqual(context.traceState, undefined);
    assert.ok(context.spanId.match(/[a-f0-9]{16}/));
    assert.ok(span.isRecordingEvents());
    span.end();
  });

  it('should return true when isRecordingEvents:true', () => {
    const span = new Span(tracer, name, spanContext, SpanKind.CLIENT);
    assert.ok(span.isRecordingEvents());
    span.end();
  });

  it('should set an attribute', () => {
    const span = new Span(tracer, name, spanContext, SpanKind.CLIENT);

    ['String', 'Number', 'Boolean'].map(attType => {
      span.setAttribute('testKey' + attType, 'testValue' + attType);
    });
    span.setAttribute('object', { foo: 'bar' });
    span.end();
  });

  it('should set an event', () => {
    const span = new Span(tracer, name, spanContext, SpanKind.CLIENT);
    span.addEvent('sent');
    span.addEvent('rev', { attr1: 'value', attr2: 123, attr3: true });
    span.end();
  });

  it('should set a link', () => {
    const spanContext: SpanContext = {
      traceId: 'a3cda95b652f4a1592b449d5929fda1b',
      spanId: '5e0c63257de34c92',
      traceOptions: TraceOptions.SAMPLED,
    };
    const span = new Span(tracer, name, spanContext, SpanKind.CLIENT);
    span.addLink(spanContext);
    span.addLink(spanContext, { attr1: 'value', attr2: 123, attr3: true });
    span.end();
  });

  it('should set an error status', () => {
    const span = new Span(tracer, name, spanContext, SpanKind.CLIENT);
    span.setStatus({
      code: CanonicalCode.PERMISSION_DENIED,
      message: 'This is an error',
    });
    span.end();
  });

  it('should return ReadableSpan', () => {
    const parentId = '5c1c63257de34c67';
    const span = new Span(
      tracer,
      'my-span',
      spanContext,
      SpanKind.INTERNAL,
      parentId
    );

    const readableSpan = span.toReadableSpan();
    assert.strictEqual(readableSpan.name, 'my-span');
    assert.strictEqual(readableSpan.kind, SpanKind.INTERNAL);
    assert.strictEqual(readableSpan.parentSpanId, parentId);
    assert.strictEqual(readableSpan.spanContext.traceId, spanContext.traceId);
    assert.deepStrictEqual(readableSpan.status, {
      code: CanonicalCode.OK,
    });
    assert.deepStrictEqual(readableSpan.attributes, {});
    assert.deepStrictEqual(readableSpan.links, []);
    assert.deepStrictEqual(readableSpan.events, []);
  });

  it('should return ReadableSpan with attributes', () => {
    const span = new Span(tracer, 'my-span', spanContext, SpanKind.CLIENT);
    span.setAttribute('attr1', 'value1');
    let readableSpan = span.toReadableSpan();
    assert.deepStrictEqual(readableSpan.attributes, { attr1: 'value1' });

    span.setAttributes({ attr2: 123, attr1: false });
    readableSpan = span.toReadableSpan();
    assert.deepStrictEqual(readableSpan.attributes, {
      attr1: false,
      attr2: 123,
    });

    span.end();
    // shouldn't add new attribute
    span.setAttribute('attr3', 'value3');
    readableSpan = span.toReadableSpan();
    assert.deepStrictEqual(readableSpan.attributes, {
      attr1: false,
      attr2: 123,
    });
  });

  it('should return ReadableSpan with links', () => {
    const span = new Span(tracer, 'my-span', spanContext, SpanKind.CLIENT);
    span.addLink(spanContext);
    let readableSpan = span.toReadableSpan();
    assert.strictEqual(readableSpan.links.length, 1);
    assert.deepStrictEqual(readableSpan.links, [
      {
        attributes: undefined,
        spanContext: {
          spanId: '6e0c63257de34c92',
          traceId: 'd4cda95b652f4a1592b449d5929fda1b',
          traceOptions: 1,
        },
      },
    ]);

    span.addLink(spanContext, { attr1: 'value', attr2: 123, attr3: true });
    readableSpan = span.toReadableSpan();
    assert.strictEqual(readableSpan.links.length, 2);
    assert.deepStrictEqual(readableSpan.links, [
      {
        attributes: undefined,
        spanContext,
      },
      {
        attributes: { attr1: 'value', attr2: 123, attr3: true },
        spanContext,
      },
    ]);

    span.end();
    // shouldn't add new link
    span.addLink(spanContext);
    readableSpan = span.toReadableSpan();
    assert.strictEqual(readableSpan.links.length, 2);
  });

  it('should return ReadableSpan with events', () => {
    const span = new Span(tracer, 'my-span', spanContext, SpanKind.CLIENT);
    span.addEvent('sent');
    let readableSpan = span.toReadableSpan();
    assert.strictEqual(readableSpan.events.length, 1);
    const [event] = readableSpan.events;
    assert.deepStrictEqual(event.name, 'sent');
    assert.ok(!event.attributes);
    assert.ok(event.time[0] > 0);

    span.addEvent('rev', { attr1: 'value', attr2: 123, attr3: true });
    readableSpan = span.toReadableSpan();
    assert.strictEqual(readableSpan.events.length, 2);
    const [event1, event2] = readableSpan.events;
    assert.deepStrictEqual(event1.name, 'sent');
    assert.ok(!event1.attributes);
    assert.ok(event1.time[0] > 0);
    assert.deepStrictEqual(event2.name, 'rev');
    assert.deepStrictEqual(event2.attributes, {
      attr1: 'value',
      attr2: 123,
      attr3: true,
    });
    assert.ok(event2.time[0] > 0);

    span.end();
    // shouldn't add new event
    span.addEvent('sent');
    assert.strictEqual(readableSpan.events.length, 2);
    readableSpan = span.toReadableSpan();
    assert.strictEqual(readableSpan.events.length, 2);
  });

  it('should return ReadableSpan with new status', () => {
    const span = new Span(tracer, name, spanContext, SpanKind.CLIENT);
    span.setStatus({
      code: CanonicalCode.PERMISSION_DENIED,
      message: 'This is an error',
    });
    const readableSpan = span.toReadableSpan();
    assert.strictEqual(
      readableSpan.status.code,
      CanonicalCode.PERMISSION_DENIED
    );
    assert.strictEqual(readableSpan.status.message, 'This is an error');
    span.end();

    // shouldn't update status
    span.setStatus({
      code: CanonicalCode.OK,
      message: 'OK',
    });
    assert.strictEqual(span.status.code, CanonicalCode.PERMISSION_DENIED);
  });

  it('should only end a span once', () => {
    const span = new Span(tracer, name, spanContext, SpanKind.SERVER);
    const endTime = Date.now();
    span.end(endTime);
    span.end(endTime + 10);
    assert.deepEqual(span.endTime, [endTime, 0]);
  });

  it('should update name', () => {
    const span = new Span(tracer, name, spanContext, SpanKind.SERVER);
    span.updateName('foo-span');
    span.end();

    // shouldn't update name
    span.updateName('bar-span');
    assert.strictEqual(span.name, 'foo-span');
  });

  describe('time', () => {
    let sandbox: sinon.SinonSandbox;

    beforeEach(() => {
      sandbox = sinon.createSandbox();
    });

    afterEach(() => {
      sandbox.restore();
    })

    it('should convert Date endTime', () => {
      const span = new Span(tracer, name, spanContext, SpanKind.SERVER);
      const endTime = new Date();
      span.end(endTime);
      assert.deepEqual(span.endTime, [endTime.getTime(), 0]);
    });

    it('should convert epoch milliseconds endTime', () => {
      const span = new Span(tracer, name, spanContext, SpanKind.SERVER);
      const endTime = Date.now();
      span.end(endTime);
      assert.deepEqual(span.endTime, [endTime, 0]);
    });

    it('should convert performance.now() endTime', () => {
      sandbox.stub(performance, 'timeOrigin').value(111.50000000000);

      const span = new Span(tracer, name, spanContext, SpanKind.SERVER);
      const endTime = 11.90000000000;
      span.end(endTime);

      assert.deepEqual(span.endTime, [123, 4000000000]);
    });

    it('should passthrough hrtime endTime', () => {
      sandbox.stub(performance, 'timeOrigin').value(111.50000000000);

      const span = new Span(tracer, name, spanContext, SpanKind.SERVER);
      const endTime = process.hrtime();
      span.end(endTime);

      assert.deepEqual(span.endTime, endTime);
    });

    it('should use default endTime', () => {
      sandbox.stub(performance, 'timeOrigin').value(111.50000000000);
      sandbox.stub(performance, 'now').callsFake(() => 11.90000000000);

      const span = new Span(tracer, name, spanContext, SpanKind.SERVER);
      span.end();

      assert.deepEqual(span.endTime, [123, 4000000000]);
    });
  })
});
