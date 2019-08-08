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
