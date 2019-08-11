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

import { Span } from '@opentelemetry/types';
import { SpanAudit } from './SpanAudit';

export class SpanAuditProcessor {
  private static skipFields = ['_tracer'];
  private _spans: Span[];
  constructor() {
    this._spans = [];
  }

  push(span: Span) {
    this._spans.push(span);
  }

  processSpans(): SpanAudit[] {
    return this._spans.map(span => {
      const auditSpan = {} as SpanAudit;
      // TODO: use getter or SpanData once available
      for (const key in span) {
        if (
          span.hasOwnProperty(key) &&
          !SpanAuditProcessor.skipFields.includes(key)
        ) {
          /* tslint:disable:no-any */
          (auditSpan as any)[key.replace('_', '')] =
            typeof (span as any)[key] === 'object' &&
            !Array.isArray((span as any)[key])
              ? { ...(span as any)[key] }
              : (span as any)[key];
          /* tslint:enable:no-any */
        }
      }
      return auditSpan;
    });
  }

  reset() {
    this._spans = [];
  }
}
