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
  mapMessageEvent,
  mapSpanContext,
  mapSpanKind,
  reverseMapSpanContext,
} from '../src/transform';

import * as oc from '@opencensus/core';
import { SpanKind } from '@opentelemetry/api';
import { TraceState } from '@opentelemetry/core';
import * as assert from 'assert';

describe('transform', () => {
  describe('mapSpanKind', () => {
    it('should return undefined with undefined input', () => {
      assert.strictEqual(mapSpanKind(undefined), undefined);
    });
    it('should return undefined for unknown span kind', () => {
      assert.strictEqual(mapSpanKind(3 as oc.SpanKind), undefined);
    });
    it('should map known OC SpanKinds', () => {
      assert.strictEqual(
        mapSpanKind(oc.SpanKind.UNSPECIFIED),
        SpanKind.INTERNAL
      );
      assert.strictEqual(mapSpanKind(oc.SpanKind.CLIENT), SpanKind.CLIENT);
      assert.strictEqual(mapSpanKind(oc.SpanKind.SERVER), SpanKind.SERVER);
    });
  });

  describe('mapSpanContext', () => {
    it('should map everything', () => {
      const sc = mapSpanContext({
        traceId: '4321',
        spanId: '1234',
        options: 1,
        traceState: 'hello=world',
      });
      assert.deepStrictEqual(sc, {
        traceId: '4321',
        spanId: '1234',
        traceFlags: 1,
        traceState: new TraceState('hello=world'),
      });
    });
    it('should default trace flags to 0', () => {
      const sc = mapSpanContext({ traceId: '4321', spanId: '1234' });
      assert.strictEqual(sc.traceFlags, 0);
    });
    it("should not include trace state if it wasn't passed in", () => {
      const sc = mapSpanContext({
        traceId: '4321',
        spanId: '1234',
      });
      assert.strictEqual(sc.traceState, undefined);
    });
  });

  describe('reverseMapSpanContext', () => {
    it('should map everything', () => {
      const sc = reverseMapSpanContext({
        traceId: '4321',
        spanId: '1234',
        traceFlags: 1,
        traceState: new TraceState('hello=world'),
      });
      assert.deepStrictEqual(sc, {
        traceId: '4321',
        spanId: '1234',
        options: 1,
        traceState: 'hello=world',
      });
    });
    it("should not include trace state if it wasn't passed in", () => {
      const sc = reverseMapSpanContext({
        traceId: '4321',
        spanId: '1234',
        traceFlags: 0,
      });
      assert.strictEqual(sc.traceState, undefined);
    });
  });

  describe('mapMessageEvent', () => {
    const messageEventType = oc.MessageEventType.RECEIVED;
    const id = 123;
    const timestamp = 321;
    const uncompressedSize = 12;
    const compressedSize = 15;

    it('should map message event', () => {
      assert.deepStrictEqual(
        mapMessageEvent(
          messageEventType,
          id,
          timestamp,
          uncompressedSize,
          compressedSize
        ),
        [
          // event name
          '123',
          // attributes
          {
            'message.event.size.compressed': 15,
            'message.event.size.uncompressed': 12,
            'message.event.type': 'RECEIVED',
          },
          // timestamp
          321,
        ]
      );
    });
    it('should omit size attributes if they are not provided', () => {
      assert.deepStrictEqual(mapMessageEvent(messageEventType, id, timestamp), [
        // event name
        '123',
        // attributes
        {
          'message.event.type': 'RECEIVED',
        },
        // timestamp
        321,
      ]);
    });
  });
});
