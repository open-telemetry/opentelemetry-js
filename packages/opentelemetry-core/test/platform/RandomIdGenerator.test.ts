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

const IdGenerator = new RandomIdGenerator();

describe('randomTraceId', () => {
  let TraceId1: string, TraceId2: string;
  beforeEach(() => {
    TraceId1 = IdGenerator.generateTraceId();
    TraceId2 = IdGenerator.generateTraceId();
  });

  it('returns 32 character hex strings', () => {
    assert.ok(TraceId1.match(/[a-f0-9]{32}/));
    assert.ok(!TraceId1.match(/^0+$/));
  });

  it('returns different ids on each call', () => {
    assert.notDeepStrictEqual(TraceId1, TraceId2);
  });
});

describe('randomSpanId', () => {
  let SpanId1: string, SpanId2: string;
  beforeEach(() => {
    SpanId1 = IdGenerator.generateSpanId();
    SpanId2 = IdGenerator.generateSpanId();
  });

  it('returns 16 character hex strings', () => {
    assert.ok(SpanId1.match(/[a-f0-9]{16}/));
    assert.ok(!SpanId1.match(/^0+$/));
  });

  it('returns different ids on each call', () => {
    assert.notDeepStrictEqual(SpanId1, SpanId2);
  });
});
