import { SpanAuditProcessor } from './SpanAuditProcessor';
import {
  Span,
  Tracer,
  SpanOptions,
  BinaryFormat,
  HttpTextFormat,
} from '@opentelemetry/types';

export class ProxyTracer implements Tracer {
  private readonly _tracer: Tracer;
  constructor(tracer: Tracer, public audit: SpanAuditProcessor) {
    this._tracer = tracer;
  }
  getCurrentSpan(): Span {
    return this._tracer.getCurrentSpan();
  }
  startSpan(name: string, options?: SpanOptions | undefined): Span {
    const span = this._tracer.startSpan(name, options);
    this.audit.push(span);
    return span;
  }
  withSpan<T extends (...args: unknown[]) => ReturnType<T>>(
    span: Span,
    fn: T
  ): ReturnType<T> {
    return this._tracer.withSpan(span, fn);
  }
  recordSpanData(span: Span): void {}
  getBinaryFormat(): BinaryFormat {
    throw new Error('Method not implemented.');
  }
  getHttpTextFormat(): HttpTextFormat {
    return this._tracer.getHttpTextFormat();
  }
  wrapEmitter(emitter: unknown): void {
    this._tracer.wrapEmitter(emitter);
  }
}
