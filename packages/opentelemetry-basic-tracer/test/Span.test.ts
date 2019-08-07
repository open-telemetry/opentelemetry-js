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
import { Span } from '../src/Span';
import {
  SpanKind,
  CanonicalCode,
  TraceOptions,
  SpanContext,
} from '@opentelemetry/types';
import { NoopTracer } from '@opentelemetry/core';

describe('Span', () => {
  const tracer = new NoopTracer();
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
  });

  it('should get the span context of span', () => {
    const span = new Span(tracer, name, spanContext, SpanKind.CLIENT);
    const context = span.context();
    assert.strictEqual(context.traceId, spanContext.traceId);
    assert.strictEqual(context.traceOptions, TraceOptions.SAMPLED);
    assert.strictEqual(context.traceState, undefined);
    assert.ok(context.spanId.match(/[a-f0-9]{16}/));
    assert.ok(span.isRecordingEvents());
  });

  it('should return true when isRecordingEvents:true', () => {
    const span = new Span(tracer, name, spanContext, SpanKind.CLIENT);
    assert.ok(span.isRecordingEvents());
  });

  it('should set an attribute', () => {
    const span = new Span(tracer, name, spanContext, SpanKind.CLIENT);

    ['String', 'Number', 'Boolean'].map(attType => {
      span.setAttribute('testKey' + attType, 'testValue' + attType);
    });
    span.setAttribute('object', { foo: 'bar' });
  });

  it('should set an event', () => {
    const span = new Span(tracer, name, spanContext, SpanKind.CLIENT);
    span.addEvent('sent');
    span.addEvent('rev', { attr1: 'value', attr2: 123, attr3: true });
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
  });

  it('should set an error status', () => {
    const span = new Span(tracer, name, spanContext, SpanKind.CLIENT);
    span.setStatus({
      code: CanonicalCode.PERMISSION_DENIED,
      message: 'This is an error',
    });
  });

  it('should return toString', () => {
    const parentId = '5c1c63257de34c67';
    const span = new Span(
      tracer,
      name,
      spanContext,
      SpanKind.SERVER,
      parentId,
      100
    );
    const context = span.context();
    assert.strictEqual(
      span.toString(),
      `Span{"traceId":"${context.traceId}","spanId":"${context.spanId}","parentId":"${parentId}","name":"${name}","kind":1,"status":{"code":0},"startTime":100,"endTime":0}`
    );
  });
});
