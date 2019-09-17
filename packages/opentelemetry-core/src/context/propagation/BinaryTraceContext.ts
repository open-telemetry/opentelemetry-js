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

import { BinaryFormat, SpanContext, TraceFlags } from '@opentelemetry/types';

const VERSION_ID = 0;
const TRACE_ID_FIELD_ID = 0;
const SPAN_ID_FIELD_ID = 1;
const TRACE_OPTION_FIELD_ID = 2;

// Sizes are number of bytes.
const ID_SIZE = 1;
const TRACE_ID_SIZE = 16;
const SPAN_ID_SIZE = 8;
const TRACE_OPTION_SIZE = 1;

const VERSION_ID_OFFSET = 0;
const TRACE_ID_FIELD_ID_OFFSET = VERSION_ID_OFFSET + ID_SIZE;
const TRACE_ID_OFFSET = TRACE_ID_FIELD_ID_OFFSET + ID_SIZE;
const SPAN_ID_FIELD_ID_OFFSET = TRACE_ID_OFFSET + TRACE_ID_SIZE;
const SPAN_ID_OFFSET = SPAN_ID_FIELD_ID_OFFSET + ID_SIZE;
const TRACE_OPTION_FIELD_ID_OFFSET = SPAN_ID_OFFSET + SPAN_ID_SIZE;
const TRACE_OPTIONS_OFFSET = TRACE_OPTION_FIELD_ID_OFFSET + ID_SIZE;

const FORMAT_LENGTH =
  4 * ID_SIZE + TRACE_ID_SIZE + SPAN_ID_SIZE + TRACE_OPTION_SIZE;

export class BinaryTraceContext implements BinaryFormat {
  toBytes(spanContext: SpanContext): Uint8Array {
    /**
     *  0           1           2
     *  0 1 2345678901234567 8 90123456 7 8
     * -------------------------------------
     * | | |                | |        | | |
     * -------------------------------------
     *  ^ ^      ^           ^    ^     ^ ^
     *  | |      |           |    |     | `-- options value
     *  | |      |           |    |     `---- options field ID (2)
     *  | |      |           |    `---------- spanID value
     *  | |      |           `--------------- spanID field ID (1)
     *  | |      `--------------------------- traceID value
     *  | `---------------------------------- traceID field ID (0)
     *  `------------------------------------ version (0)
     */
    const traceId = spanContext.traceId;
    const spanId = spanContext.spanId;
    const buf = new Uint8Array(FORMAT_LENGTH);
    let j = TRACE_ID_OFFSET;
    for (let i = TRACE_ID_OFFSET; i < SPAN_ID_FIELD_ID_OFFSET; i++) {
      // tslint:disable-next-line:ban Needed to parse hexadecimal.
      buf[j++] = parseInt(traceId.substr((i - TRACE_ID_OFFSET) * 2, 2), 16);
    }
    buf[j++] = SPAN_ID_FIELD_ID;
    for (let i = SPAN_ID_OFFSET; i < TRACE_OPTION_FIELD_ID_OFFSET; i++) {
      // tslint:disable-next-line:ban Needed to parse hexadecimal.
      buf[j++] = parseInt(spanId.substr((i - SPAN_ID_OFFSET) * 2, 2), 16);
    }
    buf[j++] = TRACE_OPTION_FIELD_ID;
    buf[j++] = Number(spanContext.traceFlags) || TraceFlags.UNSAMPLED;
    return buf;
  }

  fromBytes(buf: Uint8Array): SpanContext | null {
    const result: SpanContext = { traceId: '', spanId: '' };
    // Length must be 29.
    if (buf.length !== FORMAT_LENGTH) return null;
    // Check version and field numbers.
    if (
      buf[VERSION_ID_OFFSET] !== VERSION_ID ||
      buf[TRACE_ID_FIELD_ID_OFFSET] !== TRACE_ID_FIELD_ID ||
      buf[SPAN_ID_FIELD_ID_OFFSET] !== SPAN_ID_FIELD_ID ||
      buf[TRACE_OPTION_FIELD_ID_OFFSET] !== TRACE_OPTION_FIELD_ID
    ) {
      return null;
    }
    // See serializeSpanContext for byte offsets.
    result.traceId = toHex(buf.slice(TRACE_ID_OFFSET, SPAN_ID_FIELD_ID_OFFSET));
    result.spanId = toHex(
      buf.slice(SPAN_ID_OFFSET, TRACE_OPTION_FIELD_ID_OFFSET)
    );
    result.traceFlags = buf[TRACE_OPTIONS_OFFSET];
    return result;
  }
}

function toHex(buff: Uint8Array) {
  let out = '';
  for (let i = 0; i < buff.length; ++i) {
    const n = buff[i];
    if (n < 16) {
      out += '0' + n.toString(16);
    } else {
      out += n.toString(16);
    }
  }
  return out;
}
