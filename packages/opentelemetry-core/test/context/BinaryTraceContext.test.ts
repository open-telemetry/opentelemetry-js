/*!
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
import { BinaryTraceContext } from '../../src/context/propagation/BinaryTraceContext';
import { SpanContext, TraceFlags } from '@opentelemetry/api';

describe('BinaryTraceContext', () => {
  const binaryTraceContext = new BinaryTraceContext();
  const commonTraceId = new Uint8Array([
    0xd4,
    0xcd,
    0xa9,
    0x5b,
    0x65,
    0x2f,
    0x4a,
    0x15,
    0x92,
    0xb4,
    0x49,
    0xd5,
    0x92,
    0x9f,
    0xda,
    0x1b,
  ]);
  const commonSpanId = new Uint8Array([
    0x75,
    0xe8,
    0xed,
    0x49,
    0x1a,
    0xec,
    0x7e,
    0xca,
  ]);

  const testCases: Array<{
    structured: SpanContext | null;
    binary: Uint8Array;
    description: string;
  }> = [
    {
      structured: {
        traceId: commonTraceId,
        spanId: commonSpanId,
        traceFlags: TraceFlags.SAMPLED,
      },
      binary: new Uint8Array([
        0,
        0,
        212,
        205,
        169,
        91,
        101,
        47,
        74,
        21,
        146,
        180,
        73,
        213,
        146,
        159,
        218,
        27,
        1,
        117,
        232,
        237,
        73,
        26,
        236,
        126,
        202,
        2,
        1,
      ]),
      description: 'span context with 64-bit span ID',
    },
    {
      structured: { traceId: commonTraceId, spanId: commonSpanId },
      binary: new Uint8Array([
        0,
        0,
        212,
        205,
        169,
        91,
        101,
        47,
        74,
        21,
        146,
        180,
        73,
        213,
        146,
        159,
        218,
        27,
        1,
        117,
        232,
        237,
        73,
        26,
        236,
        126,
        202,
        2,
        0,
      ]),
      description: 'span context with no traceFlags',
    },
    {
      structured: null,
      binary: new Uint8Array([0, 0]),
      description: 'incomplete binary span context (by returning null)',
    },
    {
      structured: null,
      binary: new Uint8Array(58),
      description: 'bad binary span context (by returning null)',
    },
  ];

  describe('.toBytes()', () => {
    testCases.forEach(
      testCase =>
        testCase.structured &&
        it(`should serialize ${testCase.description}`, () => {
          assert.deepStrictEqual(
            binaryTraceContext.toBytes(testCase.structured!),
            testCase.binary
          );
        })
    );
  });

  describe('.fromBytes()', () => {
    testCases.forEach(testCase =>
      it(`should deserialize ${testCase.description}`, () => {
        assert.deepStrictEqual(
          binaryTraceContext.fromBytes(testCase.binary),
          testCase.structured &&
            Object.assign(
              { isRemote: true, traceFlags: TraceFlags.UNSAMPLED },
              testCase.structured
            )
        );
      })
    );
  });
});
