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

import { B3_DEBUG_FLAG_KEY } from './b3-common';

import { getParentSpanContext, setExtractedSpanContext } from '../context';
import { isSpanContextValid } from '@opentelemetry/api/build/src/trace/spancontext-utils';

export const B3_CONTEXT_HEADER = 'b3';
const B3_CONTEXT_REGEX = /(?<traceId>(?:[0-9a-f]{16}){1,2})-(?<spanId>[0-9a-f]{16})(?:-(?<samplingState>[01d](?![0-9a-f])))?(?:-(?<parentSpanId>[0-9a-f]{16}))?/;
const PADDING = '0'.repeat(16);
const SAMPLED_VALUES = new Set(['d', '1']);
const DEBUG_STATE = 'd';

function convertToTraceId128(traceId: string): string {
  return traceId.length == 32 ? traceId : `${PADDING}${traceId}`;
}

function convertToTraceFlags(samplingState: string | undefined): TraceFlags {
  if (samplingState && SAMPLED_VALUES.has(samplingState)) {
    return TraceFlags.SAMPLED;
  }
  return TraceFlags.NONE;
}

export class B3SinglePropagator implements TextMapPropagator {
  inject(context: Context, carrier: unknown, setter: SetterFunction) {
    const spanContext = getParentSpanContext(context);
    if (!spanContext || !isSpanContextValid(spanContext)) return;

    const samplingState =
      context.getValue(B3_DEBUG_FLAG_KEY) || spanContext.traceFlags & 0x1;
    const value = `${spanContext.traceId}-${spanContext.spanId}-${samplingState}`;
    setter(carrier, B3_CONTEXT_HEADER, value);
  }

  extract(context: Context, carrier: unknown, getter: GetterFunction): Context {
    const header = getter(carrier, B3_CONTEXT_HEADER) as string;
    if (!header) return context;

    const match = header.match(B3_CONTEXT_REGEX);
    if (!match) return context;

    const { traceId: extractedTraceId, spanId, samplingState } = match.groups!;
    const traceId = convertToTraceId128(extractedTraceId);

    if (!isValidTraceId(traceId) || !isValidSpanId(spanId)) return context;

    const traceFlags = convertToTraceFlags(samplingState);

    if (samplingState === DEBUG_STATE) {
      context = context.setValue(B3_DEBUG_FLAG_KEY, samplingState);
    }

    return setExtractedSpanContext(context, {
      traceId,
      spanId,
      isRemote: true,
      traceFlags,
    });
  }
}
