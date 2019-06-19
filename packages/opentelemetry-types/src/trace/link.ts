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

import { Attributes } from './attributes';
import { SpanContext } from './span_context';

/**
 * A pointer from the current span to another span in the same trace or in a
 * different trace.
 */
export interface Link {
  /** The SpanContext of a linked span. */
  spanContext: SpanContext;
  /** A set of attributes on the link. */
  attributes?: Attributes;
}
