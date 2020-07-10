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

import { Attributes, TimedEvent } from '@opentelemetry/api';
import * as assert from 'assert';
import * as transform from '../../src/platform/node/transformSpansProto';
import { opentelemetryProto } from '../../src/types';
import { mockedReadableSpan } from '../helper';
import { Resource } from '@opentelemetry/resources';

describe('transform - spans proto', () => {
  describe('toCollectorAttributes', () => {
    it('should convert attribute string', () => {
      const attributes: Attributes = {
        foo: 'bar',
      };
      assert.deepStrictEqual(
        transform.toCollectorAttributes(attributes)[0].toObject(),
        {
          key: 'foo',
          type: 0,
          stringValue: 'bar',
          intValue: 0,
          doubleValue: 0,
          boolValue: false,
        }
      );
    });

    it('should convert attribute integer', () => {
      const attributes: Attributes = {
        foo: 13,
      };
      assert.deepStrictEqual(
        transform.toCollectorAttributes(attributes)[0].toObject(),
        {
          key: 'foo',
          type: 2,
          stringValue: '',
          intValue: 0,
          doubleValue: 13,
          boolValue: false,
        }
      );
    });

    it('should convert attribute boolean', () => {
      const attributes: Attributes = {
        foo: true,
      };
      assert.deepStrictEqual(
        transform.toCollectorAttributes(attributes)[0].toObject(),
        {
          key: 'foo',
          type: 3,
          stringValue: '',
          intValue: 0,
          doubleValue: 0,
          boolValue: true,
        }
      );
    });

    it('should convert attribute double', () => {
      const attributes: Attributes = {
        foo: 1.34,
      };
      assert.deepStrictEqual(
        transform.toCollectorAttributes(attributes)[0].toObject(),
        {
          key: 'foo',
          type: 2,
          stringValue: '',
          intValue: 0,
          doubleValue: 1.34,
          boolValue: false,
        }
      );
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
      const protoEvents = transform.toCollectorEvents(events);
      const event1 = protoEvents[0].toObject();
      const event2 = protoEvents[1].toObject();
      assert.deepStrictEqual(event1, {
        timeUnixNano: 123000000123,
        name: 'foo',
        attributesList: [
          {
            key: 'a',
            type: 0,
            stringValue: 'b',
            intValue: 0,
            doubleValue: 0,
            boolValue: false,
          },
        ],
        droppedAttributesCount: 0,
      });
      assert.deepStrictEqual(event2, {
        timeUnixNano: 321000000321,
        name: 'foo2',
        attributesList: [
          {
            key: 'c',
            type: 0,
            stringValue: 'd',
            intValue: 0,
            doubleValue: 0,
            boolValue: false,
          },
        ],
        droppedAttributesCount: 0,
      });
    });
  });

  describe('toCollectorSpan', () => {
    const span = transform.toCollectorSpan(mockedReadableSpan).toObject();
    it('should convert attributes', () => {
      assert.deepStrictEqual(span.attributesList, [
        {
          key: 'component',
          type: 0,
          stringValue: 'document-load',
          intValue: 0,
          doubleValue: 0,
          boolValue: false,
        },
      ]);
    });
    it('should convert events', () => {
      assert.deepStrictEqual(span.eventsList, [
        {
          timeUnixNano: 1574120165429803000,
          name: 'fetchStart',
          attributesList: [],
          droppedAttributesCount: 0,
        },
        {
          timeUnixNano: 1574120165429803000,
          name: 'domainLookupStart',
          attributesList: [],
          droppedAttributesCount: 0,
        },
        {
          timeUnixNano: 1574120165429803000,
          name: 'domainLookupEnd',
          attributesList: [],
          droppedAttributesCount: 0,
        },
        {
          timeUnixNano: 1574120165429803000,
          name: 'connectStart',
          attributesList: [],
          droppedAttributesCount: 0,
        },
        {
          timeUnixNano: 1574120165429803000,
          name: 'connectEnd',
          attributesList: [],
          droppedAttributesCount: 0,
        },
        {
          timeUnixNano: 1574120165435513000,
          name: 'requestStart',
          attributesList: [],
          droppedAttributesCount: 0,
        },
        {
          timeUnixNano: 1574120165436923100,
          name: 'responseStart',
          attributesList: [],
          droppedAttributesCount: 0,
        },
        {
          timeUnixNano: 1574120165438688000,
          name: 'responseEnd',
          attributesList: [],
          droppedAttributesCount: 0,
        },
      ]);
    });
    it('should convert links', () => {
      assert.deepStrictEqual(span.linksList, [
        {
          traceId: 'HxAI3I4nDoXECg18OTmyeA==',
          spanId: 'eKiRUJiGQ4g=',
          traceState: '',
          attributesList: [
            {
              key: 'component',
              type: 0,
              stringValue: 'document-load',
              intValue: 0,
              doubleValue: 0,
              boolValue: false,
            },
          ],
          droppedAttributesCount: 0,
        },
      ]);
    });
    it('should convert trace id', () => {
      assert.deepStrictEqual(
        span.traceId,
        'HxAI3I4nDoXECg18OTmyeA==',
        'traceId is wrong'
      );
      assert.deepStrictEqual(span.spanId, 'XhByYfZPpT4=', 'spanId is wrong');
      assert.deepStrictEqual(
        span.parentSpanId,
        'eKiRUJiGQ4g=',
        'parentIdArr is wrong'
      );
      assert.strictEqual(span.name, 'documentFetch', 'name is wrong');
      assert.strictEqual(
        span.kind,
        opentelemetryProto.trace.v1.Span.SpanKind.INTERNAL,
        'kind is wrong'
      );
      assert.strictEqual(
        span.startTimeUnixNano,
        1574120165429803008,
        'startTimeUnixNano is wrong'
      );
      assert.strictEqual(
        span.endTimeUnixNano,
        1574120165438688000,
        'endTimeUnixNano is wrong'
      );
      assert.strictEqual(
        span.droppedAttributesCount,
        0,
        'droppedAttributesCount is wrong'
      );
      assert.strictEqual(
        span.droppedEventsCount,
        0,
        'droppedEventsCount is wrong'
      );
      assert.strictEqual(
        span.droppedLinksCount,
        0,
        'droppedLinksCount is wrong'
      );
      assert.deepStrictEqual(
        span.status,
        { code: 0, message: '' },
        'status is' + ' wrong'
      );
    });
    it('should convert span id', () => {
      assert.deepStrictEqual(span.spanId, 'XhByYfZPpT4=', 'spanId is wrong');
    });
    it('should convert parent id', () => {
      assert.deepStrictEqual(
        span.parentSpanId,
        'eKiRUJiGQ4g=',
        'parentIdArr is wrong'
      );
    });
    it('should convert name', () => {
      assert.strictEqual(span.name, 'documentFetch', 'name is wrong');
    });
    it('should convert kind', () => {
      assert.strictEqual(
        span.kind,
        opentelemetryProto.trace.v1.Span.SpanKind.INTERNAL,
        'kind is wrong'
      );
    });
    it('should convert start time', () => {
      assert.strictEqual(
        span.startTimeUnixNano,
        1574120165429803008,
        'startTimeUnixNano is wrong'
      );
    });
    it('should convert end time', () => {
      assert.strictEqual(
        span.endTimeUnixNano,
        1574120165438688000,
        'endTimeUnixNano is wrong'
      );
    });
    it('should convert droppedAttributesCount', () => {
      assert.strictEqual(
        span.droppedAttributesCount,
        0,
        'droppedAttributesCount is wrong'
      );
    });

    it('should convert droppedEventsCount', () => {
      assert.strictEqual(
        span.droppedEventsCount,
        0,
        'droppedEventsCount is wrong'
      );
    });

    it('should convert droppedLinksCount', () => {
      assert.strictEqual(
        span.droppedLinksCount,
        0,
        'droppedLinksCount is wrong'
      );
    });

    it('should convert status', () => {
      assert.deepStrictEqual(
        span.status,
        { code: 0, message: '' },
        'status is' + ' wrong'
      );
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
      assert.deepStrictEqual(resource.toObject(), {
        attributesList: [
          {
            key: 'service',
            type: 0,
            stringValue: 'ui',
            intValue: 0,
            doubleValue: 0,
            boolValue: false,
          },
          {
            key: 'version',
            type: 2,
            stringValue: '',
            intValue: 0,
            doubleValue: 1,
            boolValue: false,
          },
          {
            key: 'success',
            type: 3,
            stringValue: '',
            intValue: 0,
            doubleValue: 0,
            boolValue: true,
          },
        ],
        droppedAttributesCount: 0,
      });
    });
  });
});
