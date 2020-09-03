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
import * as assert from 'assert';
import { RandomIdGenerator } from '../../src/platform';

const idGenerator = new RandomIdGenerator();

describe('randomTraceId', () => {
  let traceId1: string, traceId2: string;
  beforeEach(() => {
    traceId1 = idGenerator.generateTraceId();
    traceId2 = idGenerator.generateTraceId();
  });

  it('returns 32 character hex strings', () => {
    assert.ok(traceId1.match(/[a-f0-9]{32}/));
    assert.ok(!traceId1.match(/^0+$/));
  });

  it('returns different ids on each call', () => {
    assert.notDeepStrictEqual(traceId1, traceId2);
  });
});

describe('randomSpanId', () => {
  let spanId1: string, spanId2: string;
  beforeEach(() => {
    spanId1 = idGenerator.generateSpanId();
    spanId2 = idGenerator.generateSpanId();
  });

  it('returns 16 character hex strings', () => {
    assert.ok(spanId1.match(/[a-f0-9]{16}/));
    assert.ok(!spanId1.match(/^0+$/));
  });

  it('returns different ids on each call', () => {
    assert.notDeepStrictEqual(spanId1, spanId2);
  });
});
