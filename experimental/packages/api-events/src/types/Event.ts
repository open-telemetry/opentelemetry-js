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

import { Attributes, Context, TimeInput } from '@opentelemetry/api';
import { AnyValue, SeverityNumber } from '@opentelemetry/api-logs';

export interface Event {
  /**
   * The time when the event occurred as UNIX Epoch time in nanoseconds.
   */
  timestamp?: TimeInput;

  /**
   * The name of the event.
   */
  name: string;

  /**
   * Data that describes the event.
   * Intended to be used by instrumentation libraries.
   */
  data?: AnyValue;

  /**
   * Additional attributes that describe the event.
   */
  attributes?: Attributes;

  /**
   * Numerical value of the severity.
   */
  severityNumber?: SeverityNumber;

  /**
   * The Context associated with the Event.
   */
  context?: Context;
}
