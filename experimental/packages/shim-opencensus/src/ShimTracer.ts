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

import * as oc from '@opencensus/core';

import {
  Context,
  context,
  createContextKey,
  diag,
  INVALID_SPAN_CONTEXT,
  trace,
  Tracer,
} from '@opentelemetry/api';
import { DEFAULT_SPAN_NAME, ShimSpan } from './ShimSpan';
import { mapSpanContext, mapSpanKind } from './trace-transform';
import { shimPropagation } from './propagation';

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
const INVALID_SPAN = trace.getSpan(
  trace.setSpanContext(context.active(), INVALID_SPAN_CONTEXT)
)!;
const ROOTSPAN_KEY = createContextKey('rootspan_for_oc_shim');

function setRootSpan(ctx: Context, span: ShimSpan): Context {
  return ctx.setValue(ROOTSPAN_KEY, span);
}

export function getRootSpan(ctx: Context): ShimSpan | null {
  return ctx.getValue(ROOTSPAN_KEY) as ShimSpan | null;
}

export class ShimTracer implements oc.Tracer {
  logger: oc.Logger = diag;
  active: boolean = false;

  /** Noop implementations */
  sampler: oc.Sampler = new oc.AlwaysSampler();
  activeTraceParams: oc.TraceParams = {};
  eventListeners: oc.SpanEventListener[] = [];
  // Uses the global OpenTelemetry propagator by default
  propagation: oc.Propagation = shimPropagation;
  private otelTracer: Tracer;

  constructor(otelTracer: Tracer) {
    this.otelTracer = otelTracer;
  }

  start({ propagation }: oc.TracerConfig): this {
    this.active = true;
    // Pass a propagation here if you want the shim to use an OpenCensus propagation instance
    // instead of the OpenTelemetry global propagator.
    if (propagation) {
      this.propagation = propagation;
    }
    return this;
  }

  /** Noop implementations */
  stop(): this {
    this.active = false;
    return this;
  }
  registerSpanEventListener(): void {}
  unregisterSpanEventListener(): void {}
  clearCurrentTrace(): void {}
  onStartSpan(): void {}
  onEndSpan(): void {}
  setCurrentRootSpan() {
    // This can't be correctly overridden since OTel context does not provide a way to set
    // context without a callback. Leave noop for now.
  }

  /** Gets the current root span. */
  get currentRootSpan(): oc.Span {
    return (
      getRootSpan(context.active()) ??
      new ShimSpan({
        shimTracer: this,
        otelSpan: INVALID_SPAN,
      })
    );
  }

  /**
   * Starts a root span.
   * @param options A TraceOptions object to start a root span.
   * @param fn A callback function to run after starting a root span.
   */
  startRootSpan<T>(
    { name, kind, spanContext }: oc.TraceOptions,
    fn: (root: oc.Span) => T
  ): T {
    const parentCtx =
      spanContext === undefined
        ? context.active()
        : trace.setSpanContext(context.active(), mapSpanContext(spanContext));

    const otelSpan = this.otelTracer.startSpan(
      name,
      { kind: mapSpanKind(kind) },
      parentCtx
    );
    const shimSpan = new ShimSpan({
      shimTracer: this,
      otelSpan,
      isRootSpan: true,
      kind,
      parentSpanId: trace.getSpanContext(parentCtx)?.spanId,
    });

    let ctx = trace.setSpan(parentCtx, otelSpan);
    ctx = setRootSpan(ctx, shimSpan);
    return context.with(ctx, () => fn(shimSpan));
  }

  startChildSpan(options?: oc.SpanOptions): oc.Span {
    const { kind, name = DEFAULT_SPAN_NAME, childOf } = options ?? {};
    const rootSpan = getRootSpan(context.active());

    let ctx = context.active();
    if (childOf) {
      ctx = trace.setSpanContext(ctx, mapSpanContext(childOf.spanContext));
    } else if (rootSpan) {
      ctx = trace.setSpan(ctx, rootSpan.otelSpan);
    }

    const otelSpan = this.otelTracer.startSpan(
      name,
      {
        kind: mapSpanKind(kind),
      },
      ctx
    );
    return new ShimSpan({
      shimTracer: this,
      otelSpan,
      isRootSpan: false,
      kind,
      parentSpanId: trace.getSpanContext(ctx)?.spanId,
    });
  }

  wrap<T>(fn: oc.Func<T>): oc.Func<T> {
    return context.bind(context.active(), fn);
  }

  wrapEmitter(emitter: NodeJS.EventEmitter): void {
    // Not sure if this requires returning the modified emitter
    context.bind(context.active(), emitter);
  }
}
