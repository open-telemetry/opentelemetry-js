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

import * as api from '@opentelemetry/api';
import { SpanAttributeValue } from '@opentelemetry/api';
import {
  InstrumentationLibrary
} from '@opentelemetry/core';
import { IResource } from '@opentelemetry/resources';
import { TimedEvent } from '../TimedEvent';

export interface WriteableSpan extends api.Span {
    readonly kind: api.SpanKind;
    readonly parentSpanId?: string;
    readonly attributes: api.SpanAttributes;
    readonly links: api.Link[];
    readonly events: TimedEvent[];
    readonly startTime: api.HrTime;
    readonly resource: IResource;
    readonly instrumentationLibrary: InstrumentationLibrary;
    name: string;
    status: api.SpanStatus;
    endTime: api.HrTime;

    spanContext(): api.SpanContext

    setAttribute(key: string, value?: SpanAttributeValue): this;

    setAttributes(attributes: api.SpanAttributes): this

    addEvent(
      name: string,
      attributesOrStartTime?: api.SpanAttributes | api.TimeInput,
      startTime?: api.TimeInput
    ): this

    setStatus(status: api.SpanStatus): this

    updateName(name: string): this

    end(endTime?: api.TimeInput): void

    isRecording(): boolean

    recordException(exception: api.Exception, time?: api.TimeInput): void;

    get duration(): api.HrTime

    get ended(): boolean
  }
