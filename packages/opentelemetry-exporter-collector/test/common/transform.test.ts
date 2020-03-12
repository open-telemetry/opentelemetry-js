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

import { Attributes, TimedEvent } from '@opentelemetry/api';
import * as assert from 'assert';
import * as transform from '../../src/transform';
import { ensureSpanIsCorrect, mockedReadableSpan } from '../helper';
import { Resource } from '@opentelemetry/resources';

describe('transform', () => {
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
            doubleValue: 13,
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
        labels: {
          service: 'ui',
          version: '1',
          success: 'true',
        },
      });
    });
  });
});
