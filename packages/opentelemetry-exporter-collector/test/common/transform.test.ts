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
import * as transform from '../../src/transform';
import {
  ensureSpanIsCorrect,
  mockedReadableSpan,
  mockedResources,
  mockedInstrumentationLibraries,
  multiResourceTrace,
  multiInstrumentationLibraryTrace,
} from '../helper';
import { Resource } from '@opentelemetry/resources';

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

  describe('groupSpansByResourceAndLibrary', () => {
    it('should group by resource', () => {
      const [resource1, resource2] = mockedResources;
      const [instrumentationLibrary] = mockedInstrumentationLibraries;
      const [span1, span2, span3] = multiResourceTrace;

      const expected = new Map([
        [resource1, new Map([[instrumentationLibrary, [span1]]])],
        [resource2, new Map([[instrumentationLibrary, [span2, span3]]])],
      ]);

      const result = transform.groupSpansByResourceAndLibrary(
        multiResourceTrace
      );

      assert.deepStrictEqual(result, expected);
    });

    it('should group by instrumentation library', () => {
      const [resource] = mockedResources;
      const [lib1, lib2] = mockedInstrumentationLibraries;
      const [span1, span2, span3] = multiInstrumentationLibraryTrace;

      const expected = new Map([
        [
          resource,
          new Map([
            [lib1, [span1, span2]],
            [lib2, [span3]],
          ]),
        ],
      ]);

      const result = transform.groupSpansByResourceAndLibrary(
        multiInstrumentationLibraryTrace
      );

      assert.deepStrictEqual(result, expected);
    });
  });
});
