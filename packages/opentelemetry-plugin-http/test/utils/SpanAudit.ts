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

import {
  SpanKind,
  Status,
  Attributes,
  SpanContext,
  Link,
  Event,
} from '@opentelemetry/types';

export interface SpanAudit {
  spanContext: SpanContext;
  attributes: Attributes;
  name: string;
  ended: boolean;
  events: Event[];
  links: Link[];
  parentId?: string;
  kind: SpanKind;
  status: Status;
  startTime: number;
  endTime: number;
}
