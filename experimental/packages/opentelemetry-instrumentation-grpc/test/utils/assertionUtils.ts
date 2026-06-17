/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import { SpanKind, SpanStatusCode } from '@opentelemetry/api';
import * as assert from 'assert';
import type { status as GrpcStatus } from '@grpc/grpc-js';
import type { ReadableSpan } from '@opentelemetry/sdk-trace-base';
import {
  hrTimeToMilliseconds,
  hrTimeToMicroseconds,
} from '@opentelemetry/core';

import {
  ATTR_SERVER_ADDRESS,
  ATTR_SERVER_PORT,
} from '@opentelemetry/semantic-conventions';

import {
  ATTR_RPC_GRPC_STATUS_CODE,
} from '../../src/semconv';


export const grpcStatusCodeToOpenTelemetryStatusCode = (
  status: GrpcStatus
): SpanStatusCode => {
  if (status !== undefined && status === 0) {
    return SpanStatusCode.UNSET;
  }
  return SpanStatusCode.ERROR;
};

export const assertSpan = (
  component: string,
  span: ReadableSpan,
  kind: SpanKind,
  validations: {
    name: string;
    status: GrpcStatus;
    host?: string;
    port?: number;
  },
) => {
  assert.strictEqual(span.spanContext().traceId.length, 32);
  assert.strictEqual(span.spanContext().spanId.length, 16);
  assert.strictEqual(span.kind, kind);

  assert.ok(span.endTime);
  assert.strictEqual(span.links.length, 0);

  assert.ok(
    hrTimeToMicroseconds(span.startTime) < hrTimeToMicroseconds(span.endTime)
  );
  assert.ok(hrTimeToMilliseconds(span.endTime) > 0);

  if (span.kind === SpanKind.SERVER) {
    assert.ok(span.spanContext());
  }

  if (
    span.kind === SpanKind.CLIENT &&
    validations.host !== undefined &&
    validations.port !== undefined
  ) {
    assert.strictEqual(
      span.attributes[ATTR_SERVER_ADDRESS],
      validations.host
    );
    assert.strictEqual(span.attributes[ATTR_SERVER_PORT], validations.port);
  }

  // validations
  assert.strictEqual(span.name, validations.name);
  assert.strictEqual(
    span.status.code,
    grpcStatusCodeToOpenTelemetryStatusCode(validations.status)
  );
  assert.strictEqual(
    span.attributes[ATTR_RPC_GRPC_STATUS_CODE],
    validations.status
  );
};

// Check if sourceSpan was propagated to targetSpan
export const assertPropagation = (
  incomingSpan: ReadableSpan,
  outgoingSpan: ReadableSpan
) => {
  const targetSpanContext = incomingSpan.spanContext();
  const sourceSpanContext = outgoingSpan.spanContext();
  assert.strictEqual(targetSpanContext.traceId, sourceSpanContext.traceId);
  assert.strictEqual(
    incomingSpan.parentSpanContext?.spanId,
    sourceSpanContext.spanId
  );
  assert.strictEqual(
    targetSpanContext.traceFlags,
    sourceSpanContext.traceFlags
  );
  assert.notStrictEqual(targetSpanContext.spanId, sourceSpanContext.spanId);
};
