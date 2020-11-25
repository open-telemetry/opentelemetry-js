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
  defaultTextMapGetter,
  defaultTextMapSetter,
  CorrelationContext,
} from '@opentelemetry/api';
import { ROOT_CONTEXT } from '@opentelemetry/context-base';
import * as assert from 'assert';
import {
  getCorrelationContext,
  setCorrelationContext,
} from '../../src/correlation-context/correlation-context';
import {
  HttpCorrelationContext,
  CORRELATION_CONTEXT_HEADER,
  MAX_PER_NAME_VALUE_PAIRS,
} from '../../src/correlation-context/propagation/HttpCorrelationContext';

describe('HttpCorrelationContext', () => {
  const httpTraceContext = new HttpCorrelationContext();

  let carrier: { [key: string]: unknown };

  beforeEach(() => {
    carrier = {};
  });

  describe('.inject()', () => {
    it('should set correlation context header', () => {
      const correlationContext: CorrelationContext = {
        key1: { value: 'd4cda95b652f4a1592b449d5929fda1b' },
        key3: { value: 'c88815a7-0fa9-4d95-a1f1-cdccce3c5c2a' },
        'with/slash': { value: 'with spaces' },
      };

      httpTraceContext.inject(
        setCorrelationContext(ROOT_CONTEXT, correlationContext),
        carrier,
        defaultTextMapSetter
      );
      assert.deepStrictEqual(
        carrier[CORRELATION_CONTEXT_HEADER],
        'key1=d4cda95b652f4a1592b449d5929fda1b,key3=c88815a7-0fa9-4d95-a1f1-cdccce3c5c2a,with%2Fslash=with%20spaces'
      );
    });

    it('should skip long key-value pairs', () => {
      const correlationContext: CorrelationContext = {
        key1: { value: 'd4cda95b' },
        key3: { value: 'c88815a7' },
      };

      // Generate long value 2*MAX_PER_NAME_VALUE_PAIRS
      const value = '1a'.repeat(MAX_PER_NAME_VALUE_PAIRS);
      correlationContext['longPair'] = { value };

      httpTraceContext.inject(
        setCorrelationContext(ROOT_CONTEXT, correlationContext),
        carrier,
        defaultTextMapSetter
      );
      assert.deepStrictEqual(
        carrier[CORRELATION_CONTEXT_HEADER],
        'key1=d4cda95b,key3=c88815a7'
      );
    });

    it('should skip all keys that surpassed the max limit of the header', () => {
      const correlationContext: CorrelationContext = {};

      const zeroPad = (num: number, places: number) =>
        String(num).padStart(places, '0');

      // key=value with same size , 1024 => 8 keys
      for (let i = 0; i < 9; ++i) {
        const index = zeroPad(i, 510);
        correlationContext[`k${index}`] = { value: `${index}` };
      }

      // Build expected
      let expected = '';
      for (let i = 0; i < 8; ++i) {
        const index = zeroPad(i, 510);
        expected += `k${index}=${index},`;
      }
      expected = expected.slice(0, -1);

      httpTraceContext.inject(
        setCorrelationContext(ROOT_CONTEXT, correlationContext),
        carrier,
        defaultTextMapSetter
      );
      assert.deepStrictEqual(carrier[CORRELATION_CONTEXT_HEADER], expected);
    });
  });

  describe('.extract()', () => {
    it('should extract context of a sampled span from carrier', () => {
      carrier[CORRELATION_CONTEXT_HEADER] =
        'key1=d4cda95b,key3=c88815a7, keyn   = valn, keym =valm';
      const extractedCorrelationContext = getCorrelationContext(
        httpTraceContext.extract(ROOT_CONTEXT, carrier, defaultTextMapGetter)
      );

      const expected: CorrelationContext = {
        key1: { value: 'd4cda95b' },
        key3: { value: 'c88815a7' },
        keyn: { value: 'valn' },
        keym: { value: 'valm' },
      };
      assert.deepStrictEqual(extractedCorrelationContext, expected);
    });
  });

  describe('fields()', () => {
    it('returns the fields used by the baggage spec', () => {
      const propagator = new HttpCorrelationContext();
      assert.deepStrictEqual(propagator.fields(), [CORRELATION_CONTEXT_HEADER]);
    });
  });

  it('returns undefined if header is missing', () => {
    assert.deepStrictEqual(
      getCorrelationContext(
        httpTraceContext.extract(ROOT_CONTEXT, carrier, defaultTextMapGetter)
      ),
      undefined
    );
  });

  it('returns keys with their properties', () => {
    carrier[CORRELATION_CONTEXT_HEADER] =
      'key1=d4cda95b,key3=c88815a7;prop1=value1';
    const expected: CorrelationContext = {
      key1: { value: 'd4cda95b' },
      key3: { value: 'c88815a7;prop1=value1' },
    };
    assert.deepStrictEqual(
      getCorrelationContext(
        httpTraceContext.extract(ROOT_CONTEXT, carrier, defaultTextMapGetter)
      ),
      expected
    );
  });

  it('should gracefully handle an invalid header', () => {
    const testCases: Record<
      string,
      {
        header: string;
        correlationContext: CorrelationContext | undefined;
      }
    > = {
      invalidNoKeyValuePair: {
        header: '289371298nekjh2939299283jbk2b',
        correlationContext: undefined,
      },
      invalidDoubleEqual: {
        header: 'key1==value;key2=value2',
        correlationContext: undefined,
      },
      invalidWrongKeyValueFormat: {
        header: 'key1:value;key2=value2',
        correlationContext: undefined,
      },
      invalidDoubleSemicolon: {
        header: 'key1:value;;key2=value2',
        correlationContext: undefined,
      },
      mixInvalidAndValidKeys: {
        header: 'key1==value,key2=value2',
        correlationContext: {
          key2: {
            value: 'value2',
          },
        },
      },
    };
    Object.getOwnPropertyNames(testCases).forEach(testCase => {
      carrier[CORRELATION_CONTEXT_HEADER] = testCases[testCase].header;

      const extractedSpanContext = getCorrelationContext(
        httpTraceContext.extract(ROOT_CONTEXT, carrier, defaultTextMapGetter)
      );
      assert.deepStrictEqual(
        extractedSpanContext,
        testCases[testCase].correlationContext,
        testCase
      );
    });
  });
});
