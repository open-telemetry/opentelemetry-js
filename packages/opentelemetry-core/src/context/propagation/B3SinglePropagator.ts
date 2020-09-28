import {
  Context,
  GetterFunction,
  TextMapPropagator,
  SetterFunction,
  TraceFlags,
} from '@opentelemetry/api';

import {
  isValidSpanId,
  isValidTraceId,
} from '@opentelemetry/api/src/trace/spancontext-utils';

import { getParentSpanContext, setExtractedSpanContext } from '../context';

export const B3_CONTEXT_HEADER = 'b3';
const B3_CONTEXT_REGEX = /(?<traceId>(?:[0-9a-f]{16}){1,2})-(?<spanId>[0-9a-f]{16})(?:-(?<sampled>[01d](?![0-9a-f])))?(?:-(?<parentSpanId>[0-9a-f]{16}))?/;
const PADDING = '0'.repeat(16);

function convertToTraceId128(traceId: string): string {
  return traceId.length == 32 ? traceId : `${PADDING}${traceId}`;
}

function convertToTraceFlags(sampled: string | undefined): TraceFlags {
  if (sampled == '1' || sampled == 'd') {
    return TraceFlags.SAMPLED;
  }
  return TraceFlags.NONE;
}

export class B3SinglePropagator implements TextMapPropagator {
  inject(context: Context, carrier: unknown, setter: SetterFunction) {
    const spanContext = getParentSpanContext(context);
    if (!spanContext) return;

    const value = `${spanContext.traceId}-${spanContext.spanId}-${spanContext.traceFlags}`;
    setter(carrier, B3_CONTEXT_HEADER, value);
  }

  extract(context: Context, carrier: unknown, getter: GetterFunction): Context {
    const header = getter(carrier, B3_CONTEXT_HEADER) as string;
    if (!header) return context;

    const match = header.match(B3_CONTEXT_REGEX);
    if (!match) return context;

    const { traceId: extractedTraceId, spanId, sampled } = match.groups!;
    const traceId = convertToTraceId128(extractedTraceId);

    if (!isValidTraceId(traceId) || !isValidSpanId(spanId)) return context;

    const traceFlags = convertToTraceFlags(sampled);

    return setExtractedSpanContext(context, {
      traceId,
      spanId,
      isRemote: true,
      traceFlags,
    });
  }
}
