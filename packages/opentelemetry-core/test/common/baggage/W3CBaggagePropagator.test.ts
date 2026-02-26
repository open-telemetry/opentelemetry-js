/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  Baggage,
  BaggageEntry,
  defaultTextMapGetter,
  defaultTextMapSetter,
  propagation,
  baggageEntryMetadataFromString,
} from '@opentelemetry/api';
import { ROOT_CONTEXT } from '@opentelemetry/api';
import * as assert from 'assert';
import { W3CBaggagePropagator } from '../../../src/baggage/propagation/W3CBaggagePropagator';
import { BAGGAGE_HEADER } from '../../../src/baggage/constants';

describe('W3CBaggagePropagator', () => {
  const httpBaggagePropagator = new W3CBaggagePropagator();

  let carrier: { [key: string]: unknown };

  beforeEach(() => {
    carrier = {};
  });

  describe('.inject()', () => {
    it('should set baggage header', () => {
      const baggage = propagation.createBaggage({
        key1: { value: 'd4cda95b652f4a1592b449d5929fda1b' },
        'with/slash': { value: 'with spaces' },
        key3: { value: 'c88815a7-0fa9-4d95-a1f1-cdccce3c5c2a' },
        key4: {
          value: 'foo',
          metadata: baggageEntryMetadataFromString(
            'key4prop1=value1;key4prop2=value2;key4prop3WithNoValue'
          ),
        },
      });

      httpBaggagePropagator.inject(
        propagation.setBaggage(ROOT_CONTEXT, baggage),
        carrier,
        defaultTextMapSetter
      );
      assert.deepStrictEqual(
        carrier[BAGGAGE_HEADER],
        'key1=d4cda95b652f4a1592b449d5929fda1b,with%2Fslash=with%20spaces,key3=c88815a7-0fa9-4d95-a1f1-cdccce3c5c2a,key4=foo;key4prop1=value1;key4prop2=value2;key4prop3WithNoValue'
      );
    });

    it('should skip long key-value pairs', () => {
      const baggage = propagation.createBaggage({
        key1: { value: 'd4cda95b' },
        key3: { value: 'c88815a7' },
      });

      httpBaggagePropagator.inject(
        propagation.setBaggage(ROOT_CONTEXT, baggage),
        carrier,
        defaultTextMapSetter
      );
      assert.deepStrictEqual(
        carrier[BAGGAGE_HEADER],
        'key1=d4cda95b,key3=c88815a7'
      );
    });

    it('should skip all entries whose length exceeds the W3C standard limit of 4096 bytes', () => {
      const longKey = Array(96).fill('k').join('');
      const shortKey = Array(95).fill('k').join('');
      const value = Array(4000).fill('v').join('');

      let baggage = propagation.createBaggage({
        aa: { value: 'shortvalue' },
        [shortKey]: { value: value },
      });

      httpBaggagePropagator.inject(
        propagation.setBaggage(ROOT_CONTEXT, baggage),
        carrier,
        defaultTextMapSetter
      );

      let header = carrier[BAGGAGE_HEADER];
      assert.ok(typeof header === 'string');
      assert.deepStrictEqual(header, `aa=shortvalue,${shortKey}=${value}`);

      baggage = propagation.createBaggage({
        aa: { value: 'shortvalue' },
        [longKey]: { value: value },
      });

      carrier = {};
      httpBaggagePropagator.inject(
        propagation.setBaggage(ROOT_CONTEXT, baggage),
        carrier,
        defaultTextMapSetter
      );

      header = carrier[BAGGAGE_HEADER];
      assert.ok(typeof header === 'string');
      assert.deepStrictEqual(header, 'aa=shortvalue');
    });

    it('should not exceed the W3C standard header length limit of 8192 bytes', () => {
      const longKey0 = Array(48).fill('0').join('');
      const longKey1 = Array(49).fill('1').join('');
      const longValue = Array(4000).fill('v').join('');

      let baggage = propagation.createBaggage({
        [longKey0]: { value: longValue },
        [longKey1]: { value: longValue },
        aa: { value: Array(88).fill('v').join('') },
      });

      httpBaggagePropagator.inject(
        propagation.setBaggage(ROOT_CONTEXT, baggage),
        carrier,
        defaultTextMapSetter
      );

      let header = carrier[BAGGAGE_HEADER];
      assert.ok(typeof header === 'string');
      assert.deepStrictEqual(header.length, 8192);
      assert.deepStrictEqual(header.split(',').length, 3);

      baggage = propagation.createBaggage({
        [longKey0]: { value: longValue },
        [longKey1]: { value: longValue },
        aa: { value: Array(89).fill('v').join('') },
      });

      carrier = {};
      httpBaggagePropagator.inject(
        propagation.setBaggage(ROOT_CONTEXT, baggage),
        carrier,
        defaultTextMapSetter
      );

      header = carrier[BAGGAGE_HEADER];
      assert.ok(typeof header === 'string');
      assert.deepStrictEqual(header.length, 8100);
      assert.deepStrictEqual(header.split(',').length, 2);
    });

    it('should not exceed the W3C standard header entry limit of 180 entries', () => {
      const entries: Record<string, BaggageEntry> = {};

      Array(200)
        .fill(0)
        .forEach((_, i) => {
          entries[`${i}`] = { value: 'v' };
        });

      const baggage = propagation.createBaggage(entries);

      httpBaggagePropagator.inject(
        propagation.setBaggage(ROOT_CONTEXT, baggage),
        carrier,
        defaultTextMapSetter
      );

      const header = carrier[BAGGAGE_HEADER];
      assert.ok(typeof header === 'string');
      assert.strictEqual(header.split(',').length, 180);
    });
  });

  describe('.extract()', () => {
    const baggageValue =
      'key1=d4cda95b==,key3=c88815a7, keyn   = valn, keym =valm';
    const expected = propagation.createBaggage({
      key1: { value: 'd4cda95b==' },
      key3: { value: 'c88815a7' },
      keyn: { value: 'valn' },
      keym: { value: 'valm' },
    });

    it('should extract context of a sampled span from carrier', () => {
      carrier[BAGGAGE_HEADER] = baggageValue;
      const extractedBaggage = propagation.getBaggage(
        httpBaggagePropagator.extract(
          ROOT_CONTEXT,
          carrier,
          defaultTextMapGetter
        )
      );

      assert.deepStrictEqual(extractedBaggage, expected);
    });

    it('should extract context of a sampled span when the headerValue comes as array', () => {
      carrier[BAGGAGE_HEADER] = [baggageValue];
      const extractedBaggage = propagation.getBaggage(
        httpBaggagePropagator.extract(
          ROOT_CONTEXT,
          carrier,
          defaultTextMapGetter
        )
      );

      assert.deepStrictEqual(extractedBaggage, expected);
    });

    it('should extract context of a sampled span when the headerValue comes as array with multiple items', () => {
      carrier[BAGGAGE_HEADER] = [
        'key1=d4cda95b==,key3=c88815a7, keyn   = valn',
        'keym =valm',
      ];
      const extractedBaggage = propagation.getBaggage(
        httpBaggagePropagator.extract(
          ROOT_CONTEXT,
          carrier,
          defaultTextMapGetter
        )
      );

      assert.deepStrictEqual(extractedBaggage, expected);
    });
  });

  describe('fields()', () => {
    it('returns the fields used by the baggage spec', () => {
      const propagator = new W3CBaggagePropagator();
      assert.deepStrictEqual(propagator.fields(), [BAGGAGE_HEADER]);
    });
  });

  it('returns undefined if header is missing', () => {
    assert.deepStrictEqual(
      propagation.getBaggage(
        httpBaggagePropagator.extract(
          ROOT_CONTEXT,
          carrier,
          defaultTextMapGetter
        )
      ),
      undefined
    );
  });

  it('returns keys with their properties', () => {
    carrier[BAGGAGE_HEADER] = 'key1=d4cda95b,key3=c88815a7;prop1=value1';
    const bag = propagation.getBaggage(
      httpBaggagePropagator.extract(ROOT_CONTEXT, carrier, defaultTextMapGetter)
    );

    assert.ok(bag);
    const entries = bag.getAllEntries();

    assert.strictEqual(entries.length, 2);
    assert.deepStrictEqual(bag.getEntry('key1')!.value, 'd4cda95b');
    assert.deepStrictEqual(bag.getEntry('key3')!.value, 'c88815a7');
    assert.deepStrictEqual(
      bag.getEntry('key3')!.metadata?.toString(),
      'prop1=value1'
    );
  });

  it('should gracefully handle an invalid header', () => {
    const testCases: Record<
      string,
      {
        header: string;
        baggage: Baggage | undefined;
      }
    > = {
      invalidNoKeyValuePair: {
        header: '289371298nekjh2939299283jbk2b',
        baggage: undefined,
      },
      invalidWrongKeyValueFormat: {
        header: 'key1:value;key2=value2',
        baggage: undefined,
      },
      invalidDoubleSemicolon: {
        header: 'key1:value;;key2=value2',
        baggage: undefined,
      },
      mixInvalidAndValidKeys: {
        header: 'key1:value,key2=value2',
        baggage: propagation.createBaggage({
          key2: {
            value: 'value2',
          },
        }),
      },
    };
    Object.getOwnPropertyNames(testCases).forEach(testCase => {
      carrier[BAGGAGE_HEADER] = testCases[testCase].header;

      const extractedSpanContext = propagation.getBaggage(
        httpBaggagePropagator.extract(
          ROOT_CONTEXT,
          carrier,
          defaultTextMapGetter
        )
      );
      assert.deepStrictEqual(
        extractedSpanContext,
        testCases[testCase].baggage,
        testCase
      );
    });
  });
});
