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

import { Context } from '@opentelemetry/scope-base';
import { Carrier } from './carrier';

/**
 * Injects {@link Context} into and extracts it from carriers that travel
 * in-band across process boundaries. Encoding is expected to conform to the
 * HTTP Header Field semantics. Values are often encoded as RPC/HTTP request
 * headers.
 *
 * The carrier of propagated data on both the client (injector) and server
 * (extractor) side is usually an object such as http headers.
 */
export interface HttpTextFormat {
  /**
   * Injects values from a given {@link Context} into a carrier.
   *
   * OpenTelemetry defines a common set of format values (HTTPTextFormat), and
   * each has an expected `carrier` type.
   *
   * @param context the Context from which to extract values to transmit over
   *     the wire.
   * @param carrier the carrier of propagation fields, such as http request
   *     headers.
   */
  inject(context: Context, carrier: Carrier): void;

  /**
   * Given a {@link Context} and a carrier, extract context values from a
   * carrier and return a new context, created from the old context, with the
   * extracted values.
   *
   * @param context the Context from which to extract values to transmit over
   *     the wire.
   * @param carrier the carrier of propagation fields, such as http request
   *     headers.
   */
  extract(context: Context, carrier: Carrier): Context;
}
