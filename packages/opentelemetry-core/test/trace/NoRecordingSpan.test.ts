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

import * as assert from 'assert';
import { NoRecordingSpan } from '../../src/trace/NoRecordingSpan';
import { TraceFlags } from '@opentelemetry/api';

describe('NoRecordingSpan', () => {
  it('propagates span contexts', () => {
    const spanContext = {
      traceId: new Uint8Array([0xd4, 0xcd, 0xa9, 0x5b, 0x65, 0x2f, 0x4a, 0x15, 0x92, 0xb4, 0x49, 0xd5, 0x92, 0x9f, 0xda, 0x1b]),
      spanId: new Uint8Array([0x6e, 0x0c, 0x63, 0x25, 0x7d, 0xe3, 0x4c, 0x92]),
      traceFlags: TraceFlags.UNSAMPLED,
    };

    const span = new NoRecordingSpan(spanContext);
    assert.strictEqual(span.context(), spanContext);
    span.end();
  });
});
