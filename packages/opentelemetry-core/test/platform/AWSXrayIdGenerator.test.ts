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
import { AWSXrayIdGenerator } from '../../src/platform';

const IdGenerator = new AWSXrayIdGenerator();

describe('AWSXrayTraceId', () => {
  let TraceId1: string, TraceId2: string;
  let PrevTime: number, CurrTime: number, NextTime: number;
  beforeEach(() => {
    PrevTime = Math.floor(Date.now() / 1000);
    TraceId1 = IdGenerator.generateTraceId();
    CurrTime = parseInt(TraceId1.substring(0, 8), 16);
    NextTime = Math.floor(Date.now() / 1000);
    console.log(TraceId1.length);
    TraceId2 = IdGenerator.generateTraceId();
  });

  it('returns 32 character hex strings', () => {
    assert.ok(TraceId1.match(/[a-f0-9]{32}/));
    assert.ok(!TraceId1.match(/^0+$/));
  });

  it('returns different ids on each call', () => {
    assert.notDeepStrictEqual(TraceId1, TraceId2);
  });

  it('using current time to encode trace id', () => {
    assert.ok(CurrTime >= PrevTime);
    assert.ok(CurrTime <= NextTime);
  });
});

describe('AWSXraySpanId', () => {
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
