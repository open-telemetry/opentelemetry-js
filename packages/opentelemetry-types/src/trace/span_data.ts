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

import { SpanContext } from "./span_context";
import { Resource } from "../resources/Resource";
import { SpanKind } from "./span_kind";
import { Attributes } from "./attributes";
import { Link } from "./link";
import { Status } from "./status";

/**
 * SpanData an object that is used to report out-of-band completed spans.
 * The object and its members have to be treated as immutable.
 */
export interface SpanData {
  /**
   * Returns the name of this SpanData.
   */
  getName(): string;

  /**
   * Returns the SpanKind of this SpanData.
   */
  getKind(): SpanKind;

  /**
   * Returns the start timestamp of this SpanData.
   */
  getStartTimestamp(): number;

  /**
   * Returns the end timestamp of this SpanData.
   */
  getEndTimestamp: number;

  /**
   * Returns the SpanContext associated with this SpanData.
   */
  getContext(): SpanContext;

  /**
   * Returns the SpanId of the parent of this SpanData.
   */
  getParentSpanId(): string;

  /**
   * Returns the Resource associated with this SpanData.
   * When null is returned the assumption is that Resource
   * will be taken from the Tracer that is used to record this SpanData.
   */
  getResource(): Resource;

  /**
   * Returns the Attributes collection associated with this SpanData.
   * The order of attributes in this collection is not significant.
   * This collection MUST be immutable.
   */
  getAttributes(): Attributes[];

  /**
   * Return the collection of Events with the timestamps associated with this SpanData.
   * The order of events in collection is not guaranteed.
   * This collection MUST be immutable.
   *
   * @todo: Add Event type
   */
  getTimedEvents(): any[];

  /**
   * Returns the Links collection associated with this SpanData.
   * The order of links in this collection is not significant.
   * This collection MUST be immutable.
   */
  getLinks(): Link[];

  /**
   * Returns the Status of this SpanData.
   */
  getStatus(): Status;
}
