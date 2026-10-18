/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import * as assert from 'assert';
import { createTraceState } from '../../../src/trace/internal/utils';

describe('TraceState', function () {
  describe('.serialize()', function () {
    it('returns serialize string', function () {
      const state = createTraceState('a=1,b=2');
      assert.deepStrictEqual(state.serialize(), 'a=1,b=2');
    });

    it('must create a createTraceState and move updated keys to the front', function () {
      const orgState = createTraceState('a=1,b=2');
      const state = orgState.set('b', '3');
      assert.deepStrictEqual(orgState.serialize(), 'a=1,b=2');
      assert.deepStrictEqual(state.serialize(), 'b=3,a=1');
    });

    it('must create a createTraceState and add new keys to the front', function () {
      let state = createTraceState().set('vendorname1', 'opaqueValue1');
      assert.deepStrictEqual(state.serialize(), 'vendorname1=opaqueValue1');

      state = state.set('vendorname2', 'opaqueValue2');
      assert.deepStrictEqual(
        state.serialize(),
        'vendorname2=opaqueValue2,vendorname1=opaqueValue1'
      );
    });

    it('must create a createTraceState and unset the entries', function () {
      const orgState = createTraceState('c=4,b=3,a=1');
      let state = orgState.unset('b');
      assert.deepStrictEqual(state.serialize(), 'c=4,a=1');
      state = state.unset('c').unset('A');
      assert.deepStrictEqual(state.serialize(), 'a=1');
      assert.strictEqual(orgState.serialize(), 'c=4,b=3,a=1');
    });

    it('must not create a new createTraceState when the entry does not exist', function () {
      const orgState = createTraceState('c=4,b=3,a=1');
      const state = orgState.unset('d');
      assert.strictEqual(orgState, state);
      assert.deepStrictEqual(orgState.serialize(), 'c=4,b=3,a=1');
    });

    describe('when adding a new list member', function () {
      it('must not create a new createTraceState if the value is to long', function () {
        const orgState = createTraceState('a=1,b=2');
        const state = orgState.set('c', '3'.repeat(257));
        assert.strictEqual(orgState, state);
        assert.deepStrictEqual(orgState.serialize(), 'a=1,b=2');
      });

      it('must not create a new createTraceState if makes exceed the total limit', function () {
        const tracestate = 'a=' + '1'.repeat(200) + ',b=' + '2'.repeat(200);
        const orgState = createTraceState(tracestate);
        const state = orgState.set('c', '3'.repeat(200)); // this makes it exceed 512
        assert.strictEqual(orgState, state);
        assert.deepStrictEqual(orgState.serialize(), tracestate);
      });
    });

    describe('when updating a list member', function () {
      it('must not create a new createTraceState if the value is to long', function () {
        const orgState = createTraceState('a=1,b=2');
        const state = orgState.set('b', '3'.repeat(257));
        assert.strictEqual(orgState, state);
        assert.deepStrictEqual(orgState.serialize(), 'a=1,b=2');
      });

      it('must not create a new createTraceState if makes exceed the total limit', function () {
        const tracestate = 'a=' + '1'.repeat(200) + ',b=' + '2'.repeat(200);
        const orgState = createTraceState(tracestate);
        const state = orgState.set('c', '3'.repeat(200)); // this makes it exceed 512
        assert.strictEqual(orgState, state);
        assert.deepStrictEqual(orgState.serialize(), tracestate);
      });
    });
  });

  describe('.set()', function () {
    // 32 list-members, well below the 512 character limit
    const fullState = new Array(32)
      .fill(0)
      .map((_: null, num: number) => `a${num}=${num}`)
      .join(',');
    // 508 characters, just below the 512 character limit
    const longState = 'a=' + '1'.repeat(252) + ',b=' + '2'.repeat(251);

    it('must not add a new list member once the list holds the max number of items', function () {
      const orgState = createTraceState(fullState);
      const state = orgState.set('b', '1'); // this would make it 33 items
      assert.strictEqual(state, orgState);
      assert.deepStrictEqual(orgState.serialize(), fullState);
    });

    it('must still update an existing list member once the list is full', function () {
      const orgState = createTraceState(fullState);
      const state = orgState.set('a31', '99') as TraceStateImpl;
      assert.deepStrictEqual(state['_keys']().length, 32);
      assert.deepStrictEqual(state.get('a31'), '99');
      assert.ok(state.serialize().startsWith('a31=99,'));
    });

    it('must not add a new list member if it makes exceed the total limit', function () {
      const orgState = createTraceState(longState);
      const state = orgState.set('c', 'xy'); // 508 + 5 exceeds 512
      assert.strictEqual(state, orgState);
      assert.deepStrictEqual(orgState.serialize(), longState);
    });

    it('must add a new list member that fits exactly within the total limit', function () {
      const state = createTraceState(longState).set('c', 'x'); // 508 + 4 is exactly 512
      assert.deepStrictEqual(state.serialize().length, 512);
      assert.deepStrictEqual(state.get('c'), 'x');
    });

    it('must not update a list member if the longer value makes exceed the total limit', function () {
      const orgState = createTraceState(longState);
      const state = orgState.set('b', '2'.repeat(256)); // 508 + 5 exceeds 512
      assert.strictEqual(state, orgState);
      assert.deepStrictEqual(orgState.serialize(), longState);
    });
  });

  describe('.parse()', function () {
    it('must remove invalid entries when serializing', function () {
      // valid
      let tracestate = 'a=1';
      let state = createTraceState(tracestate);
      assert.deepStrictEqual(state.serialize(), tracestate);

      // invalid: value exceeds 256 chars
      tracestate = 'a=' + 'b'.repeat(512);
      state = createTraceState(tracestate);
      assert.deepStrictEqual(state.serialize(), '');

      // invalid: too many entries
      tracestate = new Array(32)
        .fill(0)
        .map((_: null, num: number) => `a${num}=${num}`)
        .join(',');
      state = createTraceState(tracestate + ',a32=32');
      assert.deepStrictEqual(state.serialize(), tracestate);
    });

    it('must successfully parse valid state value', function () {
      const state = createTraceState(
        'vendorname2=opaqueValue2,vendorname1=opaqueValue1'
      );
      assert.deepStrictEqual(state.get('vendorname1'), 'opaqueValue1');
      assert.deepStrictEqual(state.get('vendorname2'), 'opaqueValue2');
      assert.deepStrictEqual(
        state.serialize(),
        'vendorname2=opaqueValue2,vendorname1=opaqueValue1'
      );
    });

    it('must drop states when the items are too long', function () {
      const state = createTraceState('a=' + 'b'.repeat(512));
      assert.deepStrictEqual(state.get('a'), undefined);
      assert.deepStrictEqual(state.serialize(), '');
    });

    it('must skip list-members when the value is too long, but keep the remaining ones', function () {
      const state = createTraceState('a=' + 'b'.repeat(512) + ',c=d');
      assert.deepStrictEqual(state.get('a'), undefined);
      assert.deepStrictEqual(state.get('c'), 'd');
      assert.deepStrictEqual(state.serialize(), 'c=d');
    });

    it('must skip list-members that cannot be parsed', function () {
      const state = createTraceState('a=1,b,c=3');
      assert.deepStrictEqual(state.get('a'), '1');
      assert.deepStrictEqual(state.get('b'), undefined);
      assert.deepStrictEqual(state.get('c'), '3');
      assert.deepStrictEqual(state.serialize(), 'a=1,c=3');
    });

    it('must skip list-members that only have a single value with an equal sign', function () {
      const state = createTraceState('a=1=,b=2');
      assert.deepStrictEqual(state.get('a'), undefined);
      assert.deepStrictEqual(state.get('b'), '2');
    });

    it('must successfully parse valid state keys', function () {
      const state = createTraceState('a-b=1,c/d=2,p*q=3,x_y=4');
      assert.deepStrictEqual(state.get('a-b'), '1');
      assert.deepStrictEqual(state.get('c/d'), '2');
      assert.deepStrictEqual(state.get('p*q'), '3');
      assert.deepStrictEqual(state.get('x_y'), '4');
    });

    it('must successfully parse valid state value with spaces in between', function () {
      const state = createTraceState('a=1,foo=bar baz');
      assert.deepStrictEqual(state.get('foo'), 'bar baz');
      assert.deepStrictEqual(state.serialize(), 'a=1,foo=bar baz');
    });

    it('must truncate states with too many items', function () {
      const tracestate = new Array(33)
        .fill(0)
        .map((_: null, num: number) => `a${num}=${num}`);
      const state = createTraceState(tracestate.join(','));

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

    it('should not count invalid items towards max limit', function () {
      const tracestate = new Array(32)
        .fill(0)
        .map((_: null, num: number) => `a${num}=${num}`)
        .concat('invalid.suffix.key=1'); // add invalid key to beginning
      tracestate.unshift('invalid.prefix.key=1');
      tracestate.splice(15, 0, 'invalid.middle.key.a=1');
      tracestate.splice(15, 0, 'invalid.middle.key.b=2');
      tracestate.splice(15, 0, 'invalid.middle.key.c=3');

      const state = createTraceState(tracestate.join(','));

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
