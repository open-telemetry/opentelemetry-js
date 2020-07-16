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
  defaultGetter,
  defaultSetter,
  SpanContext,
  TraceFlags,
  Context,
} from '@opentelemetry/api';
import * as assert from 'assert';
import {
  getExtractedSpanContext,
  setExtractedSpanContext,
  TraceState,
} from '@opentelemetry/core';
import { DatadogPropagator } from '../src/';
import { id } from '../src/types';
import { DatadogPropagationDefaults } from '../src/defaults';

describe('DatadogPropagator', () => {
  const datadogPropagator = new DatadogPropagator();
  let carrier: { [key: string]: unknown };

  beforeEach(() => {
    carrier = {};
  });

  describe('.inject()', () => {
    it('should set datadog traceId and spanId headers', () => {
      const traceId = 'd4cda95b652f4a1592b449d5929fda1b';
      const spanId = '6e0c63257de34c92';
      const spanContext: SpanContext = {
        traceId: traceId,
        spanId: spanId,
        traceFlags: TraceFlags.SAMPLED,
      };

      datadogPropagator.inject(
        setExtractedSpanContext(Context.ROOT_CONTEXT, spanContext),
        carrier,
        defaultSetter
      );
      assert.deepStrictEqual(
        carrier[DatadogPropagationDefaults.X_DD_TRACE_ID],
        id(traceId).toString(10)
      );
      assert.deepStrictEqual(
        carrier[DatadogPropagationDefaults.X_DD_PARENT_ID],
        id(spanId).toString(10)
      );
      assert.deepStrictEqual(
        carrier[DatadogPropagationDefaults.X_DD_SAMPLING_PRIORITY],
        '1'
      );
    });

    it('should set b3 traceId and spanId headers and also traceflags and tracestate', () => {
      const traceId = 'd4cda95b652f4a1592b449d5929fda1b';
      const spanId = '6e0c63257de34c92';
      const spanContext: SpanContext = {
        traceId: traceId,
        spanId: spanId,
        traceFlags: TraceFlags.NONE,
        traceState: new TraceState('dd_origin=synthetics-example'),
        isRemote: true,
      };

      datadogPropagator.inject(
        setExtractedSpanContext(Context.ROOT_CONTEXT, spanContext),
        carrier,
        defaultSetter
      );
      assert.deepStrictEqual(
        carrier[DatadogPropagationDefaults.X_DD_TRACE_ID],
        id(traceId).toString(10)
      );
      assert.deepStrictEqual(
        carrier[DatadogPropagationDefaults.X_DD_PARENT_ID],
        id(spanId).toString(10)
      );
      assert.deepStrictEqual(
        carrier[DatadogPropagationDefaults.X_DD_SAMPLING_PRIORITY],
        '0'
      );
      assert.deepStrictEqual(
        carrier[DatadogPropagationDefaults.X_DD_ORIGIN],
        'synthetics-example'
      );
    });

    it('should not inject empty spancontext', () => {
      const emptySpanContext = {
        traceId: '',
        spanId: '',
        traceFlags: TraceFlags.NONE,
      };
      datadogPropagator.inject(
        setExtractedSpanContext(Context.ROOT_CONTEXT, emptySpanContext),
        carrier,
        defaultSetter
      );
      assert.deepStrictEqual(
        carrier[DatadogPropagationDefaults.X_DD_TRACE_ID],
        undefined
      );
      assert.deepStrictEqual(
        carrier[DatadogPropagationDefaults.X_DD_PARENT_ID],
        undefined
      );
    });
  });

  describe('.extract()', () => {
    it('should extract context of a unsampled span from carrier', () => {
      carrier[DatadogPropagationDefaults.X_DD_TRACE_ID] = id(
        '0af7651916cd43dd8448eb211c80319c'
      ).toString(10);
      carrier[DatadogPropagationDefaults.X_DD_PARENT_ID] = id(
        'b7ad6b7169203331'
      ).toString(10);
      const extractedSpanContext = getExtractedSpanContext(
        datadogPropagator.extract(Context.ROOT_CONTEXT, carrier, defaultGetter)
      );

      assert.deepStrictEqual(extractedSpanContext, {
        spanId: 'b7ad6b7169203331',
        traceId: '0af7651916cd43dd',
        isRemote: true,
        traceFlags: TraceFlags.NONE,
      });
    });

    it('should extract context of a sampled span from carrier', () => {
      carrier[DatadogPropagationDefaults.X_DD_TRACE_ID] = id(
        '0af7651916cd43dd8448eb211c80319c'
      ).toString(10);
      carrier[DatadogPropagationDefaults.X_DD_PARENT_ID] = id(
        'b7ad6b7169203331'
      ).toString(10);
      carrier[DatadogPropagationDefaults.X_DD_SAMPLING_PRIORITY] = '1';

      const extractedSpanContext = getExtractedSpanContext(
        datadogPropagator.extract(Context.ROOT_CONTEXT, carrier, defaultGetter)
      );

      assert.deepStrictEqual(extractedSpanContext, {
        spanId: 'b7ad6b7169203331',
        traceId: '0af7651916cd43dd',
        isRemote: true,
        traceFlags: TraceFlags.SAMPLED,
      });
    });

    it('should return undefined when traceId is undefined', () => {
      carrier[DatadogPropagationDefaults.X_DD_TRACE_ID] = undefined;
      carrier[DatadogPropagationDefaults.X_DD_PARENT_ID] = undefined;
      assert.deepStrictEqual(
        getExtractedSpanContext(
          datadogPropagator.extract(
            Context.ROOT_CONTEXT,
            carrier,
            defaultGetter
          )
        ),
        undefined
      );
    });

    it('should return undefined when options and spanId are undefined', () => {
      carrier[DatadogPropagationDefaults.X_DD_TRACE_ID] = id(
        '0af7651916cd43dd8448eb211c80319c'
      ).toString(10);
      carrier[DatadogPropagationDefaults.X_DD_PARENT_ID] = undefined;
      assert.deepStrictEqual(
        getExtractedSpanContext(
          datadogPropagator.extract(
            Context.ROOT_CONTEXT,
            carrier,
            defaultGetter
          )
        ),
        undefined
      );
    });

    it('returns undefined if datadog header is missing', () => {
      assert.deepStrictEqual(
        getExtractedSpanContext(
          datadogPropagator.extract(
            Context.ROOT_CONTEXT,
            carrier,
            defaultGetter
          )
        ),
        undefined
      );
    });

    it('returns undefined if datadog header is invalid', () => {
      carrier[DatadogPropagationDefaults.X_DD_TRACE_ID] = 'invalid!';
      assert.deepStrictEqual(
        getExtractedSpanContext(
          datadogPropagator.extract(
            Context.ROOT_CONTEXT,
            carrier,
            defaultGetter
          )
        ),
        undefined
      );
    });

    it('extracts datadog from list of header', () => {
      carrier[DatadogPropagationDefaults.X_DD_TRACE_ID] = [
        id('0af7651916cd43dd8448eb211c80319c').toString(10),
      ];
      carrier[DatadogPropagationDefaults.X_DD_PARENT_ID] = id(
        'b7ad6b7169203331'
      ).toString(10);
      carrier[DatadogPropagationDefaults.X_DD_SAMPLING_PRIORITY] = '01';
      const extractedSpanContext = getExtractedSpanContext(
        datadogPropagator.extract(Context.ROOT_CONTEXT, carrier, defaultGetter)
      );

      assert.deepStrictEqual(extractedSpanContext, {
        spanId: 'b7ad6b7169203331',
        traceId: '0af7651916cd43dd',
        isRemote: true,
        traceFlags: TraceFlags.SAMPLED,
      });
    });

    it('should fail gracefully on bad responses from getter', () => {
      const ctx1 = datadogPropagator.extract(
        Context.ROOT_CONTEXT,
        carrier,
        (c, k) => 1 // not a number
      );
      const ctx2 = datadogPropagator.extract(
        Context.ROOT_CONTEXT,
        carrier,
        (c, k) => [] // empty array
      );
      const ctx3 = datadogPropagator.extract(
        Context.ROOT_CONTEXT,
        carrier,
        (c, k) => undefined // missing value
      );

      assert.ok(ctx1 === Context.ROOT_CONTEXT);
      assert.ok(ctx2 === Context.ROOT_CONTEXT);
      assert.ok(ctx3 === Context.ROOT_CONTEXT);
    });

    // TODO: this is implemented for b3 64 bit, not sure if we should implement for datadog
    //   it('should left-pad 64 bit trace ids with 0', () => {
    //   });
  });
});
