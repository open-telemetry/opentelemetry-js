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

import * as crypto from 'crypto';
import * as api from '@opentelemetry/api';

const SPAN_ID_BYTES = 8;
const TRACE_ID_BYTES = 16;

export class RandomIdGenerator implements api.IdGenerator {
  private SpanIdBytes: number = SPAN_ID_BYTES;
  private TraceIdBytes: number = TRACE_ID_BYTES;

  // In case if user would like to adjust the length of ID
  constructor(Span_Id_Bytes?: number, Trace_Id_Bytes?: number) {
    if (Span_Id_Bytes) {
      this.SpanIdBytes = Span_Id_Bytes;
    }
    if (Trace_Id_Bytes) {
      this.TraceIdBytes = Trace_Id_Bytes;
    }
  }

  /**
   * Returns a random 16-byte trace ID formatted/encoded as a 32 lowercase hex
   * characters corresponding to 128 bits.
   */
  GenerateTraceId(): string {
    return crypto.randomBytes(this.TraceIdBytes).toString('hex');
  }

  /**
   * Returns a random 8-byte span ID formatted/encoded as a 16 lowercase hex
   * characters corresponding to 64 bits.
   */
  GenerateSpanId(): string {
    return crypto.randomBytes(this.SpanIdBytes).toString('hex');
  }
}
