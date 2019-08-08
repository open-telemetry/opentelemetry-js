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
