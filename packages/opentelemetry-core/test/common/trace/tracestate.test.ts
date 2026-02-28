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
  });

  describe('.parse()', () => {
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

    it('must truncate states with too many items', () => {
      const state = new TraceState(
        new Array(33)
          .fill(0)
          .map((_: null, num: number) => `a${num}=${num}`)
          .join(',')
      );
      assert.deepStrictEqual(state['_internalState'].size, 32);
      assert.deepStrictEqual(state.get('a0'), '0');
      assert.deepStrictEqual(state.get('a31'), '31');
      assert.deepStrictEqual(
        state.get('a32'),
        undefined,
        'should truncate from the tail'
      );
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

      assert.deepStrictEqual(state['_internalState'].size, 32);
      assert.deepStrictEqual(state.get('a0'), '0');
      assert.deepStrictEqual(state.get('a31'), '31');
      assert.deepStrictEqual(state.get('invalid.middle.key.a'), undefined);
      assert.deepStrictEqual(state.get('invalid.middle.key.b'), undefined);
      assert.deepStrictEqual(state.get('invalid.middle.key.c'), undefined);
    });
  });
});
