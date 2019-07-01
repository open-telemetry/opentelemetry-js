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
 * Injects and extracts a value as text into carriers that travel in-band
 * across process boundaries. Encoding is expected to conform to the HTTP
 * Header Field semantics. Values are often encoded as RPC/HTTP request headers.
 *
 * The carrier of propagated data on both the client (injector) and server
 * (extractor) side is usually an http request. Propagation is usually
 * implemented via library- specific request interceptors, where the
 * client-side injects values and the server-side extracts them.
 */
export interface HttpTextFormat {
  /**
   * Injects the given {@link SpanContext} instance to transmit over the wire.
   *
   * OpenTelemetry defines a common set of format values (BinaryFormat and
   * HTTPTextFormat), and each has an expected `carrier` type.
   *
   * @param spanContext the SpanContext to transmit over the wire.
   * @param format the format of the carrier.
   * @param carrier the carrier of propagation fields, such as an http request.
   */
  inject(spanContext: SpanContext, format: string, carrier: unknown): void;

  /**
   * Returns a {@link SpanContext} instance extracted from `carrier` in the
   * given format from upstream.
   *
   * @param format the format of the carrier.
   * @param carrier the carrier of propagation fields, such as an http request.
   * @returns SpanContext The extracted SpanContext, or null if no such
   *     SpanContext could be found in carrier.
   */
  extract(format: string, carrier: unknown): SpanContext | null;
}
