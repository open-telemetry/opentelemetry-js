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
import {
  CanonicalCode,
  INVALID_SPANID,
  INVALID_TRACEID,
  NoopSpan,
  TraceFlags,
} from '../../src';

describe('NoopSpan', () => {
  it('do not crash', () => {
    const span = new NoopSpan();
    span.setAttribute('my_string_attribute', 'foo');
    span.setAttribute('my_number_attribute', 123);
    span.setAttribute('my_boolean_attribute', false);
    span.setAttribute('my_obj_attribute', { a: true });
    span.setAttribute('my_sym_attribute', Symbol('a'));
    span.setAttributes({
      my_string_attribute: 'foo',
      my_number_attribute: 123,
    });

    span.addEvent('sent');
    span.addEvent('sent', { id: '42', key: 'value' });

    span.setStatus({ code: CanonicalCode.CANCELLED });

    span.updateName('my-span');

    assert.ok(!span.isRecording());
    assert.deepStrictEqual(span.context(), {
      traceId: INVALID_TRACEID,
      spanId: INVALID_SPANID,
      traceFlags: TraceFlags.NONE,
    });
    span.end();
  });
});
