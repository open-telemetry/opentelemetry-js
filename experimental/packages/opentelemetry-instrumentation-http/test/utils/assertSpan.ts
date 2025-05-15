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
  ATTR_HTTP_METHOD,
  ATTR_HTTP_REQUEST_CONTENT_LENGTH,
  ATTR_HTTP_REQUEST_CONTENT_LENGTH_UNCOMPRESSED,
  ATTR_HTTP_RESPONSE_CONTENT_LENGTH,
  ATTR_HTTP_RESPONSE_CONTENT_LENGTH_UNCOMPRESSED,
  ATTR_HTTP_SCHEME,
  ATTR_HTTP_SERVER_NAME,
  ATTR_HTTP_STATUS_CODE,
  ATTR_HTTP_TARGET,
  ATTR_HTTP_URL,
  ATTR_HTTP_USER_AGENT,
  ATTR_NET_HOST_IP,
  ATTR_NET_HOST_PORT,
  ATTR_NET_PEER_IP,
  ATTR_NET_PEER_NAME,
  ATTR_NET_PEER_PORT,
} from '../../src/semconv';
import * as assert from 'assert';
import * as http from 'http';
import * as utils from '../../src/utils';
import { DummyPropagation } from './DummyPropagation';
import { AttributeNames } from '../../src/enums/AttributeNames';

export const assertSpan = (
  span: ReadableSpan,
  kind: SpanKind,
  validations: {
    httpStatusCode?: number;
    httpMethod: string;
    resHeaders: http.IncomingHttpHeaders;
    hostname: string;
    pathname: string;
    reqHeaders?: http.OutgoingHttpHeaders;
    path?: string | null;
    forceStatus?: SpanStatus;
    serverName?: string;
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
    span.attributes[AttributeNames.HTTP_ERROR_MESSAGE],
    span.status.message
  );
  assert.strictEqual(span.attributes[ATTR_HTTP_METHOD], validations.httpMethod);

  assert.strictEqual(
    span.attributes[ATTR_HTTP_TARGET],
    validations.path || validations.pathname
  );
  assert.strictEqual(
    span.attributes[ATTR_HTTP_STATUS_CODE],
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

  if (validations.reqHeaders) {
    const userAgent = validations.reqHeaders['user-agent'];
    if (userAgent) {
      assert.strictEqual(span.attributes[ATTR_HTTP_USER_AGENT], userAgent);
    }
  }

  if (span.kind === SpanKind.CLIENT) {
    if (validations.resHeaders['content-length']) {
      const contentLength = Number(validations.resHeaders['content-length']);

      if (
        validations.resHeaders['content-encoding'] &&
        validations.resHeaders['content-encoding'] !== 'identity'
      ) {
        assert.strictEqual(
          span.attributes[ATTR_HTTP_RESPONSE_CONTENT_LENGTH],
          contentLength
        );
      } else {
        assert.strictEqual(
          span.attributes[ATTR_HTTP_RESPONSE_CONTENT_LENGTH_UNCOMPRESSED],
          contentLength
        );
      }
    }
    assert.strictEqual(
      span.attributes[ATTR_NET_PEER_NAME],
      validations.hostname,
      'must be consistent (PEER_NAME and hostname)'
    );
    if (!validations.noNetPeer) {
      assert.ok(span.attributes[ATTR_NET_PEER_IP], 'must have PEER_IP');
      assert.ok(span.attributes[ATTR_NET_PEER_PORT], 'must have PEER_PORT');
    }
    assert.ok(
      (span.attributes[ATTR_HTTP_URL] as string).indexOf(
        span.attributes[ATTR_NET_PEER_NAME] as string
      ) > -1,
      'must be consistent'
    );
  }
  if (span.kind === SpanKind.SERVER) {
    if (validations.reqHeaders && validations.reqHeaders['content-length']) {
      const contentLength = validations.reqHeaders['content-length'];

      if (
        validations.reqHeaders['content-encoding'] &&
        validations.reqHeaders['content-encoding'] !== 'identity'
      ) {
        assert.strictEqual(
          span.attributes[ATTR_HTTP_REQUEST_CONTENT_LENGTH],
          contentLength
        );
      } else {
        assert.strictEqual(
          span.attributes[ATTR_HTTP_REQUEST_CONTENT_LENGTH_UNCOMPRESSED],
          contentLength
        );
      }
    }
    if (validations.serverName) {
      assert.strictEqual(
        span.attributes[ATTR_HTTP_SERVER_NAME],
        validations.serverName,
        ' must have serverName attribute'
      );
      assert.ok(span.attributes[ATTR_NET_HOST_PORT], 'must have HOST_PORT');
      assert.ok(span.attributes[ATTR_NET_HOST_IP], 'must have HOST_IP');
    }
    assert.strictEqual(
      span.attributes[ATTR_HTTP_SCHEME],
      validations.component,
      ' must have http.scheme attribute'
    );
    assert.ok(typeof span.parentSpanContext?.spanId === 'string');
    assert.ok(isValidSpanId(span.parentSpanContext.spanId));
  } else if (validations.reqHeaders) {
    assert.ok(validations.reqHeaders[DummyPropagation.TRACE_CONTEXT_KEY]);
    assert.ok(validations.reqHeaders[DummyPropagation.SPAN_CONTEXT_KEY]);
  }
};
