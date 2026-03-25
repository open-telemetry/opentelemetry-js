/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import * as assert from 'assert';
import { TraceState } from '../../../src/trace/TraceState';

describe.only('TraceState', () => {
  describe('.parse()', () => {
    it('must skip parsing if keys are not accessed', () => {
      let tracestate = 'a=1';
      let state = new TraceState(tracestate);
      assert.deepStrictEqual(state.serialize(), tracestate);

      tracestate = 'a=' + 'b'.repeat(512);
      state = new TraceState(tracestate);
      assert.deepStrictEqual(state.serialize(), tracestate);

      tracestate = new Array(33)
        .fill(0)
        .map((_: null, num: number) => `a${num}=${num}`)
        .join(',');
      state = new TraceState(tracestate);
      assert.deepStrictEqual(state.serialize(), tracestate);
    });

    // NOTE: tests below force parsing calling `.get`
    it('must successfully parse valid state value', () => {
      const state = new TraceState(
        'vendorname2=opaqueValue2,ot=th:a,vendorname1=opaqueValue1'
      );
      assert.deepStrictEqual(state.get('th'), 'a');
      assert.deepStrictEqual(
        state.serialize(),
        'vendorname2=opaqueValue2,ot=th:a,vendorname1=opaqueValue1'
      );
    });

    it('must drop states when the items are too long', () => {
      const state = new TraceState('a=' + 'b'.repeat(512));
      assert.deepStrictEqual(state.get('th'), undefined);
      assert.deepStrictEqual(state.serialize(), '');
    });

    it('must drop states which cannot be parsed', () => {
      const state = new TraceState('a=1,b,c=3,ot=th:1');
      assert.deepStrictEqual(state.get('th'), '1');
      assert.deepStrictEqual(state.serialize(), 'a=1,c=3,ot=th:1');
    });

    it('must skip states that only have a single value with an equal sign', () => {
      const state = new TraceState('a=1=');
      assert.deepStrictEqual(state.get('th'), undefined);
      assert.deepStrictEqual(state.serialize(), '');
    });

    it('must successfully parse valid state keys', () => {
      const state = new TraceState('a-b=1,c/d=2,p*q=3,x_y=4');
      assert.deepStrictEqual(state.get('th'), undefined);
      assert.deepStrictEqual(state.serialize(), 'a-b=1,c/d=2,p*q=3,x_y=4');
    });

    it('must successfully parse valid state value with spaces in between', () => {
      const state = new TraceState('a=1,foo=bar baz');
      assert.deepStrictEqual(state.get('th'), undefined);
      assert.deepStrictEqual(state.serialize(), 'a=1,foo=bar baz');
    });

    it('must truncate states with too many items', () => {
      const tracestate = new Array(33)
        .fill(0)
        .map((_: null, num: number) => `a${num}=${num}`);

      const state = new TraceState(tracestate.join(','));
      const expectedTacestate = new Array(32)
        .fill(0)
        .map((_: null, num: number) => `a${num}=${num}`);
      assert.deepStrictEqual(state.get('th'), undefined);
      assert.deepStrictEqual(state.serialize(), expectedTacestate.join(','));
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
      const expectedTacestate = new Array(32)
        .fill(0)
        .map((_: null, num: number) => `a${num}=${num}`);
      assert.deepStrictEqual(state.get('th'), undefined);
      assert.deepStrictEqual(state.serialize(), expectedTacestate.join(','));
    });
  });

  describe('.set()', () => {
    it('must create a new TraceState with a new "ot" vendor key at the front with a new subkey', () => {
      const orgState = new TraceState('a=1,b=2');
      const state = orgState.set('th', '1');
      assert.deepStrictEqual(orgState.serialize(), 'a=1,b=2');
      assert.deepStrictEqual(state.serialize(), 'ot=th:1,a=1,b=2');
    });

    it('must create a new TraceState with an updated "ot" vendor key at the front with new subkey', () => {
      const orgState = new TraceState('a=1,b=2,ot=th:1');
      const state = orgState.set('rv', '6e6d1a75832a2f');
      assert.deepStrictEqual(orgState.serialize(), 'a=1,b=2,ot=th:1');
      assert.deepStrictEqual(
        state.serialize(),
        'ot=rv:6e6d1a75832a2f;th:1,a=1,b=2'
      );
    });

    it('must create a new TraceState with an updated "ot" vendor key at the front with an updated subkey', () => {
      const orgState = new TraceState('a=1,b=2,ot=th:0');
      const state = orgState.set('th', '1');
      assert.deepStrictEqual(orgState.serialize(), 'a=1,b=2,ot=th:0');
      assert.deepStrictEqual(state.serialize(), 'ot=th:1,a=1,b=2');
    });

    it('must create a new TraceState if only with valid vendor keys (max length)', () => {
      const tracestate = 'a=' + 'b'.repeat(512);
      const orgState = new TraceState(tracestate);
      const state = orgState.set('th', '1');
      assert.deepStrictEqual(orgState.serialize(), '');
      assert.deepStrictEqual(state.serialize(), 'ot=th:1');
    });

    it('must return the same TraceState if the "ot" subkey or value are invalid', () => {
      const orgState = new TraceState('a=1,b=2');
      const state = orgState.set('unkonw', '6e6d1a75832a2f');
      assert.strictEqual(orgState, state);
      state.set('th', 'abc=');
      assert.strictEqual(orgState, state);
      assert.deepStrictEqual(orgState.serialize(), 'a=1,b=2');
    });

    it('must return the same TraceState if adding the "ot" subkey exceeds the allowed total length', () => {
      const vendor1 = 'a=' + 'b'.repeat(250);
      const vendor2 = 'c=' + 'd'.repeat(250);
      const tracestate = vendor1 + ',' + vendor2;
      const orgState = new TraceState(tracestate);
      const state = orgState.set('rv', '6e6d1a75832a2f');
      assert.strictEqual(orgState, state);
      assert.deepStrictEqual(orgState.serialize(), tracestate);
    });

    it('must return the same TraceState if adding the "ot" subkey exceeds the allowed value length', () => {
      // Note: it should not happen to have a `th` subkey this long
      const tracestate = 'a=b,ot=th:' + '1'.repeat(250);
      const orgState = new TraceState(tracestate);
      const state = orgState.set('rv', '6e6d1a75832a2f');
      assert.strictEqual(orgState, state);
      assert.deepStrictEqual(orgState.serialize(), tracestate);
    });

    it('must return the same TraceState if already has the max entries and "ot" is not present', () => {
      const tracestate = new Array(32)
        .fill(0)
        .map((_: null, num: number) => `a${num}=${num}`)
        .join(',');
      const orgState = new TraceState(tracestate);
      const state = orgState.set('th', '1');
      assert.strictEqual(orgState, state);
      assert.deepStrictEqual(orgState.serialize(), tracestate);
    });
  });

  describe('.unset()', () => {
    it('must return the same TraceState if trying to unset when there is no "ot" key', () => {
      const orgState = new TraceState('c=4,b=3,a=1');
      const state = orgState.unset('th');
      assert.strictEqual(orgState, state);
      assert.deepStrictEqual(state.serialize(), 'c=4,b=3,a=1');
    });

    it('must create a new TraceState and unset the sub entries when "ot" key exists', () => {
      const orgState = new TraceState('c=4,b=3,ot=th:1;rv:6e6d1a75832a2f,a=1');
      let state = orgState.unset('th');
      assert.deepStrictEqual(
        state.serialize(),
        'ot=rv:6e6d1a75832a2f,c=4,b=3,a=1'
      );
      state = state.unset('rv');
      assert.deepStrictEqual(state.serialize(), 'c=4,b=3,a=1');
      assert.strictEqual(
        orgState.serialize(),
        'c=4,b=3,ot=th:1;rv:6e6d1a75832a2f,a=1'
      );
    });
  });
});
