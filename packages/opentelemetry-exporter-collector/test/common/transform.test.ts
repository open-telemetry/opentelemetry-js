/*!
 * Copyright 2020, OpenTelemetry Authors
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

import { Attributes, TimedEvent, TraceFlags } from '@opentelemetry/api';
import * as assert from 'assert';
import * as transform from '../../src/transform';
import { ensureSpanIsCorrect, mockedReadableSpan } from '../helper';
import { Resource } from '@opentelemetry/resources';
import { InstrumentationLibrary } from '@opentelemetry/core';
import { ReadableSpan } from '@opentelemetry/tracing';

describe('transform', () => {
  describe('toCollectorAttributes', () => {
    it('should convert attribute string', () => {
      const attributes: Attributes = {
        foo: 'bar',
      };
      assert.deepStrictEqual(transform.toCollectorAttributes(attributes), [
        { key: 'foo', type: 0, stringValue: 'bar' },
      ]);
    });

    it('should convert attribute integer', () => {
      const attributes: Attributes = {
        foo: 13,
      };
      assert.deepStrictEqual(transform.toCollectorAttributes(attributes), [
        { key: 'foo', type: 2, doubleValue: 13 },
      ]);
    });

    it('should convert attribute boolean', () => {
      const attributes: Attributes = {
        foo: true,
      };
      assert.deepStrictEqual(transform.toCollectorAttributes(attributes), [
        { key: 'foo', type: 3, boolValue: true },
      ]);
    });

    it('should convert attribute double', () => {
      const attributes: Attributes = {
        foo: 1.34,
      };
      assert.deepStrictEqual(transform.toCollectorAttributes(attributes), [
        { key: 'foo', type: 2, doubleValue: 1.34 },
      ]);
    });
  });

  describe('toCollectorEvents', () => {
    it('should convert events to otc events', () => {
      const events: TimedEvent[] = [
        { name: 'foo', time: [123, 123], attributes: { a: 'b' } },
        {
          name: 'foo2',
          time: [321, 321],
          attributes: { c: 'd' },
        },
      ];
      assert.deepStrictEqual(transform.toCollectorEvents(events), [
        {
          timeUnixNano: 123000000123,
          name: 'foo',
          attributes: [{ key: 'a', type: 0, stringValue: 'b' }],
          droppedAttributesCount: 0,
        },
        {
          timeUnixNano: 321000000321,
          name: 'foo2',
          attributes: [{ key: 'c', type: 0, stringValue: 'd' }],
          droppedAttributesCount: 0,
        },
      ]);
    });
  });

  describe('toCollectorSpan', () => {
    it('should convert span', () => {
      ensureSpanIsCorrect(transform.toCollectorSpan(mockedReadableSpan));
    });
  });

  describe('toCollectorResource', () => {
    it('should convert resource', () => {
      const resource = transform.toCollectorResource(
        new Resource({
          service: 'ui',
          version: 1.0,
          success: true,
        })
      );
      assert.deepStrictEqual(resource, {
        attributes: [
          {
            key: 'service',
            type: 0,
            stringValue: 'ui',
          },
          {
            key: 'version',
            type: 2,
            doubleValue: 1,
          },
          { key: 'success', type: 3, boolValue: true },
        ],
        droppedAttributesCount: 0,
      });
    });
  });

  describe('groupSpans', () => {
    it('should group by resource', () => {
      const resource1: Resource = new Resource({ name: 'resource 1' });
      const resource2: Resource = new Resource({ name: 'resource 2' });
      const instrumentationLibrary: InstrumentationLibrary = new InstrumentationLibrary(
        'lib1',
        '0.0.1'
      );

      const span1: ReadableSpan = {
        name: 'span1',
        kind: 0,
        spanContext: {
          traceId: '1f1008dc8e270e85c40a0d7c3939b278',
          spanId: '5e107261f64fa53e',
          traceFlags: TraceFlags.SAMPLED,
        },
        parentSpanId: '78a8915098864388',
        startTime: [1574120165, 429803070],
        endTime: [1574120165, 438688070],
        ended: true,
        status: { code: 0 },
        attributes: {},
        links: [],
        events: [],
        duration: [0, 8885000],
        resource: resource1,
        instrumentationLibrary,
      };

      const span2: ReadableSpan = {
        name: 'span2',
        kind: 0,
        spanContext: {
          traceId: '1f1008dc8e270e85c40a0d7c3939b278',
          spanId: 'f64fa53e5e107261',
          traceFlags: TraceFlags.SAMPLED,
        },
        parentSpanId: '86438878a8915098',
        startTime: [1575120165, 439803070],
        endTime: [1575120165, 448688070],
        ended: true,
        status: { code: 0 },
        attributes: {},
        links: [],
        events: [],
        duration: [0, 8775000],
        resource: resource2,
        instrumentationLibrary,
      };

      const span3: ReadableSpan = {
        name: 'span3',
        kind: 0,
        spanContext: {
          traceId: '1f1008dc8e270e85c40a0d7c3939b278',
          spanId: '07261f64fa53e5e1',
          traceFlags: TraceFlags.SAMPLED,
        },
        parentSpanId: 'a891578098864388',
        startTime: [1575120165, 439803070],
        endTime: [1575120165, 448688070],
        ended: true,
        status: { code: 0 },
        attributes: {},
        links: [],
        events: [],
        duration: [0, 8775000],
        resource: resource2,
        instrumentationLibrary,
      };

      const expected = new Map([
        [resource1, new Map([[instrumentationLibrary, [span1]]])],
        [resource2, new Map([[instrumentationLibrary, [span2, span3]]])],
      ]);

      const result = transform.groupSpans([span1, span2, span3]);

      assert.deepStrictEqual(result, expected);
    });

    it('should group by instrumentation library', () => {
      const resource: Resource = new Resource({ name: 'resource 1' });
      const instrumentationLibrary1: InstrumentationLibrary = new InstrumentationLibrary(
        'lib1',
        '0.0.1'
      );
      const instrumentationLibrary2: InstrumentationLibrary = new InstrumentationLibrary(
        'lib2',
        '0.0.2'
      );

      const span1: ReadableSpan = {
        name: 'span1',
        kind: 0,
        spanContext: {
          traceId: '1f1008dc8e270e85c40a0d7c3939b278',
          spanId: '5e107261f64fa53e',
          traceFlags: TraceFlags.SAMPLED,
        },
        parentSpanId: '78a8915098864388',
        startTime: [1574120165, 429803070],
        endTime: [1574120165, 438688070],
        ended: true,
        status: { code: 0 },
        attributes: {},
        links: [],
        events: [],
        duration: [0, 8885000],
        resource,
        instrumentationLibrary: instrumentationLibrary1,
      };

      const span2: ReadableSpan = {
        name: 'span2',
        kind: 0,
        spanContext: {
          traceId: '1f1008dc8e270e85c40a0d7c3939b278',
          spanId: 'f64fa53e5e107261',
          traceFlags: TraceFlags.SAMPLED,
        },
        parentSpanId: '78a8915098864388',
        startTime: [1575120165, 439803070],
        endTime: [1575120165, 448688070],
        ended: true,
        status: { code: 0 },
        attributes: {},
        links: [],
        events: [],
        duration: [0, 8775000],
        resource,
        instrumentationLibrary: instrumentationLibrary1,
      };

      const span3: ReadableSpan = {
        name: 'span3',
        kind: 0,
        spanContext: {
          traceId: '1f1008dc8e270e85c40a0d7c3939b278',
          spanId: '07261f64fa53e5e1',
          traceFlags: TraceFlags.SAMPLED,
        },
        parentSpanId: 'a891578098864388',
        startTime: [1575120165, 439803070],
        endTime: [1575120165, 448688070],
        ended: true,
        status: { code: 0 },
        attributes: {},
        links: [],
        events: [],
        duration: [0, 8775000],
        resource: resource,
        instrumentationLibrary: instrumentationLibrary2,
      };

      const expected = new Map([
        [
          resource,
          new Map([
            [instrumentationLibrary1, [span1, span2]],
            [instrumentationLibrary2, [span3]],
          ]),
        ],
      ]);

      const result = transform.groupSpans([span1, span2, span3]);

      assert.deepStrictEqual(result, expected);
    });
  });
});
