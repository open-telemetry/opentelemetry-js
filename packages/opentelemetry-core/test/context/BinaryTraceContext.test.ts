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
import { BinaryTraceContext } from '../../src/context/propagation/BinaryTraceContext';
import { SpanContext, TraceOptions } from '@opentelemetry/types';

describe('BinaryTraceContext', () => {
  const binaryTraceContext = new BinaryTraceContext();
  const commonTraceId = 'd4cda95b652f4a1592b449d5929fda1b';
  const commonSpanId = '75e8ed491aec7eca';

  const testCases: Array<{
    structured: SpanContext | null;
    binary: string;
    description: string;
  }> = [
    {
      structured: {
        traceId: commonTraceId,
        spanId: commonSpanId,
        traceOptions: TraceOptions.SAMPLED,
      },
      binary: `0000${commonTraceId}01${commonSpanId}02${'01'}`,
      description: 'span context with 64-bit span ID',
    },
    {
      structured: { traceId: commonTraceId, spanId: commonSpanId },
      binary: `0000${commonTraceId}01${commonSpanId}02${'00'}`,
      description: 'span context with no traceOptions',
    },
    {
      structured: null,
      binary: '00',
      description: 'incomplete binary span context (by returning null)',
    },
    {
      structured: null,
      binary: '0'.repeat(58),
      description: 'bad binary span context (by returning null)',
    },
  ];

  describe('toBytes', () => {
    testCases.forEach(
      testCase =>
        testCase.structured &&
        it(`should serialize ${testCase.description}`, () => {
          assert.deepStrictEqual(
            binaryTraceContext.toBytes(testCase.structured!).toString('hex'),
            testCase.binary
          );
        })
    );
  });

  describe('fromBytes', () => {
    testCases.forEach(testCase =>
      it(`should deserialize ${testCase.description}`, () => {
        assert.deepStrictEqual(
          binaryTraceContext.fromBytes(Buffer.from(testCase.binary, 'hex')),
          testCase.structured &&
            Object.assign(
              { traceOptions: TraceOptions.UNSAMPLED },
              testCase.structured
            )
        );
      })
    );
  });
});
