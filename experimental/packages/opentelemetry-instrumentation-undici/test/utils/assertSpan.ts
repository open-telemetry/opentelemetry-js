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
import * as assert from 'assert';
// import { DummyPropagation } from './DummyPropagation';
import { SemanticAttributes } from '../../src/enums/SemanticAttributes';
import type { IncomingHttpHeaders } from 'undici/types/header';

export const assertSpan = (
  span: ReadableSpan,
  validations: {
    httpStatusCode?: number;
    httpMethod: string;
    resHeaders?: Headers | IncomingHttpHeaders;
    hostname: string;
    reqHeaders?: Headers | IncomingHttpHeaders;
    path?: string | null;
    query?: string | null;
    forceStatus?: SpanStatus;
    noNetPeer?: boolean; // we don't expect net peer info when request throw before being sent
    error?: Exception;
  }
) => {
  assert.strictEqual(span.spanContext().traceId.length, 32);
  assert.strictEqual(span.spanContext().spanId.length, 16);
  assert.strictEqual(span.kind, SpanKind.CLIENT, 'span.kind is correct');
  assert.strictEqual(span.name, `HTTP ${validations.httpMethod}`, 'span.name is correct');
  // TODO: check this
  // assert.strictEqual(
  //   span.attributes[AttributeNames.HTTP_ERROR_MESSAGE],
  //   span.status.message,
  //   `attributes['${AttributeNames.HTTP_ERROR_MESSAGE}'] is correct`,
  // );
  assert.strictEqual(
    span.attributes[SemanticAttributes.HTTP_REQUEST_METHOD],
    validations.httpMethod,
    `attributes['${SemanticAttributes.HTTP_REQUEST_METHOD}'] is correct`,
  );

  if (validations.path) {
    assert.strictEqual(
      span.attributes[SemanticAttributes.URL_PATH],
      validations.path,
      `attributes['${SemanticAttributes.URL_PATH}'] is correct`,
    );
  }

  if (validations.query) {
    assert.strictEqual(
      span.attributes[SemanticAttributes.URL_QUERY],
      validations.query,
      `attributes['${SemanticAttributes.URL_QUERY}'] is correct`,
    );
  }
  
  assert.strictEqual(
    span.attributes[SemanticAttributes.HTTP_RESPONSE_STATUS_CODE],
    validations.httpStatusCode,
    `attributes['${SemanticAttributes.HTTP_RESPONSE_STATUS_CODE}'] is correct ${span.attributes[SemanticAttributes.HTTP_RESPONSE_STATUS_CODE]}`,
  );

  assert.strictEqual(span.links.length, 0, 'there are no links');

  if (validations.error) {
    assert.strictEqual(span.events.length, 1, 'span contains one error event');
    assert.strictEqual(span.events[0].name, 'exception', 'error event name is correct');

    const eventAttributes = span.events[0].attributes;
    assert.ok(eventAttributes != null, 'event has attributes');
    assert.deepStrictEqual(Object.keys(eventAttributes), [
      'exception.type',
      'exception.message',
      'exception.stacktrace',
    ], 'the event attribute names are correct');
  } else {
    assert.strictEqual(span.events.length, 0, 'span contains no events');
  }

  const { httpStatusCode } = validations;
  const isStatusUnset = httpStatusCode && httpStatusCode >= 100 && httpStatusCode < 400;
  
  assert.deepStrictEqual(
    span.status,
    validations.forceStatus || {
      code: isStatusUnset ? SpanStatusCode.UNSET : SpanStatusCode.ERROR,
    },
    'span status is correct'
  );

  assert.ok(span.endTime, 'must be finished');
  assert.ok(hrTimeToNanoseconds(span.duration) > 0, 'must have positive duration');

  if (validations.resHeaders) {
    const contentLengthHeader = validations.resHeaders instanceof Headers ?
      validations.resHeaders.get('content-length') :
      validations.resHeaders['content-length'];
    
    if (contentLengthHeader) {
      const contentLength = Number(contentLengthHeader);
  
      assert.strictEqual(
        span.attributes['http.response.header.content-length'],
        contentLength
      );
      // TODO: check compresssed/uncompressed in semantic conventions
      // const contentEncodingHeader = validations.resHeaders.get('content-encoding');
      // if (
      //   contentEncodingHeader &&
      //   contentEncodingHeader !== 'identity'
      // ) {
      //   assert.strictEqual(
      //     span.attributes[SemanticAttributes.HTTP_RESPONSE_CONTENT_LENGTH],
      //     contentLength
      //   );
      // } else {
      //   assert.strictEqual(
      //     span.attributes[
      //       SemanticAttributes.HTTP_RESPONSE_CONTENT_LENGTH_UNCOMPRESSED
      //     ],
      //     contentLength
      //   );
      // }
    }
  }
  
  assert.strictEqual(
    span.attributes[SemanticAttributes.SERVER_ADDRESS],
    validations.hostname,
    'must be consistent (SERVER_ADDRESS and hostname)'
  );
  if (!validations.noNetPeer) {
    assert.ok(
      span.attributes[SemanticAttributes.NETWORK_PEER_ADDRESS],
      `must have ${SemanticAttributes.NETWORK_PEER_ADDRESS}`
    );
    assert.ok(
      span.attributes[SemanticAttributes.NETWORK_PEER_PORT],
      `must have ${SemanticAttributes.NETWORK_PEER_PORT}`
    );
  }
  assert.ok(
    (span.attributes[SemanticAttributes.URL_FULL] as string).indexOf(
      span.attributes[SemanticAttributes.SERVER_ADDRESS] as string
    ) > -1,
    `${SemanticAttributes.URL_FULL} & ${SemanticAttributes.SERVER_ADDRESS} must be consistent`
  );


  if (validations.reqHeaders) {
    const userAgent = validations.reqHeaders instanceof Headers ?
      validations.reqHeaders.get('user-agent') :
      validations.reqHeaders['user-agent'];
    if (userAgent) {
      assert.strictEqual(
        span.attributes[SemanticAttributes.USER_AGENT_ORIGINAL],
        userAgent
      );
    }
  }
};
