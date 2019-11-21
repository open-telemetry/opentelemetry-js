/*!
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

import { Attributes, TimedEvent } from '@opentelemetry/types';
import * as assert from 'assert';
import * as transform from '../../src/transform';
import { mockedReadableSpan } from '../helper';

describe('util', () => {
  describe('toCollectorTruncatableString', () => {
    it('should convert string to TruncatableString', () => {
      assert.deepStrictEqual(transform.toCollectorTruncatableString('foo'), {
        truncatedByteCount: 0,
        value: 'foo',
      });
    });

    it('should convert long string to TruncatableString', () => {
      let foo =
        'foo1234567890foo1234567890foo1234567890foo1234567890foo1234567890foo1234567890foo1234567890';
      foo += foo;
      assert.deepStrictEqual(transform.toCollectorTruncatableString(foo), {
        truncatedByteCount: 54,
        value:
          'foo1234567890foo1234567890foo1234567890foo1234567890foo1234567890foo1234567890foo1234567890foo1234567890foo1234567890foo12345678',
      });
    });
  });

  describe('toCollectorAttributes', () => {
    it('should convert attribute string', () => {
      const attributes: Attributes = {
        foo: 'bar',
      };
      assert.deepStrictEqual(transform.toCollectorAttributes(attributes), {
        attributeMap: {
          foo: {
            stringValue: {
              truncatedByteCount: 0,
              value: 'bar',
            },
          },
        },
        droppedAttributesCount: 0,
      });
    });

    it('should convert attribute integer', () => {
      const attributes: Attributes = {
        foo: 13,
      };
      assert.deepStrictEqual(transform.toCollectorAttributes(attributes), {
        attributeMap: {
          foo: {
            intValue: 13,
          },
        },
        droppedAttributesCount: 0,
      });
    });

    it('should convert attribute boolean', () => {
      const attributes: Attributes = {
        foo: true,
      };
      assert.deepStrictEqual(transform.toCollectorAttributes(attributes), {
        attributeMap: {
          foo: {
            boolValue: true,
          },
        },
        droppedAttributesCount: 0,
      });
    });

    it('should convert attribute double', () => {
      const attributes: Attributes = {
        foo: 1.34,
      };
      assert.deepStrictEqual(transform.toCollectorAttributes(attributes), {
        attributeMap: {
          foo: {
            doubleValue: 1.34,
          },
        },
        droppedAttributesCount: 0,
      });
    });

    it('should convert only first attribute', () => {
      const attributes: Attributes = {
        foo: 1,
        bar: 1,
      };
      assert.deepStrictEqual(transform.toCollectorAttributes(attributes, 1), {
        attributeMap: {
          foo: {
            intValue: 1,
          },
        },
        droppedAttributesCount: 1,
      });
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
      assert.deepStrictEqual(transform.toCollectorEvents(events), {
        timeEvent: [
          {
            time: '1970-01-01T00:02:03.000000123Z',
            annotation: {
              description: { value: 'foo', truncatedByteCount: 0 },
              attributes: {
                droppedAttributesCount: 0,
                attributeMap: {
                  a: { stringValue: { value: 'b', truncatedByteCount: 0 } },
                },
              },
            },
          },
          {
            time: '1970-01-01T00:05:21.000000321Z',
            annotation: {
              description: { value: 'foo2', truncatedByteCount: 0 },
              attributes: {
                droppedAttributesCount: 0,
                attributeMap: {
                  c: { stringValue: { value: 'd', truncatedByteCount: 0 } },
                },
              },
            },
          },
        ],
        droppedAnnotationsCount: 0,
        droppedMessageEventsCount: 0,
      });
    });
  });

  describe('toCollectorSpan', () => {
    it('should convert span', () => {
      assert.deepStrictEqual(transform.toCollectorSpan(mockedReadableSpan), {
        traceId: 'HxAI3I4nDoXECg18OTmyeA==',
        spanId: 'XhByYfZPpT4=',
        parentSpanId: 'eKiRUJiGQ4g=',
        tracestate: {},
        name: { value: 'documentFetch', truncatedByteCount: 0 },
        kind: 0,
        startTime: '2019-11-18T23:36:05.429803070Z',
        endTime: '2019-11-18T23:36:05.438688070Z',
        attributes: {
          droppedAttributesCount: 0,
          attributeMap: {
            component: {
              stringValue: { value: 'document-load', truncatedByteCount: 0 },
            },
          },
        },
        timeEvents: {
          timeEvent: [
            {
              time: '2019-11-18T23:36:05.429803070Z',
              annotation: {
                description: { value: 'fetchStart', truncatedByteCount: 0 },
              },
            },
            {
              time: '2019-11-18T23:36:05.429803070Z',
              annotation: {
                description: {
                  value: 'domainLookupStart',
                  truncatedByteCount: 0,
                },
              },
            },
            {
              time: '2019-11-18T23:36:05.429803070Z',
              annotation: {
                description: {
                  value: 'domainLookupEnd',
                  truncatedByteCount: 0,
                },
              },
            },
            {
              time: '2019-11-18T23:36:05.429803070Z',
              annotation: {
                description: { value: 'connectStart', truncatedByteCount: 0 },
              },
            },
            {
              time: '2019-11-18T23:36:05.429803070Z',
              annotation: {
                description: { value: 'connectEnd', truncatedByteCount: 0 },
              },
            },
            {
              time: '2019-11-18T23:36:05.435513070Z',
              annotation: {
                description: { value: 'requestStart', truncatedByteCount: 0 },
              },
            },
            {
              time: '2019-11-18T23:36:05.436923070Z',
              annotation: {
                description: { value: 'responseStart', truncatedByteCount: 0 },
              },
            },
            {
              time: '2019-11-18T23:36:05.438688070Z',
              annotation: {
                description: { value: 'responseEnd', truncatedByteCount: 0 },
              },
            },
          ],
          droppedAnnotationsCount: 0,
          droppedMessageEventsCount: 0,
        },
        status: { code: 0 },
        sameProcessAsParentSpan: true,
      });
    });
  });
});
