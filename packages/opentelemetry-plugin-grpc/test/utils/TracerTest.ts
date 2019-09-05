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

import { SpanOptions } from '@opentelemetry/types';
import { NodeTracer } from '@opentelemetry/node-tracer';
import { BasicTracerConfig, Span } from '@opentelemetry/basic-tracer';
import { SpanAuditProcessor } from './SpanAuditProcessor';

// TODO: remove these once we have exporter feature
// https://github.com/open-telemetry/opentelemetry-js/pull/149
export class TracerTest extends NodeTracer {
  constructor(config: BasicTracerConfig, public audit: SpanAuditProcessor) {
    super(config);
  }

  startSpan(name: string, options?: SpanOptions): Span {
    const span = super.startSpan(name, options) as Span;
    this.audit.push(span);
    return span;
  }
}
