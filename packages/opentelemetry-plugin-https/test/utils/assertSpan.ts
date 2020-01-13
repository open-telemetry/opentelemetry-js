/*!
 * Copyright 2019, OpenTelemetry Authors
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

import { SpanKind } from '@opentelemetry/types';
import { hrTimeToNanoseconds } from '@opentelemetry/core';
import * as assert from 'assert';
import * as http from 'http';
import { DummyPropagation } from './DummyPropagation';
import { ReadableSpan } from '@opentelemetry/tracing';
import {
  AttributeNames,
  parseResponseStatus,
} from '@opentelemetry/plugin-http';

export const assertSpan = (
  span: ReadableSpan,
  kind: SpanKind,
  validations: {
    httpStatusCode: number;
    httpMethod: string;
    resHeaders: http.IncomingHttpHeaders;
    hostname: string;
    pathname: string;
    reqHeaders?: http.OutgoingHttpHeaders;
    path?: string | null;
    serverName?: string;
    component: string;
  }
) => {
  assert.strictEqual(span.spanContext.traceId.length, 32);
  assert.strictEqual(span.spanContext.spanId.length, 16);
  assert.strictEqual(span.kind, kind);
  assert.strictEqual(
    span.name,
    `${validations.httpMethod} ${validations.pathname}`
  );
  assert.strictEqual(
    span.attributes[AttributeNames.COMPONENT],
    validations.component
  );
  assert.strictEqual(
    span.attributes[AttributeNames.HTTP_ERROR_MESSAGE],
    span.status.message
  );
  assert.strictEqual(
    span.attributes[AttributeNames.HTTP_METHOD],
    validations.httpMethod
  );
  assert.strictEqual(
    span.attributes[AttributeNames.HTTP_TARGET],
    validations.path || validations.pathname
  );
  assert.strictEqual(
    span.attributes[AttributeNames.HTTP_STATUS_CODE],
    validations.httpStatusCode
  );
  assert.ok(span.endTime);
  assert.strictEqual(span.links.length, 0);
  assert.strictEqual(span.events.length, 0);
  assert.deepStrictEqual(
    span.status,
    parseResponseStatus(validations.httpStatusCode)
  );

  assert.ok(span.endTime, 'must be finished');
  assert.ok(hrTimeToNanoseconds(span.duration), 'must have positive duration');

  if (validations.reqHeaders) {
    const userAgent = validations.reqHeaders['user-agent'];
    if (userAgent) {
      assert.strictEqual(
        span.attributes[AttributeNames.HTTP_USER_AGENT],
        userAgent
      );
    }
  }
  if (span.kind === SpanKind.CLIENT) {
    assert.strictEqual(
      span.attributes[AttributeNames.NET_PEER_NAME],
      validations.hostname,
      'must be consistent (PEER_NAME and hostname)'
    );
    assert.ok(span.attributes[AttributeNames.NET_PEER_IP], 'must have PEER_IP');
    assert.ok(
      span.attributes[AttributeNames.NET_PEER_PORT],
      'must have PEER_PORT'
    );
    assert.ok(
      (span.attributes[AttributeNames.HTTP_URL] as string).indexOf(
        span.attributes[AttributeNames.NET_PEER_NAME] as string
      ) > -1,
      'must be consistent'
    );
  }
  if (span.kind === SpanKind.SERVER) {
    if (validations.serverName) {
      assert.strictEqual(
        span.attributes[AttributeNames.HTTP_SERVER_NAME],
        validations.serverName,
        ' must have serverName attribute'
      );
    }
    assert.ok(
      span.attributes[AttributeNames.NET_HOST_PORT],
      'must have HOST_PORT'
    );
    assert.ok(span.attributes[AttributeNames.NET_HOST_IP], 'must have HOST_IP');
    assert.strictEqual(span.parentSpanId, DummyPropagation.SPAN_CONTEXT_KEY);
  } else if (validations.reqHeaders) {
    assert.ok(validations.reqHeaders[DummyPropagation.TRACE_CONTEXT_KEY]);
    assert.ok(validations.reqHeaders[DummyPropagation.SPAN_CONTEXT_KEY]);
  }
};
