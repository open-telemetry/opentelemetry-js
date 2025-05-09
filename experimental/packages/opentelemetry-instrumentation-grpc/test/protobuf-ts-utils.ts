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
import { Span, SpanKind } from '@opentelemetry/api';
import * as assert from 'assert';

import {
  InMemorySpanExporter,
  ReadableSpan,
} from '@opentelemetry/sdk-trace-base';
import { assertPropagation, assertSpan } from './utils/assertionUtils';

import { ATTR_RPC_METHOD, ATTR_RPC_SERVICE } from '../src/semconv';

export type SpanAssertionFunction = (
  exporter: InMemorySpanExporter,
  rpcService: string,
  rpcMethod: string,
  expectedSpanStatus: number,
  rootSpan?: Span
) => void;

export type TestFunction = (
  input: number,
  errorKey: string,
  expectedResultCode: number,
  assertSpans: SpanAssertionFunction
) => void;

function validateSpans(
  clientSpan: ReadableSpan,
  serverSpan: ReadableSpan,
  rpcService: string,
  rpcMethod: string,
  status: number
) {
  const validations = {
    name: `grpc.${rpcService}/${rpcMethod}`,
    netPeerName: 'localhost',
    status: status,
    netPeerPort: 3333,
  };

  assert.strictEqual(
    clientSpan.spanContext().traceId,
    serverSpan.spanContext().traceId
  );
  assertPropagation(serverSpan, clientSpan);

  assertSpan('grpc', serverSpan, SpanKind.SERVER, validations);
  assertSpan('grpc', clientSpan, SpanKind.CLIENT, validations);
  assert.strictEqual(clientSpan.attributes[ATTR_RPC_METHOD], rpcMethod);
  assert.strictEqual(clientSpan.attributes[ATTR_RPC_SERVICE], rpcService);
}

export function assertNoSpansExported(
  exporter: InMemorySpanExporter,
  _rpcService: string,
  _rpcMethod: string,
  _expectedSpanStatus: number,
  _rootSpan?: Span
) {
  const spans = exporter.getFinishedSpans();
  assert.strictEqual(spans.length, 0);
}

export function assertExportedSpans(
  exporter: InMemorySpanExporter,
  rpcService: string,
  rpcMethod: string,
  expectedSpanStatus: number,
  rootSpan?: Span
) {
  const spans = exporter.getFinishedSpans();
  assert.strictEqual(spans.length, 2);
  const serverSpan = spans[0];
  const clientSpan = spans[1];

  validateSpans(
    clientSpan,
    serverSpan,
    rpcService,
    rpcMethod,
    expectedSpanStatus
  );

  if (rootSpan) {
    assert.strictEqual(
      rootSpan?.spanContext().traceId,
      serverSpan.spanContext().traceId
    );
    assert.strictEqual(
      rootSpan?.spanContext().spanId,
      clientSpan.parentSpanContext?.spanId
    );
  }
}
