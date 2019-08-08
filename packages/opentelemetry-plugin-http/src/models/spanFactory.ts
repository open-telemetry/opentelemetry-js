import { Span, SpanOptions, Tracer } from '@opentelemetry/types';
import { Attributes } from '../enums/attributes';
/**
 * Create span with default attributes
 */
export class SpanFactory {
  private readonly _tracer: Tracer;
  constructor(tracer: Tracer, public component: string) {
    this._tracer = tracer;
  }

  createInstance(name: string, options?: SpanOptions): Span {
    return this._tracer
      .startSpan(name, options)
      .setAttribute(Attributes.COMPONENT, this.component);
  }
}
