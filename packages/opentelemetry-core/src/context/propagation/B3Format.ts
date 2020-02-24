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

import {
  Carrier,
  Context,
  HttpTextFormat,
  TraceFlags,
} from '@opentelemetry/api';
import { getParentSpanContext, setExtractedSpanContext } from '../context';
import { hexToId, idToHex } from '../../platform';

export const X_B3_TRACE_ID = 'x-b3-traceid';
export const X_B3_SPAN_ID = 'x-b3-spanid';
export const X_B3_SAMPLED = 'x-b3-sampled';

/**
 * Propagator for the B3 HTTP header format.
 * Based on: https://github.com/openzipkin/b3-propagation
 */
export class B3Format implements HttpTextFormat {
  inject(context: Context, carrier: Carrier) {
    const spanContext = getParentSpanContext(context);
    if (!spanContext) return;

    if (
      traceIdIsValid(spanContext.traceId) &&
      spanIdIsValid(spanContext.spanId)
    ) {
      carrier[X_B3_TRACE_ID] = idToHex(spanContext.traceId);
      carrier[X_B3_SPAN_ID] = idToHex(spanContext.spanId);

      // We set the header only if there is an existing sampling decision.
      // Otherwise we will omit it => Absent.
      if (spanContext.traceFlags !== undefined) {
        carrier[X_B3_SAMPLED] = Number(spanContext.traceFlags);
      }
    }
  }

  extract(context: Context, carrier: Carrier): Context {
    const traceIdHeader = carrier[X_B3_TRACE_ID];
    const spanIdHeader = carrier[X_B3_SPAN_ID];
    const sampledHeader = carrier[X_B3_SAMPLED];
    if (!traceIdHeader || !spanIdHeader) return context;
    const traceId = hexToId(
      Array.isArray(traceIdHeader) ? traceIdHeader[0] : traceIdHeader
    );
    const spanId = hexToId(
      Array.isArray(spanIdHeader) ? spanIdHeader[0] : spanIdHeader
    );
    const options = Array.isArray(sampledHeader)
      ? sampledHeader[0]
      : sampledHeader;

    if (traceIdIsValid(traceId) && spanIdIsValid(spanId)) {
      return setExtractedSpanContext(context, {
        traceId,
        spanId,
        isRemote: true,
        traceFlags: isNaN(Number(options))
          ? TraceFlags.UNSAMPLED
          : Number(options),
      });
    }
    return context;
  }
}
