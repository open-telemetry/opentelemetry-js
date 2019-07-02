/**
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

import * as assert from 'assert';
import { randomSpanId, randomTraceId } from '../../src/common/util/id';

describe('randomTraceId', () => {
  it('returns different 32-char hex strings', () => {
    const traceId = randomTraceId();
    assert.ok(traceId.match(/[a-f0-9]{32}/));
  });
});

describe('randomSpanId', () => {
  it('returns different 16-char hex string', () => {
    const spanId = randomSpanId();
    assert.ok(spanId.match(/[a-f0-9]{16}/));
  });
});
