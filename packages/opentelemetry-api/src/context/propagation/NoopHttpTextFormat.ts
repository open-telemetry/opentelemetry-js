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

import { SpanContext } from '../../trace/span_context';
import { Carrier } from './carrier';
import { HttpTextFormat } from './HttpTextFormat';

/**
 * No-op implementations of {@link HttpTextFormat}.
 */
export class NoopHttpTextFormat implements HttpTextFormat {
  // By default does nothing
  inject(spanContext: SpanContext, format: string, carrier: Carrier): void {}
  // By default does nothing
  extract(format: string, carrier: Carrier): SpanContext | null {
    return null;
  }
}

export const NOOP_HTTP_TEXT_FORMAT = new NoopHttpTextFormat();
