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
import { TraceState } from '../../src/trace/TraceState';

describe('TraceState', () => {
  describe('serialize', () => {
    it('returns serialize string', () => {
      const state = new TraceState('a=1,b=2');
      assert.deepStrictEqual(state.serialize(), 'a=1,b=2');
    });

    it('must replace keys and move them to the front', () => {
      const state = new TraceState('a=1,b=2');
      state.set('b', '3');
      assert.deepStrictEqual(state.serialize(), 'b=3,a=1');
    });

    it('must add new keys to the front', () => {
      const state = new TraceState();
      state.set('vendorname1', 'opaqueValue1');
      assert.deepStrictEqual(state.serialize(), 'vendorname1=opaqueValue1');

      state.set('vendorname2', 'opaqueValue2');
      assert.deepStrictEqual(
        state.serialize(),
        'vendorname2=opaqueValue2,vendorname1=opaqueValue1'
      );
    });

    it('must unset the entries', () => {
      const state = new TraceState('c=4,b=3,a=1');
      state.unset('b');
      assert.deepStrictEqual(state.serialize(), 'c=4,a=1');
      state.unset('c');
      state.unset('A');
      assert.deepStrictEqual(state.serialize(), 'a=1');
    });
  });

  describe('parse', () => {
    it('must successfully parse valid state value', () => {
      const state = new TraceState(
        'vendorname2=opaqueValue2,vendorname1=opaqueValue1'
      );
      assert.deepStrictEqual(state.get('vendorname1'), 'opaqueValue1');
      assert.deepStrictEqual(state.get('vendorname2'), 'opaqueValue2');
      assert.deepStrictEqual(
        state.serialize(),
        'vendorname2=opaqueValue2,vendorname1=opaqueValue1'
      );
    });

    it('must drop states when the items are too long', () => {
      const state = new TraceState('a=' + 'b'.repeat(512));
      assert.deepStrictEqual(state.get('a'), undefined);
      assert.deepStrictEqual(state.serialize(), '');
    });

    it('must drop states which cannot be parsed', () => {
      const state = new TraceState('a=1,b,c=3');
      assert.deepStrictEqual(state.get('a'), '1');
      assert.deepStrictEqual(state.get('b'), undefined);
      assert.deepStrictEqual(state.get('c'), '3');
      assert.deepStrictEqual(state.serialize(), 'a=1,c=3');
    });

    it('must skip states that only have a single value with an equal sign', () => {
      const state = new TraceState('a=1=');
      assert.deepStrictEqual(state.get('a'), undefined);
    });

    it('must successfully parse valid state keys', () => {
      const state = new TraceState('a-b=1,c/d=2,p*q=3,x_y=4');
      assert.deepStrictEqual(state.get('a-b'), '1');
      assert.deepStrictEqual(state.get('c/d'), '2');
      assert.deepStrictEqual(state.get('p*q'), '3');
      assert.deepStrictEqual(state.get('x_y'), '4');
    });

    it('must successfully parse valid state value with spaces in between', () => {
      const state = new TraceState('a=1,foo=bar baz');
      assert.deepStrictEqual(state.get('foo'), 'bar baz');
      assert.deepStrictEqual(state.serialize(), 'a=1,foo=bar baz');
    });
  });
});
