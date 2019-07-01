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

import { BinaryFormat, SpanContext } from '@opentelemetry/types';

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
  toBytes(spanContext: SpanContext): Buffer {
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
    const result = Buffer.alloc(FORMAT_LENGTH, 0);
    result.write(spanContext.traceId, TRACE_ID_OFFSET, TRACE_ID_SIZE, 'hex');
    result.writeUInt8(SPAN_ID_FIELD_ID, SPAN_ID_FIELD_ID_OFFSET);
    result.write(spanContext.spanId, SPAN_ID_OFFSET, SPAN_ID_SIZE, 'hex');
    result.writeUInt8(TRACE_OPTION_FIELD_ID, TRACE_OPTION_FIELD_ID_OFFSET);
    result.writeUInt8(
      Number(spanContext.traceOptions) || 0,
      TRACE_OPTIONS_OFFSET
    );
    return result;
  }

  fromBytes(buffer: Buffer): SpanContext | null {
    const result: SpanContext = { traceId: '', spanId: '' };
    // Length must be 29.
    if (buffer.length !== FORMAT_LENGTH) {
      return null;
    }
    // Check version and field numbers.
    if (
      buffer.readUInt8(VERSION_ID_OFFSET) !== VERSION_ID ||
      buffer.readUInt8(TRACE_ID_FIELD_ID_OFFSET) !== TRACE_ID_FIELD_ID ||
      buffer.readUInt8(SPAN_ID_FIELD_ID_OFFSET) !== SPAN_ID_FIELD_ID ||
      buffer.readUInt8(TRACE_OPTION_FIELD_ID_OFFSET) !== TRACE_OPTION_FIELD_ID
    ) {
      return null;
    }
    // See serializeSpanContext for byte offsets.
    result.traceId = buffer
      .slice(TRACE_ID_OFFSET, SPAN_ID_FIELD_ID_OFFSET)
      .toString('hex');
    result.spanId = buffer
      .slice(SPAN_ID_OFFSET, TRACE_OPTION_FIELD_ID_OFFSET)
      .toString('hex');
    result.traceOptions = buffer.readUInt8(TRACE_OPTIONS_OFFSET);
    return result;
  }
}
