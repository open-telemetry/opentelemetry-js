/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import * as oc from '@opencensus/core';
import {
  Attributes,
  SpanContext,
  SpanKind,
  TimeInput,
  diag,
} from '@opentelemetry/api';
import { TraceState } from '@opentelemetry/core';

function exhaust(value: never) {
  diag.warn('Could not handle enum value %s', value);
}

export function mapSpanKind(
  kind: oc.SpanKind | undefined
): SpanKind | undefined {
  switch (kind) {
    case undefined:
      return undefined;
    case oc.SpanKind.UNSPECIFIED:
      return SpanKind.INTERNAL;
    case oc.SpanKind.CLIENT:
      return SpanKind.CLIENT;
    case oc.SpanKind.SERVER:
      return SpanKind.SERVER;
    default:
      exhaust(kind);
      return undefined;
  }
}

export function mapSpanContext({
  spanId,
  traceId,
  options,
  traceState,
}: oc.SpanContext): SpanContext {
  return {
    spanId,
    traceId,
    traceFlags: options ?? 0,
    traceState:
      traceState === undefined ? undefined : new TraceState(traceState),
  };
}

export function reverseMapSpanContext({
  spanId,
  traceId,
  traceFlags,
  traceState,
}: SpanContext): oc.SpanContext {
  return {
    spanId: spanId,
    traceId: traceId,
    options: traceFlags,
    traceState: traceState?.serialize(),
  };
}

// Copied from Java
// https://github.com/open-telemetry/opentelemetry-java/blob/0d3a04669e51b33ea47b29399a7af00012d25ccb/opencensus-shim/src/main/java/io/opentelemetry/opencensusshim/SpanConverter.java#L24-L27
const MESSAGE_EVENT_ATTRIBUTE_KEY_TYPE = 'message.event.type';
const MESSAGE_EVENT_ATTRIBUTE_KEY_SIZE_UNCOMPRESSED =
  'message.event.size.uncompressed';
const MESSAGE_EVENT_ATTRIBUTE_KEY_SIZE_COMPRESSED =
  'message.event.size.compressed';

export function mapMessageEvent(
  type: oc.MessageEventType,
  id: number,
  timestamp?: number,
  uncompressedSize?: number,
  compressedSize?: number
): [string, Attributes, TimeInput | undefined] {
  const attributes: Attributes = {
    [MESSAGE_EVENT_ATTRIBUTE_KEY_TYPE]: oc.MessageEventType[type],
  };
  if (uncompressedSize !== undefined) {
    attributes[MESSAGE_EVENT_ATTRIBUTE_KEY_SIZE_UNCOMPRESSED] =
      uncompressedSize;
  }
  if (compressedSize !== undefined) {
    attributes[MESSAGE_EVENT_ATTRIBUTE_KEY_SIZE_COMPRESSED] = compressedSize;
  }

  return [id.toString(), attributes, timestamp];
}
