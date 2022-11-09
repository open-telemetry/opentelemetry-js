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

import { Attributes } from '@opentelemetry/api';
import { InstrumentationScope } from '@opentelemetry/core';
import { Resource } from "@opentelemetry/resources";

export interface ReadableLogRecord {
  readonly timestamp?: number;
  readonly severityNumber?: number;
  readonly severityText?: string;
  readonly body?: string;
  readonly traceFlags?: number;
  readonly traceId?: string;
  readonly spanId?: string;
  readonly resource: Resource;
  readonly instrumentationScope: InstrumentationScope;

  getAttributes(): Attributes | undefined;

  getAttribute(key: string): any;
}
