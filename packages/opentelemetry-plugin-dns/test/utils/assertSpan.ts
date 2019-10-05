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

import { SpanKind, Status, CanonicalCode } from '@opentelemetry/types';
import { hrTimeToNanoseconds } from '@opentelemetry/core';
import * as assert from 'assert';
import { AttributeNames } from '../../src/enums/AttributeNames';
import { ReadableSpan } from '@opentelemetry/tracing';
import * as utils from '../../src/utils';
import { LookupAddress } from 'dns';

export const assertSpan = (
  span: ReadableSpan,
  validations: {
    addresses: LookupAddress[];
    hostname: string;
    forceStatus?: Status;
  }
) => {
  if (span.spanContext.traceId) {
    assert.strictEqual(span.spanContext.traceId.length, 32);
  }
  if (span.spanContext.spanId) {
    assert.strictEqual(span.spanContext.spanId.length, 16);
  }

  assert.strictEqual(span.kind, SpanKind.CLIENT);

  assert.strictEqual(span.attributes[AttributeNames.COMPONENT], 'dns');
  assert.strictEqual(
    span.attributes[AttributeNames.DNS_ERROR_MESSAGE],
    span.status.message
  );
  assert.strictEqual(
    span.attributes[AttributeNames.PEER_HOSTNAME],
    validations.hostname
  );

  validations.addresses.forEach((_, i) => {
    assert.strictEqual(
      span.attributes[utils.getFamilyAttribute(_.family, i)],
      _.address
    );
  });

  assert.ok(span.endTime);
  assert.strictEqual(span.links.length, 0);
  assert.strictEqual(span.events.length, 0);

  assert.deepStrictEqual(
    span.status,
    validations.forceStatus || { code: CanonicalCode.OK }
  );

  assert.ok(hrTimeToNanoseconds(span.duration), 'must have positive duration');
};
