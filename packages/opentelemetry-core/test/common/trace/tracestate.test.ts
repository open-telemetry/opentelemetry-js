/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import * as assert from 'assert';
import { TraceState } from '../../../src/trace/TraceState';

describe('TraceState', () => {
  describe('.serialize()', () => {
    it('returns serialize string', () => {
      const state = new TraceState('a=1,b=2');
      assert.deepStrictEqual(state.serialize(), 'a=1,b=2');
    });

    it('must create a new TraceState and move updated keys to the front', () => {
      const orgState = new TraceState('a=1,b=2');
      const state = orgState.set('b', '3');
      assert.deepStrictEqual(orgState.serialize(), 'a=1,b=2');
      assert.deepStrictEqual(state.serialize(), 'b=3,a=1');
    });

    it('must create a new TraceState and add new keys to the front', () => {
      let state = new TraceState().set('vendorname1', 'opaqueValue1');
      assert.deepStrictEqual(state.serialize(), 'vendorname1=opaqueValue1');

      state = state.set('vendorname2', 'opaqueValue2');
      assert.deepStrictEqual(
        state.serialize(),
        'vendorname2=opaqueValue2,vendorname1=opaqueValue1'
      );
    });

    it('must create a new TraceState and unset the entries', () => {
      const orgState = new TraceState('c=4,b=3,a=1');
      let state = orgState.unset('b');
      assert.deepStrictEqual(state.serialize(), 'c=4,a=1');
      state = state.unset('c').unset('A');
      assert.deepStrictEqual(state.serialize(), 'a=1');
      assert.strictEqual(orgState.serialize(), 'c=4,b=3,a=1');
    });

    it('must not create a new TraceState and keep the keys and values', () => {
      const orgState = new TraceState('a=1,b=2');
      const state = orgState.set('b', '3'.repeat(257));
      assert.strictEqual(orgState, state);
      assert.deepStrictEqual(orgState.serialize(), 'a=1,b=2');
    });
  });

  describe('.parse()', () => {
    it('must skip parsing if keys are not accessed', () => {
      // valid
      let tracestate = 'a=1';
      let state = new TraceState(tracestate);
      assert.deepStrictEqual(state.serialize(), tracestate);

      // invalid: value exceeds 256 chars
      tracestate = 'a=' + 'b'.repeat(512);
      state = new TraceState(tracestate);
      assert.deepStrictEqual(state.serialize(), tracestate);

      // invalid: too many entries
      tracestate = new Array(33)
        .fill(0)
        .map((_: null, num: number) => `a${num}=${num}`)
        .join(',');
      state = new TraceState(tracestate);
      assert.deepStrictEqual(state.serialize(), tracestate);
    });

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

    it('must skip list-members when the value is too long', () => {
      const state = new TraceState('a=' + 'b'.repeat(512) + ',c=d');
      assert.deepStrictEqual(state.get('a'), undefined);
      assert.deepStrictEqual(state.get('c'), 'd');
      assert.deepStrictEqual(state.serialize(), 'c=d');
    });

    it('must skip list-members that cannot be parsed', () => {
      const state = new TraceState('a=1,b,c=3');
      assert.deepStrictEqual(state.get('a'), '1');
      assert.deepStrictEqual(state.get('b'), undefined);
      assert.deepStrictEqual(state.get('c'), '3');
      assert.deepStrictEqual(state.serialize(), 'a=1,c=3');
    });

    it('must skip list-members that only have a single value with an equal sign', () => {
      const state = new TraceState('a=1=,b=2');
      assert.deepStrictEqual(state.get('a'), undefined);
      assert.deepStrictEqual(state.get('b'), '2');
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

    it('must truncate states with too many items', () => {
      const tracestate = new Array(33)
        .fill(0)
        .map((_: null, num: number) => `a${num}=${num}`);
      const state = new TraceState(tracestate.join(','));

      tracestate.forEach((member, index) => {
        const [key, value] = member.split('=');
        if (index < 32) {
          assert.deepStrictEqual(state.get(key), value);
        } else {
          assert.deepStrictEqual(
            state.get(key),
            undefined,
            'should truncate from the tail'
          );
        }
      });
    });

    it('should not count invalid items towards max limit', () => {
      const tracestate = new Array(32)
        .fill(0)
        .map((_: null, num: number) => `a${num}=${num}`)
        .concat('invalid.suffix.key=1'); // add invalid key to beginning
      tracestate.unshift('invalid.prefix.key=1');
      tracestate.splice(15, 0, 'invalid.middle.key.a=1');
      tracestate.splice(15, 0, 'invalid.middle.key.b=2');
      tracestate.splice(15, 0, 'invalid.middle.key.c=3');

      const state = new TraceState(tracestate.join(','));

      assert.deepStrictEqual(state.get('invalid.prefix.key'), undefined);
      assert.deepStrictEqual(state.get('invalid.middle.key.a'), undefined);
      assert.deepStrictEqual(state.get('invalid.middle.key.b'), undefined);
      assert.deepStrictEqual(state.get('invalid.middle.key.c'), undefined);
      for (let i = 0; i < 32; i++) {
        assert.deepStrictEqual(state.get(`a${i}`), `${i}`);
      }
    });
  });
});
