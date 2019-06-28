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
import { Status } from './status';

/**
 * An interface that represents a span. A span represents a single operation
 * within a trace. Examples of span might include remote procedure calls or a
 * in-process function calls to sub-components. A Trace has a single, top-level
 * "root" Span that in turn may have zero or more child Spans, which in turn
 * may have children.
 */
export interface Span {
  /**
   * Returns the {@link SpanContext} object associated with this Span.
   *
   * @returns the SpanContext object associated with this Span.
   */
  context(): SpanContext;

  // /**
  //  * # TODO
  //  * Returns the Tracer object used to create this Span.
  //  * https://github.com/open-telemetry/opentelemetry-specification/issues/21
  //  */
  // tracer(): Tracer;

  /**
   * Sets an attribute to the span.
   *
   * @param key the key for this attribute.
   * @param value the value for this attribute.
   */
  setAttribute(key: string, value: unknown): this;

  /**
   * Sets attributes to the span.
   *
   * @param attributes the attributes that will be added.
   */
  setAttributes(attributes: Attributes): this;

  /**
   * Adds an event to the Span.
   *
   * @param name the name of the event.
   * @param [attributes] the attributes that will be added; these are
   *     associated with this event.
   */
  addEvent(name: string, attributes?: Attributes): this;

  /**
   * Adds a link to the Span.
   *
   * @param spanContext the context of the linked span.
   * @param [attributes] the attributes that will be added; these are
   *     associated with this link.
   */
  addLink(spanContext: SpanContext, attributes?: Attributes): this;

  /**
   * Sets a status to the span. If used, this will override the default Span
   * status. Default is {@link CanonicalCode.OK}.
   *
   * @param status the Status to set.
   */
  setStatus(status: Status): this;

  /**
   * Updates the Span name.
   *
   * TODO (revision): https://github.com/open-telemetry/opentelemetry-specification/issues/119
   *
   * @param name the Span name.
   */
  updateName(name: string): this;

  /**
   * Marks the end of Span execution.
   *
   * Call to End of a Span MUST not have any effects on child spans. Those may
   * still be running and can be ended later.
   *
   * Do not return `this`. The Span generally should not be used after it
   * is ended so chaining is not desired in this context.
   *
   * @param [endTime] the timestamp to set as Span's end time. If not provided,
   *     use the current time as the span's end time.
   *     TODO (Add timestamp format): https://github.com/open-telemetry/opentelemetry-js/issues/19
   */
  end(endTime?: number): void;

  /**
   * Returns the flag whether this span will be recorded.
   *
   * @returns true if this Span is active and recording information like events
   * with the AddEvent operation and attributes using setAttributes.
   */
  isRecordingEvents(): boolean;
}
