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
  isValidSpanId,
  SpanKind,
  SpanStatus,
  Exception,
} from '@opentelemetry/api';
import { hrTimeToNanoseconds } from '@opentelemetry/core';
import { ReadableSpan } from '@opentelemetry/sdk-trace-base';
import {
  ATTR_HTTP_REQUEST_METHOD,
  ATTR_HTTP_RESPONSE_STATUS_CODE,
  ATTR_NETWORK_PEER_ADDRESS,
  ATTR_SERVER_ADDRESS,
  ATTR_SERVER_PORT,
  ATTR_URL_FULL,
  ATTR_URL_SCHEME,
  ATTR_USER_AGENT_ORIGINAL,
  ATTR_URL_PATH,
} from '@opentelemetry/semantic-conventions';
import * as assert from 'assert';
import * as http from 'http';
import * as utils from '../../src/utils';
import { DummyPropagation } from './DummyPropagation';

export const assertSpan = (
  span: ReadableSpan,
  kind: SpanKind,
  validations: {
    httpStatusCode?: number;
    httpMethod: string;
    resHeaders: http.IncomingHttpHeaders;
    hostname: string;
    pathname?: string;
    reqHeaders?: http.OutgoingHttpHeaders;
    path?: string | null;
    forceStatus?: SpanStatus;
    component: string;
    noNetPeer?: boolean; // we don't expect net peer info when request throw before being sent
    error?: Exception;
  }
) => {
  assert.strictEqual(span.spanContext().traceId.length, 32);
  assert.strictEqual(span.spanContext().spanId.length, 16);
  assert.strictEqual(span.kind, kind);
  assert.strictEqual(span.name, validations.httpMethod);

  assert.strictEqual(
    span.attributes[ATTR_HTTP_REQUEST_METHOD],
    validations.httpMethod
  );

  assert.strictEqual(
    span.attributes[ATTR_HTTP_RESPONSE_STATUS_CODE],
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

  assert.deepStrictEqual(
    span.status,
    validations.forceStatus || {
      code: utils.parseResponseStatus(span.kind, validations.httpStatusCode),
    }
  );

  assert.ok(span.endTime, 'must be finished');
  assert.ok(hrTimeToNanoseconds(span.duration), 'must have positive duration');

  if (span.kind === SpanKind.CLIENT) {
    assert.strictEqual(
      span.attributes[ATTR_SERVER_ADDRESS],
      validations.hostname,
      'must be consistent (PEER_NAME and hostname)'
    );
    if (!validations.noNetPeer) {
      assert.ok(
        span.attributes[ATTR_NETWORK_PEER_ADDRESS],
        'must have PEER_IP'
      );
      assert.ok(span.attributes[ATTR_SERVER_PORT], 'must have PEER_PORT');
    }
    assert.ok(
      (span.attributes[ATTR_URL_FULL] as string).indexOf(
        span.attributes[ATTR_SERVER_ADDRESS] as string
      ) > -1,
      'must be consistent'
    );
  }
  if (span.kind === SpanKind.SERVER) {
    assert.strictEqual(
      span.attributes[ATTR_URL_SCHEME],
      validations.component,
      ' must have http.scheme attribute'
    );
    assert.ok(typeof span.parentSpanContext?.spanId === 'string');
    assert.ok(isValidSpanId(span.parentSpanContext.spanId));

    assert.strictEqual(
      span.attributes[ATTR_URL_PATH],
      validations.path || validations.pathname
    );

    if (validations.reqHeaders) {
      const userAgent = validations.reqHeaders['user-agent'];
      if (userAgent) {
        assert.strictEqual(
          span.attributes[ATTR_USER_AGENT_ORIGINAL],
          userAgent
        );
      }
    }
  } else if (validations.reqHeaders) {
    assert.ok(validations.reqHeaders[DummyPropagation.TRACE_CONTEXT_KEY]);
    assert.ok(validations.reqHeaders[DummyPropagation.SPAN_CONTEXT_KEY]);
  }
};
