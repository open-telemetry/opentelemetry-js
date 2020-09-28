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

import * as assert from 'assert';
import {
  defaultGetter,
  defaultSetter,
  SpanContext,
  TraceFlags,
  INVALID_SPANID,
  INVALID_TRACEID,
} from '@opentelemetry/api';
import { ROOT_CONTEXT } from '@opentelemetry/context-base';
import {
  getExtractedSpanContext,
  setExtractedSpanContext,
} from '../../src/context/context';
import {
  B3SinglePropagator,
  B3_CONTEXT_HEADER,
} from '../../src/context/propagation/B3SinglePropagator';

describe('B3SinglePropagator', () => {
  const propagator = new B3SinglePropagator();
  let carrier: { [key: string]: unknown };

  beforeEach(() => {
    carrier = {};
  });

  describe('.inject()', () => {
    it('injects context with sampled trace flags', () => {
      const spanContext: SpanContext = {
        traceId: '80f198ee56343ba864fe8b2a57d3eff7',
        spanId: 'e457b5a2e4d86bd1',
        traceFlags: TraceFlags.SAMPLED,
      };

      propagator.inject(
        setExtractedSpanContext(ROOT_CONTEXT, spanContext),
        carrier,
        defaultSetter
      );

      const expected = '80f198ee56343ba864fe8b2a57d3eff7-e457b5a2e4d86bd1-1';
      assert.strictEqual(carrier[B3_CONTEXT_HEADER], expected);
    });

    it('injects context with unspecified trace flags', () => {
      const spanContext: SpanContext = {
        traceId: '80f198ee56343ba864fe8b2a57d3eff7',
        spanId: 'e457b5a2e4d86bd1',
        traceFlags: TraceFlags.NONE,
      };

      propagator.inject(
        setExtractedSpanContext(ROOT_CONTEXT, spanContext),
        carrier,
        defaultSetter
      );

      const expected = '80f198ee56343ba864fe8b2a57d3eff7-e457b5a2e4d86bd1-0';
      assert.strictEqual(carrier[B3_CONTEXT_HEADER], expected);
    });
  });

  describe('.extract', () => {
    it('extracts context with traceid, spanid, sampling flag, parent spanid', () => {
      carrier = {
        [B3_CONTEXT_HEADER]:
          '80f198ee56343ba864fe8b2a57d3eff7-e457b5a2e4d86bd1-1-05e3ac9a4f6e3b90',
      };

      const context = propagator.extract(ROOT_CONTEXT, carrier, defaultGetter);

      const extractedSpanContext = getExtractedSpanContext(context);
      assert.deepStrictEqual(extractedSpanContext, {
        spanId: 'e457b5a2e4d86bd1',
        traceId: '80f198ee56343ba864fe8b2a57d3eff7',
        isRemote: true,
        traceFlags: TraceFlags.SAMPLED,
      });
    });

    it('extracts context with traceid, spanid, sampling flag', () => {
      carrier = {
        [B3_CONTEXT_HEADER]:
          '80f198ee56343ba864fe8b2a57d3eff7-e457b5a2e4d86bd1-1',
      };

      const context = propagator.extract(ROOT_CONTEXT, carrier, defaultGetter);

      const extractedSpanContext = getExtractedSpanContext(context);
      assert.deepStrictEqual(extractedSpanContext, {
        spanId: 'e457b5a2e4d86bd1',
        traceId: '80f198ee56343ba864fe8b2a57d3eff7',
        isRemote: true,
        traceFlags: TraceFlags.SAMPLED,
      });
    });

    it('extracts context with traceid, spanid', () => {
      carrier = {
        [B3_CONTEXT_HEADER]:
          '80f198ee56343ba864fe8b2a57d3eff7-e457b5a2e4d86bd1',
      };

      const context = propagator.extract(ROOT_CONTEXT, carrier, defaultGetter);

      const extractedSpanContext = getExtractedSpanContext(context);
      assert.deepStrictEqual(extractedSpanContext, {
        spanId: 'e457b5a2e4d86bd1',
        traceId: '80f198ee56343ba864fe8b2a57d3eff7',
        isRemote: true,
        traceFlags: TraceFlags.NONE,
      });
    });

    it('converts 8-byte traceid', () => {
      carrier = {
        [B3_CONTEXT_HEADER]: '4aaba1a52cf8ee09-e457b5a2e4d86bd1',
      };

      const context = propagator.extract(ROOT_CONTEXT, carrier, defaultGetter);

      const extractedSpanContext = getExtractedSpanContext(context);
      assert.deepStrictEqual(extractedSpanContext, {
        spanId: 'e457b5a2e4d86bd1',
        traceId: '00000000000000004aaba1a52cf8ee09',
        isRemote: true,
        traceFlags: TraceFlags.NONE,
      });
    });

    it('converts debug flag to sampled', () => {
      carrier = {
        [B3_CONTEXT_HEADER]:
          '80f198ee56343ba864fe8b2a57d3eff7-e457b5a2e4d86bd1-d',
      };

      const context = propagator.extract(ROOT_CONTEXT, carrier, defaultGetter);

      const extractedSpanContext = getExtractedSpanContext(context);
      assert.deepStrictEqual(extractedSpanContext, {
        spanId: 'e457b5a2e4d86bd1',
        traceId: '80f198ee56343ba864fe8b2a57d3eff7',
        isRemote: true,
        traceFlags: TraceFlags.SAMPLED,
      });
    });

    it('handles malformed traceid', () => {
      carrier = {
        [B3_CONTEXT_HEADER]: 'abc123-e457b5a2e4d86bd1',
      };

      const context = propagator.extract(ROOT_CONTEXT, carrier, defaultGetter);

      const extractedSpanContext = getExtractedSpanContext(context);
      assert.deepStrictEqual(undefined, extractedSpanContext);
    });

    it('handles malformed spanid', () => {
      carrier = {
        [B3_CONTEXT_HEADER]: '80f198ee56343ba864fe8b2a57d3eff7-abc123',
      };

      const context = propagator.extract(ROOT_CONTEXT, carrier, defaultGetter);

      const extractedSpanContext = getExtractedSpanContext(context);
      assert.deepStrictEqual(undefined, extractedSpanContext);
    });

    it('handles invalid traceid', () => {
      carrier = {
        [B3_CONTEXT_HEADER]: `${INVALID_TRACEID}-e457b5a2e4d86bd1`,
      };

      const context = propagator.extract(ROOT_CONTEXT, carrier, defaultGetter);

      const extractedSpanContext = getExtractedSpanContext(context);
      assert.deepStrictEqual(undefined, extractedSpanContext);
    });

    it('handles invalid spanid', () => {
      carrier = {
        [B3_CONTEXT_HEADER]: `80f198ee56343ba864fe8b2a57d3eff7-${INVALID_SPANID}`,
      };

      const context = propagator.extract(ROOT_CONTEXT, carrier, defaultGetter);

      const extractedSpanContext = getExtractedSpanContext(context);
      assert.deepStrictEqual(undefined, extractedSpanContext);
    });
  });
});
