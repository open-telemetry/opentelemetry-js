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
import {
  SpanKind,
  SpanStatus,
  Exception,
  SpanStatusCode,
} from '@opentelemetry/api';
import { hrTimeToNanoseconds } from '@opentelemetry/core';
import { ReadableSpan } from '@opentelemetry/sdk-trace-base';
import { SemanticAttributes } from '@opentelemetry/semantic-conventions';
import * as assert from 'assert';
// import { DummyPropagation } from './DummyPropagation';
import { AttributeNames } from '../../src/enums/AttributeNames';

export const assertSpan = (
  span: ReadableSpan,
  validations: {
    httpStatusCode?: number;
    httpMethod: string;
    resHeaders: Headers;
    hostname: string;
    pathname: string;
    reqHeaders?: Headers;
    path?: string | null;
    forceStatus?: SpanStatus;
    serverName?: string;
    noNetPeer?: boolean; // we don't expect net peer info when request throw before being sent
    error?: Exception;
  }
) => {
  assert.strictEqual(span.spanContext().traceId.length, 32);
  assert.strictEqual(span.spanContext().spanId.length, 16);
  assert.strictEqual(span.kind, SpanKind.CLIENT, 'span.kind is correct');
  assert.strictEqual(span.name, `HTTP ${validations.httpMethod}`, 'span.name is correct');
  assert.strictEqual(
    span.attributes[AttributeNames.HTTP_ERROR_MESSAGE],
    span.status.message,
    `attributes['${AttributeNames.HTTP_ERROR_MESSAGE}'] is correct`,
  );
  assert.strictEqual(
    span.attributes[SemanticAttributes.HTTP_METHOD],
    validations.httpMethod,
    `attributes['${SemanticAttributes.HTTP_METHOD}'] is correct`,
  );
  assert.strictEqual(
    span.attributes[SemanticAttributes.HTTP_TARGET],
    validations.path || validations.pathname,
    `attributes['${SemanticAttributes.HTTP_TARGET}'] is correct`,
  );
  assert.strictEqual(
    span.attributes[SemanticAttributes.HTTP_STATUS_CODE],
    validations.httpStatusCode
  );

  assert.strictEqual(span.links.length, 0);

  if (validations.error) {
    assert.strictEqual(span.events.length, 1);
    assert.strictEqual(span.events[0].name, 'exception');

    const eventAttributes = span.events[0].attributes;
    assert.ok(eventAttributes != null);
    assert.deepStrictEqual(Object.keys(eventAttributes), [
      'exception.type',
      'exception.message',
      'exception.stacktrace',
    ]);
  } else {
    assert.strictEqual(span.events.length, 0);
  }

  const { httpStatusCode } = validations;
  const isStatusUnset = httpStatusCode && httpStatusCode >= 100 && httpStatusCode < 400;
  
  assert.deepStrictEqual(
    span.status,
    validations.forceStatus || {
      code: isStatusUnset ? SpanStatusCode.UNSET : SpanStatusCode.ERROR
    },
  );

  assert.ok(span.endTime, 'must be finished');
  assert.ok(hrTimeToNanoseconds(span.duration) > 0, 'must have positive duration');

  const contentLengthHeader = validations.resHeaders.get('content-length');
  if (contentLengthHeader) {
    const contentLength = Number(contentLengthHeader);

    const contentEncodingHeader = validations.resHeaders.get('content-encoding');
    if (
      contentEncodingHeader &&
      contentEncodingHeader !== 'identity'
    ) {
      assert.strictEqual(
        span.attributes[SemanticAttributes.HTTP_RESPONSE_CONTENT_LENGTH],
        contentLength
      );
    } else {
      assert.strictEqual(
        span.attributes[
          SemanticAttributes.HTTP_RESPONSE_CONTENT_LENGTH_UNCOMPRESSED
        ],
        contentLength
      );
    }
  }
  assert.strictEqual(
    span.attributes[SemanticAttributes.NET_PEER_NAME],
    validations.hostname,
    'must be consistent (PEER_NAME and hostname)'
  );
  if (!validations.noNetPeer) {
    assert.ok(
      span.attributes[SemanticAttributes.NET_PEER_IP],
      'must have PEER_IP'
    );
    assert.ok(
      span.attributes[SemanticAttributes.NET_PEER_PORT],
      'must have PEER_PORT'
    );
  }
  assert.ok(
    (span.attributes[SemanticAttributes.HTTP_URL] as string).indexOf(
      span.attributes[SemanticAttributes.NET_PEER_NAME] as string
    ) > -1,
    'must be consistent'
  );


  if (validations.reqHeaders) {
    const userAgent = validations.reqHeaders.get('user-agent');
    if (userAgent) {
      assert.strictEqual(
        span.attributes[SemanticAttributes.HTTP_USER_AGENT],
        userAgent
      );
    }
    // assert.ok(validations.reqHeaders[DummyPropagation.TRACE_CONTEXT_KEY]);
    // assert.ok(validations.reqHeaders[DummyPropagation.SPAN_CONTEXT_KEY]);
  }
};
