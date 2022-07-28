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

import { Attributes } from "@opentelemetry/api";

export interface LoggerOptions {
  /**
   * The schemaUrl of the tracer or instrumentation library
   * @default ''
   */
  schemaUrl?: string;

  /**
   * The domain for the events created
   * @default ''
   */
  eventDomain?: string;

  /**
   * Specifies whether the Trace Context should automatically be passed on to the events and logs created by the Logger
   * @default false
   */
  includeTraceContext?: boolean;

  /**
   * The instrumentation scope attributes to associate with emitted telemetry
   */
  attributes?: Attributes;
}
