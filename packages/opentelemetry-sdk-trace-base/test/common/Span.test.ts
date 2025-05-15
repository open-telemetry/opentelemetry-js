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

import {
  diag,
  SpanStatusCode,
  Exception,
  ROOT_CONTEXT,
  SpanContext,
  SpanKind,
  TraceFlags,
  HrTime,
  Attributes,
  AttributeValue,
} from '@opentelemetry/api';
import {
  hrTimeDuration,
  hrTimeToMilliseconds,
  hrTimeToNanoseconds,
  otperformance as performance,
} from '@opentelemetry/core';
import {
  ATTR_EXCEPTION_MESSAGE,
  ATTR_EXCEPTION_STACKTRACE,
  ATTR_EXCEPTION_TYPE,
} from '@opentelemetry/semantic-conventions';
import * as assert from 'assert';
import * as sinon from 'sinon';
import { BasicTracerProvider, Span, SpanProcessor } from '../../src';
import { SpanImpl } from '../../src/Span';
import { invalidAttributes, validAttributes } from './util';
import { Tracer } from '../../src/Tracer';
import {
  DEFAULT_ATTRIBUTE_COUNT_LIMIT,
  DEFAULT_ATTRIBUTE_VALUE_LENGTH_LIMIT,
} from '../../src/utility';

const performanceTimeOrigin: HrTime = [1, 1];

describe('Span', () => {
  beforeEach(() => {
    sinon
      .stub(performance, 'timeOrigin')
      .value(hrTimeToMilliseconds(performanceTimeOrigin));
  });
  afterEach(() => {
    sinon.restore();
  });

  const tracer = new BasicTracerProvider({
    spanLimits: {
      attributeValueLengthLimit: 100,
      attributeCountLimit: 100,
      eventCountLimit: 100,
    },
  }).getTracer('default') as Tracer;
  const name = 'span1';
  const spanContext: SpanContext = {
    traceId: 'd4cda95b652f4a1592b449d5929fda1b',
    spanId: '6e0c63257de34c92',
    traceFlags: TraceFlags.SAMPLED,
  };
  const linkContext: SpanContext = {
    traceId: 'e4cda95b652f4a1592b449d5929fda1b',
    spanId: '7e0c63257de34c92',
    traceFlags: TraceFlags.SAMPLED,
  };

  it('should create a Span instance', () => {
    const span = new SpanImpl({
      scope: tracer.instrumentationScope,
      resource: tracer['_resource'],
      context: ROOT_CONTEXT,
      spanContext,
      name,
      kind: SpanKind.SERVER,
      spanLimits: tracer.getSpanLimits(),
      spanProcessor: tracer['_spanProcessor'],
    });
    assert.ok(span instanceof SpanImpl);
    span.end();
  });

  it('should have valid startTime', () => {
    const span = new SpanImpl({
      scope: tracer.instrumentationScope,
      resource: tracer['_resource'],
      context: ROOT_CONTEXT,
      spanContext,
      name,
      kind: SpanKind.SERVER,
      spanLimits: tracer.getSpanLimits(),
      spanProcessor: tracer['_spanProcessor'],
    });
    assert.ok(
      hrTimeToMilliseconds(span.startTime) >
        hrTimeToMilliseconds(performanceTimeOrigin)
    );
  });

  it('should have valid endTime', () => {
    const span = new SpanImpl({
      scope: tracer.instrumentationScope,
      resource: tracer['_resource'],
      context: ROOT_CONTEXT,
      spanContext,
      name,
      kind: SpanKind.SERVER,
      spanLimits: tracer.getSpanLimits(),
      spanProcessor: tracer['_spanProcessor'],
    });
    span.end();
    assert.ok(
      hrTimeToNanoseconds(span.endTime) >= hrTimeToNanoseconds(span.startTime),
      'end time must be bigger or equal start time'
    );

    assert.ok(
      hrTimeToMilliseconds(span.endTime) >
        hrTimeToMilliseconds(performanceTimeOrigin),
      'end time must be bigger than time origin'
    );
  });

  it('should have a duration', () => {
    const span = new SpanImpl({
      scope: tracer.instrumentationScope,
      resource: tracer['_resource'],
      context: ROOT_CONTEXT,
      spanContext,
      name,
      kind: SpanKind.SERVER,
      spanLimits: tracer.getSpanLimits(),
      spanProcessor: tracer['_spanProcessor'],
    });
    span.end();
    assert.ok(hrTimeToNanoseconds(span.duration) >= 0);
  });

  it('should ensure duration is never negative even if provided with inconsistent times', () => {
    const span = new SpanImpl({
      scope: tracer.instrumentationScope,
      resource: tracer['_resource'],
      context: ROOT_CONTEXT,
      spanContext,
      name,
      kind: SpanKind.SERVER,
      spanLimits: tracer.getSpanLimits(),
      spanProcessor: tracer['_spanProcessor'],
    });
    // @ts-expect-error writing readonly property. performance time origin is mocked to return ms value of [1,1]
    span['_performanceOffset'] = 0;
    span.end(hrTimeToMilliseconds(span.startTime) - 1);
    assert.ok(hrTimeToNanoseconds(span.duration) >= 0);
  });

  it('should have valid event.time', () => {
    const span = new SpanImpl({
      scope: tracer.instrumentationScope,
      resource: tracer['_resource'],
      context: ROOT_CONTEXT,
      spanContext,
      name,
      kind: SpanKind.SERVER,
      spanLimits: tracer.getSpanLimits(),
      spanProcessor: tracer['_spanProcessor'],
    });
    span.addEvent('my-event');
    assert.ok(
      hrTimeToMilliseconds(span.events[0].time) >
        hrTimeToMilliseconds(performanceTimeOrigin)
    );
  });

  it('should have an entered time for event', () => {
    const startTime = Date.now();
    const span = new SpanImpl({
      scope: tracer.instrumentationScope,
      resource: tracer['_resource'],
      context: ROOT_CONTEXT,
      spanContext,
      name,
      kind: SpanKind.SERVER,
      startTime,
      spanLimits: tracer.getSpanLimits(),
      spanProcessor: tracer['_spanProcessor'],
    });
    const eventTimeMS = 123;
    const spanStartTime = hrTimeToMilliseconds(span.startTime);
    const eventTime = spanStartTime + eventTimeMS;

    span.addEvent('my-event', undefined, eventTime);

    const diff = hrTimeDuration(span.startTime, span.events[0].time);
    assert.strictEqual(hrTimeToMilliseconds(diff), 123);
  });

  describe('when 2nd param is "TimeInput" type', () => {
    it('should have an entered time for event - ', () => {
      const startTime = Date.now();
      const span = new SpanImpl({
        scope: tracer.instrumentationScope,
        resource: tracer['_resource'],
        context: ROOT_CONTEXT,
        spanContext,
        name,
        kind: SpanKind.SERVER,
        startTime,
        spanLimits: tracer.getSpanLimits(),
        spanProcessor: tracer['_spanProcessor'],
      });
      const eventTimeMS = 123;
      const spanStartTime = hrTimeToMilliseconds(span.startTime);
      const eventTime = spanStartTime + eventTimeMS;

      span.addEvent('my-event', eventTime);

      const diff = hrTimeDuration(span.startTime, span.events[0].time);
      assert.strictEqual(hrTimeToMilliseconds(diff), 123);
    });
  });

  it('should get the span context of span', () => {
    const span = new SpanImpl({
      scope: tracer.instrumentationScope,
      resource: tracer['_resource'],
      context: ROOT_CONTEXT,
      spanContext,
      name,
      kind: SpanKind.CLIENT,
      spanLimits: tracer.getSpanLimits(),
      spanProcessor: tracer['_spanProcessor'],
    });
    const context = span.spanContext();
    assert.strictEqual(context.traceId, spanContext.traceId);
    assert.strictEqual(context.traceFlags, TraceFlags.SAMPLED);
    assert.strictEqual(context.traceState, undefined);
    assert.ok(context.spanId.match(/[a-f0-9]{16}/));
    assert.ok(span.isRecording());
    span.end();
  });

  describe('isRecording', () => {
    it('should return true when span is not ended', () => {
      const span = new SpanImpl({
        scope: tracer.instrumentationScope,
        resource: tracer['_resource'],
        context: ROOT_CONTEXT,
        spanContext,
        name,
        kind: SpanKind.CLIENT,
        spanLimits: tracer.getSpanLimits(),
        spanProcessor: tracer['_spanProcessor'],
      });
      assert.ok(span.isRecording());
      span.end();
    });
    it('should return false when span is ended', () => {
      const span = new SpanImpl({
        scope: tracer.instrumentationScope,
        resource: tracer['_resource'],
        context: ROOT_CONTEXT,
        spanContext,
        name,
        kind: SpanKind.CLIENT,
        spanLimits: tracer.getSpanLimits(),
        spanProcessor: tracer['_spanProcessor'],
      });
      span.end();
      assert.ok(span.isRecording() === false);
    });
  });

  it('should log a warning attempting to add event to ended span', () => {
    const span = new SpanImpl({
      scope: tracer.instrumentationScope,
      resource: tracer['_resource'],
      context: ROOT_CONTEXT,
      spanContext,
      name,
      kind: SpanKind.CLIENT,
      spanLimits: tracer.getSpanLimits(),
      spanProcessor: tracer['_spanProcessor'],
    });
    span.end();

    const warnStub = sinon.spy(diag, 'warn');

    span.addEvent('oops, too late');

    sinon.assert.calledOnce(warnStub);
    sinon.assert.calledWith(
      warnStub,
      sinon.match(/Cannot execute the operation on ended Span/),
      sinon.match.instanceOf(Error)
    );
  });

  describe('setAttribute', () => {
    describe('when default options set', () => {
      it('should set an attribute', () => {
        const span = new SpanImpl({
          scope: tracer.instrumentationScope,
          resource: tracer['_resource'],
          context: ROOT_CONTEXT,
          spanContext,
          name,
          kind: SpanKind.CLIENT,
          spanLimits: tracer.getSpanLimits(),
          spanProcessor: tracer['_spanProcessor'],
        });

        for (const [k, v] of Object.entries(validAttributes)) {
          span.setAttribute(k, v);
        }
        for (const [k, v] of Object.entries(invalidAttributes)) {
          span.setAttribute(k, v as unknown as AttributeValue);
        }

        assert.deepStrictEqual(span.attributes, validAttributes);
      });

      it('should be able to overwrite attributes', () => {
        const span = new SpanImpl({
          scope: tracer.instrumentationScope,
          resource: tracer['_resource'],
          context: ROOT_CONTEXT,
          spanContext,
          name,
          kind: SpanKind.CLIENT,
          spanLimits: tracer.getSpanLimits(),
          spanProcessor: tracer['_spanProcessor'],
        });

        span.setAttribute('overwrite', 'initial value');
        span.setAttribute('overwrite', 'overwritten value');

        assert.deepStrictEqual(span.attributes, {
          overwrite: 'overwritten value',
        });
      });
    });

    describe('when generalLimits options set', () => {
      describe('when "attributeCountLimit" option defined', () => {
        const tracer = new BasicTracerProvider({
          generalLimits: {
            // Setting count limit
            attributeCountLimit: 100,
          },
        }).getTracer('default') as Tracer;

        const span = new SpanImpl({
          scope: tracer.instrumentationScope,
          resource: tracer['_resource'],
          context: ROOT_CONTEXT,
          spanContext,
          name,
          kind: SpanKind.CLIENT,
          spanLimits: tracer.getSpanLimits(),
          spanProcessor: tracer['_spanProcessor'],
        });
        for (let i = 0; i < 150; i++) {
          span.setAttribute('foo' + i, 'bar' + i);
        }
        span.end();

        it('should remove / drop all remaining values after the number of values exceeds this limit', () => {
          assert.strictEqual(Object.keys(span.attributes).length, 100);
          assert.strictEqual(span.attributes['foo0'], 'bar0');
          assert.strictEqual(span.attributes['foo99'], 'bar99');
          assert.strictEqual(span.attributes['foo149'], undefined);
        });

        it('should store the count of dropped attributes in droppedAttributesCount', () => {
          assert.strictEqual(span.droppedAttributesCount, 50);
        });
      });

      describe('when "attributeValueLengthLimit" option defined', () => {
        const tracer = new BasicTracerProvider({
          generalLimits: {
            // Setting attribute value length limit
            attributeValueLengthLimit: 5,
          },
        }).getTracer('default') as Tracer;

        const span = new SpanImpl({
          scope: tracer.instrumentationScope,
          resource: tracer['_resource'],
          context: ROOT_CONTEXT,
          spanContext,
          name,
          kind: SpanKind.CLIENT,
          spanLimits: tracer.getSpanLimits(),
          spanProcessor: tracer['_spanProcessor'],
        });

        it('should truncate value which length exceeds this limit', () => {
          span.setAttribute('attr-with-more-length', 'abcdefgh');
          assert.strictEqual(span.attributes['attr-with-more-length'], 'abcde');
        });

        it('should truncate value of arrays which exceeds this limit', () => {
          span.setAttribute('attr-array-of-strings', [
            'abcdefgh',
            'abc',
            'abcde',
            '',
          ]);
          span.setAttribute('attr-array-of-bool', [true, false]);
          assert.deepStrictEqual(span.attributes['attr-array-of-strings'], [
            'abcde',
            'abc',
            'abcde',
            '',
          ]);
          assert.deepStrictEqual(span.attributes['attr-array-of-bool'], [
            true,
            false,
          ]);
        });

        it('should not truncate value which length not exceeds this limit', () => {
          span.setAttribute('attr-with-less-length', 'abc');
          assert.strictEqual(span.attributes['attr-with-less-length'], 'abc');
        });

        it('should return same value for non-string values', () => {
          span.setAttribute('attr-non-string', true);
          assert.strictEqual(span.attributes['attr-non-string'], true);
        });

        it('should truncate value when attributes are passed to the constructor', () => {
          const span = new SpanImpl({
            scope: tracer.instrumentationScope,
            resource: tracer['_resource'],
            context: ROOT_CONTEXT,
            spanContext,
            name,
            kind: SpanKind.CLIENT,
            spanLimits: tracer.getSpanLimits(),
            spanProcessor: tracer['_spanProcessor'],
            attributes: { 'attr-with-more-length': 'abcdefgh' },
          });
          assert.strictEqual(span.attributes['attr-with-more-length'], 'abcde');
        });
      });

      describe('when "attributeValueLengthLimit" option is invalid', () => {
        const tracer = new BasicTracerProvider({
          generalLimits: {
            // Setting invalid attribute value length limit
            attributeValueLengthLimit: -5,
          },
        }).getTracer('default') as Tracer;

        const span = new SpanImpl({
          scope: tracer.instrumentationScope,
          resource: tracer['_resource'],
          context: ROOT_CONTEXT,
          spanContext,
          name,
          kind: SpanKind.CLIENT,
          spanLimits: tracer.getSpanLimits(),
          spanProcessor: tracer['_spanProcessor'],
        });

        it('should not truncate any value', () => {
          span.setAttribute('attr-not-truncate', 'abcdefgh');
          span.setAttribute('attr-array-of-strings', [
            'abcdefgh',
            'abc',
            'abcde',
          ]);
          assert.deepStrictEqual(
            span.attributes['attr-not-truncate'],
            'abcdefgh'
          );
          assert.deepStrictEqual(span.attributes['attr-array-of-strings'], [
            'abcdefgh',
            'abc',
            'abcde',
          ]);
        });
      });
    });

    describe('when spanLimits options set', () => {
      describe('when "attributeCountLimit" option defined', () => {
        const tracer = new BasicTracerProvider({
          spanLimits: {
            // Setting count limit
            attributeCountLimit: 100,
          },
        }).getTracer('default') as Tracer;

        const span = new SpanImpl({
          scope: tracer.instrumentationScope,
          resource: tracer['_resource'],
          context: ROOT_CONTEXT,
          spanContext,
          name,
          kind: SpanKind.CLIENT,
          spanLimits: tracer.getSpanLimits(),
          spanProcessor: tracer['_spanProcessor'],
        });
        for (let i = 0; i < 150; i++) {
          span.setAttribute('foo' + i, 'bar' + i);
        }
        span.end();

        it('should remove / drop all remaining values after the number of values exceeds this limit', () => {
          assert.strictEqual(Object.keys(span.attributes).length, 100);
          assert.strictEqual(span.attributes['foo0'], 'bar0');
          assert.strictEqual(span.attributes['foo99'], 'bar99');
          assert.strictEqual(span.attributes['foo149'], undefined);
        });
      });

      describe('when "attributeValueLengthLimit" option defined', () => {
        const tracer = new BasicTracerProvider({
          spanLimits: {
            // Setting attribute value length limit
            attributeValueLengthLimit: 5,
          },
        }).getTracer('default') as Tracer;

        const span = new SpanImpl({
          scope: tracer.instrumentationScope,
          resource: tracer['_resource'],
          context: ROOT_CONTEXT,
          spanContext,
          name,
          kind: SpanKind.CLIENT,
          spanLimits: tracer.getSpanLimits(),
          spanProcessor: tracer['_spanProcessor'],
        });

        it('should truncate value which length exceeds this limit', () => {
          span.setAttribute('attr-with-more-length', 'abcdefgh');
          assert.strictEqual(span.attributes['attr-with-more-length'], 'abcde');
        });

        it('should truncate value of arrays which exceeds this limit', () => {
          span.setAttribute('attr-array-of-strings', [
            'abcdefgh',
            'abc',
            'abcde',
            '',
          ]);
          span.setAttribute('attr-array-of-bool', [true, false]);
          assert.deepStrictEqual(span.attributes['attr-array-of-strings'], [
            'abcde',
            'abc',
            'abcde',
            '',
          ]);
          assert.deepStrictEqual(span.attributes['attr-array-of-bool'], [
            true,
            false,
          ]);
        });

        it('should not truncate value which length not exceeds this limit', () => {
          span.setAttribute('attr-with-less-length', 'abc');
          assert.strictEqual(span.attributes['attr-with-less-length'], 'abc');
        });

        it('should return same value for non-string values', () => {
          span.setAttribute('attr-non-string', true);
          assert.strictEqual(span.attributes['attr-non-string'], true);
        });
      });

      describe('when "attributeValueLengthLimit" option is invalid', () => {
        const tracer = new BasicTracerProvider({
          spanLimits: {
            // Setting invalid attribute value length limit
            attributeValueLengthLimit: -5,
          },
        }).getTracer('default') as Tracer;

        const span = new SpanImpl({
          scope: tracer.instrumentationScope,
          resource: tracer['_resource'],
          context: ROOT_CONTEXT,
          spanContext,
          name,
          kind: SpanKind.CLIENT,
          spanLimits: tracer.getSpanLimits(),
          spanProcessor: tracer['_spanProcessor'],
        });

        it('should not truncate any value', () => {
          span.setAttribute('attr-not-truncate', 'abcdefgh');
          span.setAttribute('attr-array-of-strings', [
            'abcdefgh',
            'abc',
            'abcde',
          ]);
          assert.deepStrictEqual(
            span.attributes['attr-not-truncate'],
            'abcdefgh'
          );
          assert.deepStrictEqual(span.attributes['attr-array-of-strings'], [
            'abcdefgh',
            'abc',
            'abcde',
          ]);
        });
      });
    });

    describe('when both generalLimits and spanLimits options set', () => {
      describe('when "attributeCountLimit" option defined', () => {
        const tracer = new BasicTracerProvider({
          generalLimits: {
            // Setting count limit
            attributeCountLimit: 10,
          },
          spanLimits: {
            attributeCountLimit: 5,
          },
        }).getTracer('default') as Tracer;

        const span = new SpanImpl({
          scope: tracer.instrumentationScope,
          resource: tracer['_resource'],
          context: ROOT_CONTEXT,
          spanContext,
          name,
          kind: SpanKind.CLIENT,
          spanLimits: tracer.getSpanLimits(),
          spanProcessor: tracer['_spanProcessor'],
        });
        for (let i = 0; i < 150; i++) {
          span.setAttribute('foo' + i, 'bar' + i);
        }
        span.end();

        it('should remove / drop all remaining values after the number of values exceeds span limit', () => {
          assert.strictEqual(Object.keys(span.attributes).length, 5);
          assert.strictEqual(span.attributes['foo0'], 'bar0');
          assert.strictEqual(span.attributes['foo4'], 'bar4');
          assert.strictEqual(span.attributes['foo5'], undefined);
          assert.strictEqual(span.attributes['foo10'], undefined);
        });
      });

      describe('when span "attributeCountLimit" set to the default value and general "attributeCountLimit" option defined', () => {
        const tracer = new BasicTracerProvider({
          generalLimits: {
            // Setting count limit
            attributeCountLimit: 10,
          },
          spanLimits: {
            attributeCountLimit: DEFAULT_ATTRIBUTE_COUNT_LIMIT,
          },
        }).getTracer('default') as Tracer;

        const span = new SpanImpl({
          scope: tracer.instrumentationScope,
          resource: tracer['_resource'],
          context: ROOT_CONTEXT,
          spanContext,
          name,
          kind: SpanKind.CLIENT,
          spanLimits: tracer.getSpanLimits(),
          spanProcessor: tracer['_spanProcessor'],
        });
        for (let i = 0; i < 150; i++) {
          span.setAttribute('foo' + i, 'bar' + i);
        }
        span.end();

        it('should remove / drop all remaining values after the number of values exceeds the span limit', () => {
          assert.strictEqual(
            Object.keys(span.attributes).length,
            DEFAULT_ATTRIBUTE_COUNT_LIMIT
          );
          assert.strictEqual(span.attributes['foo0'], 'bar0');
          assert.strictEqual(span.attributes['foo10'], 'bar10');
          assert.strictEqual(span.attributes['foo127'], 'bar127');
          assert.strictEqual(span.attributes['foo128'], undefined);
        });
      });

      describe('when "attributeValueLengthLimit" option defined', () => {
        const tracer = new BasicTracerProvider({
          generalLimits: {
            // Setting attribute value length limit
            attributeValueLengthLimit: 10,
          },
          spanLimits: {
            // Setting attribute value length limit
            attributeValueLengthLimit: 5,
          },
        }).getTracer('default') as Tracer;

        const span = new SpanImpl({
          scope: tracer.instrumentationScope,
          resource: tracer['_resource'],
          context: ROOT_CONTEXT,
          spanContext,
          name,
          kind: SpanKind.CLIENT,
          spanLimits: tracer.getSpanLimits(),
          spanProcessor: tracer['_spanProcessor'],
        });

        it('should truncate value which length exceeds span limit', () => {
          span.setAttribute('attr-with-more-length', 'abcdefgh');
          assert.strictEqual(span.attributes['attr-with-more-length'], 'abcde');
        });

        it('should truncate value of arrays which exceeds span limit', () => {
          span.setAttribute('attr-array-of-strings', [
            'abcdefgh',
            'abc',
            'abcde',
            '',
          ]);
          span.setAttribute('attr-array-of-bool', [true, false]);
          assert.deepStrictEqual(span.attributes['attr-array-of-strings'], [
            'abcde',
            'abc',
            'abcde',
            '',
          ]);
          assert.deepStrictEqual(span.attributes['attr-array-of-bool'], [
            true,
            false,
          ]);
        });

        it('should not truncate value which length not exceeds span limit', () => {
          span.setAttribute('attr-with-less-length', 'abc');
          assert.strictEqual(span.attributes['attr-with-less-length'], 'abc');
        });

        it('should return same value for non-string values', () => {
          span.setAttribute('attr-non-string', true);
          assert.strictEqual(span.attributes['attr-non-string'], true);
        });
      });

      describe('when span "attributeValueLengthLimit" set to the default value and general "attributeValueLengthLimit" option defined', () => {
        const tracer = new BasicTracerProvider({
          generalLimits: {
            // Setting attribute value length limit
            attributeValueLengthLimit: 10,
          },
          spanLimits: {
            // Setting attribute value length limit
            attributeValueLengthLimit: DEFAULT_ATTRIBUTE_VALUE_LENGTH_LIMIT,
          },
        }).getTracer('default') as Tracer;

        const span = new SpanImpl({
          scope: tracer.instrumentationScope,
          resource: tracer['_resource'],
          context: ROOT_CONTEXT,
          spanContext,
          name,
          kind: SpanKind.CLIENT,
          spanLimits: tracer.getSpanLimits(),
          spanProcessor: tracer['_spanProcessor'],
        });

        it('should not truncate value', () => {
          span.setAttribute('attr-with-more-length', 'abcdefghijklmn');
          assert.strictEqual(
            span.attributes['attr-with-more-length'],
            'abcdefghijklmn'
          );
        });

        it('should not truncate value of arrays', () => {
          span.setAttribute('attr-array-of-strings', [
            'abcdefghijklmn',
            'abc',
            'abcde',
            '',
          ]);
          span.setAttribute('attr-array-of-bool', [true, false]);
          assert.deepStrictEqual(span.attributes['attr-array-of-strings'], [
            'abcdefghijklmn',
            'abc',
            'abcde',
            '',
          ]);
          assert.deepStrictEqual(span.attributes['attr-array-of-bool'], [
            true,
            false,
          ]);
        });

        it('should return same value for non-string values', () => {
          span.setAttribute('attr-non-string', true);
          assert.strictEqual(span.attributes['attr-non-string'], true);
        });
      });
    });
  });

  describe('setAttributes', () => {
    it('should be able to set multiple attributes', () => {
      const span = new SpanImpl({
        scope: tracer.instrumentationScope,
        resource: tracer['_resource'],
        context: ROOT_CONTEXT,
        spanContext,
        name,
        kind: SpanKind.CLIENT,
        spanLimits: tracer.getSpanLimits(),
        spanProcessor: tracer['_spanProcessor'],
      });

      span.setAttributes(validAttributes);
      span.setAttributes(invalidAttributes as unknown as Attributes);

      assert.deepStrictEqual(span.attributes, validAttributes);
    });
  });

  describe('addEvent', () => {
    it('should add an event', () => {
      const span = new SpanImpl({
        scope: tracer.instrumentationScope,
        resource: tracer['_resource'],
        context: ROOT_CONTEXT,
        spanContext,
        name,
        kind: SpanKind.CLIENT,
        spanLimits: tracer.getSpanLimits(),
        spanProcessor: tracer['_spanProcessor'],
      });
      span.addEvent('sent');
      span.addEvent('rev', { attr1: 'value', attr2: 123, attr3: true });
      span.end();
    });

    it('should sanitize attribute values', () => {
      const span = new SpanImpl({
        scope: tracer.instrumentationScope,
        resource: tracer['_resource'],
        context: ROOT_CONTEXT,
        spanContext,
        name,
        kind: SpanKind.CLIENT,
        spanLimits: tracer.getSpanLimits(),
        spanProcessor: tracer['_spanProcessor'],
      });
      span.addEvent('rev', {
        ...validAttributes,
        ...invalidAttributes,
      } as unknown as Attributes);
      span.end();

      assert.strictEqual(span.events.length, 1);
      assert.deepStrictEqual(span.events[0].name, 'rev');
      assert.deepStrictEqual(span.events[0].attributes, validAttributes);
    });
  });

  it('should drop extra events', () => {
    const span = new SpanImpl({
      scope: tracer.instrumentationScope,
      resource: tracer['_resource'],
      context: ROOT_CONTEXT,
      spanContext,
      name,
      kind: SpanKind.CLIENT,
      spanLimits: tracer.getSpanLimits(),
      spanProcessor: tracer['_spanProcessor'],
    });

    const debugStub = sinon.spy(diag, 'debug');
    const warnStub = sinon.spy(diag, 'warn');

    for (let i = 0; i < 150; i++) {
      span.addEvent('sent' + i);
    }
    span.end();

    assert.strictEqual(span.events.length, 100);
    assert.strictEqual(span.events[span.events.length - 1].name, 'sent149');

    sinon.assert.calledOnceWithExactly(debugStub, 'Dropping extra events.');
    sinon.assert.calledOnceWithExactly(
      warnStub,
      'Dropped 50 events because eventCountLimit reached'
    );
  });

  it('should store the count of dropped events in droppedEventsCount', () => {
    const span = new SpanImpl({
      scope: tracer.instrumentationScope,
      resource: tracer['_resource'],
      context: ROOT_CONTEXT,
      spanContext,
      name,
      kind: SpanKind.CLIENT,
      spanLimits: tracer.getSpanLimits(),
      spanProcessor: tracer['_spanProcessor'],
    });
    for (let i = 0; i < 150; i++) {
      span.addEvent('sent' + i);
    }
    span.end();

    assert.strictEqual(span.droppedEventsCount, 50);
  });

  it('should add no event', () => {
    const tracer = new BasicTracerProvider({
      spanLimits: {
        eventCountLimit: 0,
      },
    }).getTracer('default') as Tracer;

    const span = new SpanImpl({
      scope: tracer.instrumentationScope,
      resource: tracer['_resource'],
      context: ROOT_CONTEXT,
      spanContext,
      name,
      kind: SpanKind.CLIENT,
      spanLimits: tracer.getSpanLimits(),
      spanProcessor: tracer['_spanProcessor'],
    });
    for (let i = 0; i < 10; i++) {
      span.addEvent('sent' + i);
    }
    span.end();

    assert.strictEqual(span.events.length, 0);
  });

  it('should set an error status', () => {
    const span = new SpanImpl({
      scope: tracer.instrumentationScope,
      resource: tracer['_resource'],
      context: ROOT_CONTEXT,
      spanContext,
      name,
      kind: SpanKind.CLIENT,
      spanLimits: tracer.getSpanLimits(),
      spanProcessor: tracer['_spanProcessor'],
    });
    span.setStatus({
      code: SpanStatusCode.ERROR,
      message: 'This is an error',
    });
    span.end();

    assert.strictEqual(span.status.code, SpanStatusCode.ERROR);
    assert.strictEqual(span.status.message, 'This is an error');
  });

  it('should drop non-string status message', function () {
    const warnStub = sinon.spy(diag, 'warn');
    const span = new SpanImpl({
      scope: tracer.instrumentationScope,
      resource: tracer['_resource'],
      context: ROOT_CONTEXT,
      spanContext,
      name,
      kind: SpanKind.CLIENT,
      spanLimits: tracer.getSpanLimits(),
      spanProcessor: tracer['_spanProcessor'],
    });
    span.setStatus({
      code: SpanStatusCode.ERROR,
      message: new Error('this is not a string') as any,
    });
    span.end();

    assert.strictEqual(span.status.code, SpanStatusCode.ERROR);
    assert.strictEqual(span.status.message, undefined);
    sinon.assert.calledOnceWithExactly(
      warnStub,
      "Dropping invalid status.message of type 'object', expected 'string'"
    );
  });

  it('should return ReadableSpan', () => {
    const parentId = '5c1c63257de34c67';
    const span = new SpanImpl({
      scope: tracer.instrumentationScope,
      resource: tracer['_resource'],
      context: ROOT_CONTEXT,
      spanContext,
      name: 'my-span',
      kind: SpanKind.INTERNAL,
      parentSpanContext: {
        spanId: parentId,
        traceId: '',
        traceFlags: TraceFlags.SAMPLED,
      },
      spanLimits: tracer.getSpanLimits(),
      spanProcessor: tracer['_spanProcessor'],
    });

    assert.strictEqual(span.name, 'my-span');
    assert.strictEqual(span.kind, SpanKind.INTERNAL);
    assert.strictEqual(span.parentSpanContext?.spanId, parentId);
    assert.strictEqual(span.spanContext().traceId, spanContext.traceId);
    assert.deepStrictEqual(span.status, {
      code: SpanStatusCode.UNSET,
    });
    assert.deepStrictEqual(span.attributes, {});
    assert.deepStrictEqual(span.links, []);
    assert.deepStrictEqual(span.events, []);

    assert.ok(span.instrumentationScope);
    const { name, version } = span.instrumentationScope;
    assert.strictEqual(name, 'default');
    assert.strictEqual(version, undefined);
  });

  it('should return ReadableSpan with attributes', () => {
    const span = new SpanImpl({
      scope: tracer.instrumentationScope,
      resource: tracer['_resource'],
      context: ROOT_CONTEXT,
      spanContext,
      name: 'my-span',
      kind: SpanKind.CLIENT,
      spanLimits: tracer.getSpanLimits(),
      spanProcessor: tracer['_spanProcessor'],
    });
    span.setAttribute('attr1', 'value1');
    assert.deepStrictEqual(span.attributes, { attr1: 'value1' });

    span.setAttributes({ attr2: 123, attr1: false });
    assert.deepStrictEqual(span.attributes, {
      attr1: false,
      attr2: 123,
    });

    span.end();
    // shouldn't add new attribute
    span.setAttribute('attr3', 'value3');
    assert.deepStrictEqual(span.attributes, {
      attr1: false,
      attr2: 123,
    });
  });

  it('should return ReadableSpan with links', () => {
    const span = new SpanImpl({
      scope: tracer.instrumentationScope,
      resource: tracer['_resource'],
      context: ROOT_CONTEXT,
      spanContext,
      name: 'my-span',
      kind: SpanKind.CLIENT,
      spanLimits: tracer.getSpanLimits(),
      spanProcessor: tracer['_spanProcessor'],
      links: [
        { context: linkContext },
        {
          context: linkContext,
          attributes: { attr1: 'value', attr2: 123, attr3: true },
        },
      ],
    });
    assert.strictEqual(span.links.length, 2);
    assert.deepStrictEqual(span.links, [
      {
        context: linkContext,
      },
      {
        attributes: { attr1: 'value', attr2: 123, attr3: true },
        context: linkContext,
      },
    ]);

    span.end();
  });

  it('should be possible to add a link after span creation', () => {
    const span = new SpanImpl({
      scope: tracer.instrumentationScope,
      resource: tracer['_resource'],
      context: ROOT_CONTEXT,
      spanContext,
      name: 'my-span',
      kind: SpanKind.CONSUMER,
      spanLimits: tracer.getSpanLimits(),
      spanProcessor: tracer['_spanProcessor'],
    });

    span.addLink({ context: linkContext });

    span.end();

    assert.strictEqual(span.links.length, 1);
    assert.deepStrictEqual(span.links, [
      {
        context: linkContext,
      },
    ]);
  });

  it('should be possible to add multiple links after span creation', () => {
    const span = new SpanImpl({
      scope: tracer.instrumentationScope,
      resource: tracer['_resource'],
      context: ROOT_CONTEXT,
      spanContext,
      name: 'my-span',
      kind: SpanKind.CONSUMER,
      spanLimits: tracer.getSpanLimits(),
      spanProcessor: tracer['_spanProcessor'],
    });

    span.addLinks([
      { context: linkContext },
      {
        context: linkContext,
        attributes: { attr1: 'value', attr2: 123, attr3: true },
      },
    ]);

    span.end();

    assert.strictEqual(span.links.length, 2);
    assert.deepStrictEqual(span.links, [
      {
        context: linkContext,
      },
      {
        attributes: { attr1: 'value', attr2: 123, attr3: true },
        context: linkContext,
      },
    ]);
  });

  it('should return ReadableSpan with events', () => {
    const span = new SpanImpl({
      scope: tracer.instrumentationScope,
      resource: tracer['_resource'],
      context: ROOT_CONTEXT,
      spanContext,
      name: 'my-span',
      kind: SpanKind.CLIENT,
      spanLimits: tracer.getSpanLimits(),
      spanProcessor: tracer['_spanProcessor'],
    });
    span.addEvent('sent');
    assert.strictEqual(span.events.length, 1);
    const [event] = span.events;
    assert.deepStrictEqual(event.name, 'sent');
    assert.deepStrictEqual(event.attributes, {});
    assert.ok(event.time[0] > 0);

    span.addEvent('rev', { attr1: 'value', attr2: 123, attr3: true });
    assert.strictEqual(span.events.length, 2);
    const [event1, event2] = span.events;
    assert.deepStrictEqual(event1.name, 'sent');
    assert.deepStrictEqual(event1.attributes, {});
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
    assert.strictEqual(span.events.length, 2);
  });

  it('should return ReadableSpan with new status', () => {
    const span = new SpanImpl({
      scope: tracer.instrumentationScope,
      resource: tracer['_resource'],
      context: ROOT_CONTEXT,
      spanContext,
      name,
      kind: SpanKind.CLIENT,
      spanLimits: tracer.getSpanLimits(),
      spanProcessor: tracer['_spanProcessor'],
    });
    span.setStatus({
      code: SpanStatusCode.ERROR,
      message: 'This is an error',
    });
    assert.strictEqual(span.status.code, SpanStatusCode.ERROR);
    assert.strictEqual(span.status.message, 'This is an error');
    span.end();

    // shouldn't update status
    span.setStatus({
      code: SpanStatusCode.OK,
      message: 'OK',
    });
    assert.strictEqual(span.status.code, SpanStatusCode.ERROR);
  });

  it('should only end a span once', () => {
    const span = new SpanImpl({
      scope: tracer.instrumentationScope,
      resource: tracer['_resource'],
      context: ROOT_CONTEXT,
      spanContext,
      name,
      kind: SpanKind.SERVER,
      spanLimits: tracer.getSpanLimits(),
      spanProcessor: tracer['_spanProcessor'],
    });
    const endTime = Date.now();
    span.end(endTime);
    span.end(endTime + 10);
    assert.deepStrictEqual(span.endTime[0], Math.trunc(endTime / 1000));
  });

  it('should update name', () => {
    const span = new SpanImpl({
      scope: tracer.instrumentationScope,
      resource: tracer['_resource'],
      context: ROOT_CONTEXT,
      spanContext,
      name,
      kind: SpanKind.SERVER,
      spanLimits: tracer.getSpanLimits(),
      spanProcessor: tracer['_spanProcessor'],
    });
    span.updateName('foo-span');
    span.end();

    // shouldn't update name
    span.updateName('bar-span');
    assert.strictEqual(span.name, 'foo-span');
  });

  it('should have ended', () => {
    const span = new SpanImpl({
      scope: tracer.instrumentationScope,
      resource: tracer['_resource'],
      context: ROOT_CONTEXT,
      spanContext,
      name,
      kind: SpanKind.SERVER,
      spanLimits: tracer.getSpanLimits(),
      spanProcessor: tracer['_spanProcessor'],
    });
    assert.strictEqual(span.ended, false);
    span.end();
    assert.strictEqual(span.ended, true);
  });

  describe('span processor', () => {
    it('should call onStart synchronously when span is started', () => {
      let started = false;
      const processor: SpanProcessor = {
        onStart: () => {
          started = true;
        },
        forceFlush: () => Promise.resolve(),
        onEnd() {},
        shutdown: () => Promise.resolve(),
      };

      const provider = new BasicTracerProvider({
        spanProcessors: [processor],
      });

      provider.getTracer('default').startSpan('test');
      assert.ok(started);
    });

    it('should include attributes in onStart', () => {
      let attributes;
      const processor: SpanProcessor = {
        onStart: span => {
          attributes = { ...span.attributes };
        },
        forceFlush: () => Promise.resolve(),
        onEnd() {},
        shutdown: () => Promise.resolve(),
      };

      const provider = new BasicTracerProvider({
        spanProcessors: [processor],
      });

      provider
        .getTracer('default')
        .startSpan('test', { attributes: { foo: 'bar' } });
      assert.deepStrictEqual(attributes, { foo: 'bar' });
    });

    it('should call onEnd synchronously when span is ended', () => {
      let ended = false;
      const processor: SpanProcessor = {
        onStart: () => {},
        forceFlush: () => Promise.resolve(),
        onEnd() {
          ended = true;
        },
        shutdown: () => Promise.resolve(),
      };

      const provider = new BasicTracerProvider({
        spanProcessors: [processor],
      });

      provider.getTracer('default').startSpan('test').end();
      assert.ok(ended);
    });

    it('should call onStart with a writeable span', () => {
      const processor: SpanProcessor = {
        onStart: span => {
          span.setAttribute('attr', true);
        },
        forceFlush: () => Promise.resolve(),
        onEnd() {},
        shutdown: () => Promise.resolve(),
      };

      const provider = new BasicTracerProvider({
        spanProcessors: [processor],
      });

      const s = provider.getTracer('default').startSpan('test') as Span;
      assert.ok(s.attributes.attr);
    });
  });

  describe('recordException', () => {
    const invalidExceptions: any[] = [
      1,
      null,
      undefined,
      { foo: 'bar' },
      { stack: 'bar' },
      ['a', 'b', 'c'],
    ];

    invalidExceptions.forEach(key => {
      describe(`when exception is (${JSON.stringify(key)})`, () => {
        it('should NOT record an exception', () => {
          const span = new SpanImpl({
            scope: tracer.instrumentationScope,
            resource: tracer['_resource'],
            context: ROOT_CONTEXT,
            spanContext,
            name,
            kind: SpanKind.CLIENT,
            spanLimits: tracer.getSpanLimits(),
            spanProcessor: tracer['_spanProcessor'],
          });
          assert.strictEqual(span.events.length, 0);
          span.recordException(key);
          assert.strictEqual(span.events.length, 0);
        });
      });
    });

    describe('when exception type is "string"', () => {
      let error: Exception;
      beforeEach(() => {
        error = 'boom';
      });
      it('should record an exception', () => {
        const span = new SpanImpl({
          scope: tracer.instrumentationScope,
          resource: tracer['_resource'],
          context: ROOT_CONTEXT,
          spanContext,
          name,
          kind: SpanKind.CLIENT,
          spanLimits: tracer.getSpanLimits(),
          spanProcessor: tracer['_spanProcessor'],
        });
        assert.strictEqual(span.events.length, 0);
        span.recordException(error);

        const event = span.events[0];
        assert.strictEqual(event.name, 'exception');
        assert.deepStrictEqual(event.attributes, {
          'exception.message': 'boom',
        });
        assert.ok(event.time[0] > 0);
      });
    });

    const errorsObj = [
      {
        description: 'code',
        obj: { code: 'Error', message: 'boom', stack: 'bar' },
      },
      {
        description: 'name',
        obj: { name: 'Error', message: 'boom', stack: 'bar' },
      },
    ];
    errorsObj.forEach(errorObj => {
      describe(`when exception type is an object with ${errorObj.description}`, () => {
        const error: Exception = errorObj.obj;
        it('should record an exception', () => {
          const span = new SpanImpl({
            scope: tracer.instrumentationScope,
            resource: tracer['_resource'],
            context: ROOT_CONTEXT,
            spanContext,
            name,
            kind: SpanKind.CLIENT,
            spanLimits: tracer.getSpanLimits(),
            spanProcessor: tracer['_spanProcessor'],
          });
          assert.strictEqual(span.events.length, 0);
          span.recordException(error);

          const event = span.events[0];
          assert.ok(event.time[0] > 0);
          assert.strictEqual(event.name, 'exception');

          assert.ok(event.attributes);

          const type = event.attributes[ATTR_EXCEPTION_TYPE];
          const message = event.attributes[ATTR_EXCEPTION_MESSAGE];
          const stacktrace = String(
            event.attributes[ATTR_EXCEPTION_STACKTRACE]
          );
          assert.strictEqual(type, 'Error');
          assert.strictEqual(message, 'boom');
          assert.strictEqual(stacktrace, 'bar');
        });
      });
    });

    describe('when time is provided', () => {
      it('should record an exception with provided time', () => {
        const span = new SpanImpl({
          scope: tracer.instrumentationScope,
          resource: tracer['_resource'],
          context: ROOT_CONTEXT,
          spanContext,
          name,
          kind: SpanKind.CLIENT,
          spanLimits: tracer.getSpanLimits(),
          spanProcessor: tracer['_spanProcessor'],
        });
        // @ts-expect-error writing readonly property. performance time origin is mocked to return ms value of [1,1]
        span['_performanceOffset'] = 0;
        assert.strictEqual(span.events.length, 0);
        span.recordException('boom', [0, 123]);
        const event = span.events[0];
        assert.deepStrictEqual(event.time, [0, 123]);
      });
    });

    describe('when exception code is numeric', () => {
      it('should record an exception with string value', () => {
        const span = new SpanImpl({
          scope: tracer.instrumentationScope,
          resource: tracer['_resource'],
          context: ROOT_CONTEXT,
          spanContext,
          name,
          kind: SpanKind.CLIENT,
          spanLimits: tracer.getSpanLimits(),
          spanProcessor: tracer['_spanProcessor'],
        });
        assert.strictEqual(span.events.length, 0);
        span.recordException({ code: 12 });
        const event = span.events[0];
        assert.deepStrictEqual(event.attributes, {
          [ATTR_EXCEPTION_TYPE]: '12',
        });
      });
    });

    describe('when attributes are specified', () => {
      it('should store specified attributes', () => {
        const span = new SpanImpl({
          scope: tracer.instrumentationScope,
          resource: tracer['_resource'],
          context: ROOT_CONTEXT,
          spanContext,
          name,
          kind: SpanKind.CLIENT,
          spanLimits: tracer.getSpanLimits(),
          spanProcessor: tracer['_spanProcessor'],
          attributes: { foo: 'bar' },
        });
        assert.deepStrictEqual(span.attributes, { foo: 'bar' });
      });
    });
  });
});
