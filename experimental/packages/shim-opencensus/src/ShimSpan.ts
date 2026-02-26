/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import * as oc from '@opencensus/core';
import { ShimTracer } from './ShimTracer';
import { AttributeValue, Span, SpanStatusCode, diag } from '@opentelemetry/api';
import { mapMessageEvent, reverseMapSpanContext } from './trace-transform';

// Copied from
// https://github.com/census-instrumentation/opencensus-node/blob/v0.1.0/packages/opencensus-core/src/trace/model/span.ts#L61
export const DEFAULT_SPAN_NAME = 'span';

const STATUS_OK = {
  code: oc.CanonicalCode.OK,
};

interface Options {
  shimTracer: ShimTracer;
  otelSpan: Span;
  isRootSpan?: boolean | undefined;
  kind?: oc.SpanKind | undefined;
  parentSpanId?: string | undefined;
}

export class ShimSpan implements oc.Span {
  get id(): string {
    return this.otelSpan.spanContext().spanId;
  }

  get tracer(): oc.TracerBase {
    return this._shimTracer;
  }

  logger: oc.Logger = diag;

  /** These are not readable in OTel so we return empty values */
  attributes: oc.Attributes = {};
  annotations: oc.Annotation[] = [];
  messageEvents: oc.MessageEvent[] = [];
  spans: oc.Span[] = [];
  links: oc.Link[] = [];
  name = '';
  status: oc.Status = STATUS_OK;
  activeTraceParams: oc.TraceParams = {};
  droppedAttributesCount = 0;
  droppedLinksCount = 0;
  droppedAnnotationsCount = 0;
  droppedMessageEventsCount = 0;
  started = true;
  ended = false;
  numberOfChildren = 0;
  duration = 0;

  /** Actual private attributes */
  private _shimTracer: ShimTracer;
  readonly otelSpan: Span;
  private _isRootSpan: boolean;

  readonly kind: oc.SpanKind;
  readonly parentSpanId: string;

  get remoteParent(): boolean {
    return this.otelSpan.spanContext().isRemote ?? false;
  }

  /** Constructs a new SpanBaseModel instance. */
  constructor({
    shimTracer,
    otelSpan,
    isRootSpan = false,
    kind = oc.SpanKind.UNSPECIFIED,
    parentSpanId = '',
  }: Options) {
    this._shimTracer = shimTracer;
    this.otelSpan = otelSpan;
    this._isRootSpan = isRootSpan;
    this.kind = kind;
    this.parentSpanId = parentSpanId;
  }

  /** Returns whether a span is root or not. */
  isRootSpan(): boolean {
    return this._isRootSpan;
  }

  get traceId(): string {
    return this.otelSpan.spanContext().traceId;
  }

  /** Gets the trace state */
  get traceState(): oc.TraceState | undefined {
    return this.otelSpan.spanContext().traceState?.serialize();
  }

  /** No-op implementation of this method. */
  get startTime(): Date {
    return new Date();
  }

  /** No-op implementation of this method. */
  get endTime(): Date {
    return new Date();
  }

  /** No-op implementation of this method. */
  allDescendants(): oc.Span[] {
    return [];
  }

  /** Gives the TraceContext of the span. */
  get spanContext(): oc.SpanContext {
    return reverseMapSpanContext(this.otelSpan.spanContext());
  }

  addAttribute(key: string, value: string | number | boolean | object) {
    this.otelSpan.setAttribute(key, value as AttributeValue);
  }

  addAnnotation(
    description: string,
    attributes?: oc.Attributes,
    timestamp?: number
  ) {
    this.otelSpan.addEvent(description, attributes, timestamp);
  }

  /** No-op implementation of this method. */
  addLink() {
    diag.info(
      'Call to OpenCensus Span.addLink() is being ignored. OTel does not support ' +
        'adding links after span creation'
    );
  }

  /** No-op implementation of this method. */
  addMessageEvent(
    type: oc.MessageEventType,
    id: number,
    timestamp?: number,
    uncompressedSize?: number,
    compressedSize?: number
  ) {
    this.otelSpan.addEvent(
      ...mapMessageEvent(type, id, timestamp, uncompressedSize, compressedSize)
    );
  }

  /** No-op implementation of this method. */
  setStatus(code: oc.CanonicalCode, message?: string) {
    this.otelSpan.setStatus({
      code:
        code === oc.CanonicalCode.OK ? SpanStatusCode.OK : SpanStatusCode.ERROR,
      message,
    });
  }

  /** No-op implementation of this method. */
  start() {}

  end(): void {
    this.otelSpan.end();
  }

  /** No-op implementation of this method. */
  truncate() {}

  /** Starts a new Span instance as a child of this instance */
  startChildSpan(options?: oc.SpanOptions): oc.Span {
    return this._shimTracer.startChildSpan({
      name: DEFAULT_SPAN_NAME,
      childOf: this,
      ...options,
    });
  }
}
