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
import { TraceState, parse, serialize } from '../src/trace/TraceState';

describe('TraceState', () => {
  describe('serialize', () => {
    it('returns serialize string', () => {
      const state = new TraceState({ a: '1', b: '2' });
      assert.deepStrictEqual(state.keys(), ['a', 'b']);
      assert.deepStrictEqual(serialize(state), 'a=1,b=2');
    });

    it('must add new keys', () => {
      const state = new TraceState({ a: '1', b: '2' });
      assert.deepStrictEqual(state.keys(), ['a', 'b']);

      state.set('c', '3');
      assert.deepStrictEqual(state.keys(), ['c', 'a', 'b']);
      assert.deepStrictEqual(serialize(state), 'c=3,a=1,b=2');
    });

    it('must replace keys and move them to the front', () => {
      const state = new TraceState({ a: '1', b: '2' });
      state.set('b', '3');
      assert.deepStrictEqual(state.keys(), ['b', 'a']);
      assert.deepStrictEqual(serialize(state), 'b=3,a=1');
    });

    it('must add new keys to the front', () => {
      const state = new TraceState();
      state.set('vendorname1', 'opaqueValue1');
      assert.deepStrictEqual(serialize(state), 'vendorname1=opaqueValue1');

      state.set('vendorname2', 'opaqueValue2');
      assert.deepStrictEqual(
        serialize(state),
        'vendorname2=opaqueValue2,vendorname1=opaqueValue1'
      );
    });
  });

  describe('parse', () => {
    it('must successfully parse valid state value', () => {
      const state = parse('vendorname2=opaqueValue2,vendorname1=opaqueValue1');
      assert.ok(state);
      if (state != null) {
        assert.deepStrictEqual(state!.get('vendorname1'), 'opaqueValue1');
        assert.deepStrictEqual(state!.get('vendorname2'), 'opaqueValue2');
        assert.deepStrictEqual(
          serialize(state),
          'vendorname2=opaqueValue2,vendorname1=opaqueValue1'
        );
      }
    });

    it('should handle null string', () => {
      const state = parse(null);
      assert.deepStrictEqual(state, null);
    });

    it('must fail when the items are too long', () => {
      const state = parse('a=' + 'b'.repeat(512));
      assert.deepStrictEqual(state, null);
    });

    it('must drop states which cannot be parsed', () => {
      const state = parse('a=1,b,c=3');
      assert.ok(state);
      if (state != null) {
        assert.deepStrictEqual(state.get('a'), '1');
        assert.deepStrictEqual(state.get('b'), undefined);
        assert.deepStrictEqual(state.get('c'), '3');
        assert.deepStrictEqual(serialize(state), 'a=1,c=3');
      }
    });

    it('must parse states that only have a single value with an equal sign', () => {
      const state = parse('a=1=');
      assert.ok(state);
      if (state != null) {
        assert.deepStrictEqual(state.get('a'), '1=');
      }
    });
  });
});
