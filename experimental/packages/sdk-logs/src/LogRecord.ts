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

import { Attributes, AttributeValue } from '@opentelemetry/api';
import { InstrumentationScope } from '@opentelemetry/core';
import { Resource } from '@opentelemetry/resources';
import { ReadableLogRecord } from './export/ReadableLogRecord';

export class LogRecord implements ReadableLogRecord {
  private attributes?: Attributes | undefined;

  readonly timestamp?: number | undefined;
  readonly severityNumber?: number | undefined;
  readonly severityText?: string | undefined;
  readonly body?: string | undefined;
  readonly traceFlags?: number | undefined;
  readonly traceId?: string | undefined;
  readonly spanId?: string | undefined;
  readonly resource: Resource;
  readonly instrumentationScope: InstrumentationScope;

  constructor(
    resource: Resource,
    instrumentationScope: InstrumentationScope,
    timestamp?: number,
    severityNumber?: number,
    severityText?: string,
    body?: string,
    attributes?: Attributes,
    traceFlags?: number,
    traceId?: string,
    spanId?: string
  ) {
    this.resource = resource;
    this.instrumentationScope = instrumentationScope;
    this.timestamp = timestamp;
    this.severityNumber = severityNumber;
    this.severityText = severityText;
    this.body = body;
    this.attributes = attributes;
    this.traceFlags = traceFlags;
    this.traceId = traceId;
    this.spanId = spanId;
  }

  getAttributes(): Attributes | undefined {
    return this.attributes;
  }

  getAttribute(key: string) {
    if (this.attributes) { 
      return this.attributes[key];
    }
  }

  setAttribute(key: string, value: AttributeValue): this {
    if (!this.attributes) {
      this.attributes = {};
    }
    this.attributes[key] = value;
    return this;
  }
}