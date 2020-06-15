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

const SPAN_ID_BYTES = 8;
const TRACE_ID_BYTES = 16;

/**
 * Returns a random 16-byte trace ID formatted/encoded as a 32 lowercase hex
 * characters corresponding to 128 bits.
 */
export function randomTraceId(): string {
  return crypto.randomBytes(TRACE_ID_BYTES).toString('hex');
}

/**
 * Returns a random 8-byte span ID formatted/encoded as a 16 lowercase hex
 * characters corresponding to 64 bits.
 */
export function randomSpanId(): string {
  return crypto.randomBytes(SPAN_ID_BYTES).toString('hex');
}
