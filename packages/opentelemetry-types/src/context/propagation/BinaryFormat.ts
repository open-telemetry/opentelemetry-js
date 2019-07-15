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

import { SpanContext } from '../../trace/span_context';

/**
 * Formatter to serializing and deserializing a value with into a binary format.
 */
export interface BinaryFormat {
  /**
   * Serialize the given span context into a Buffer.
   * @param spanContext The span context to serialize.
   */
  toBytes(spanContext: SpanContext): ArrayBuffer;

  /**
   * Deseralize the given span context from binary encoding. If the input is a
   * Buffer of incorrect size or unexpected fields, then this function will
   * return `null`.
   * @param buffer The span context to deserialize.
   */
  fromBytes(buffer: ArrayBuffer): SpanContext | null;
}
