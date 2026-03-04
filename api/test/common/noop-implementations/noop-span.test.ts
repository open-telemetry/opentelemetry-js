/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import * as assert from 'assert';
import {
  SpanStatusCode,
  INVALID_SPANID,
  INVALID_TRACEID,
  TraceFlags,
} from '../../../src';
import { NonRecordingSpan } from '../../../src/trace/NonRecordingSpan';

describe('NonRecordingSpan', function () {
  it('do not crash', function () {
    const span = new NonRecordingSpan();
    span.setAttribute('my_string_attribute', 'foo');
    span.setAttribute('my_number_attribute', 123);
    span.setAttribute('my_boolean_attribute', false);
    span.setAttribute('my_obj_attribute', { a: true });
    span.setAttribute('my_sym_attribute', Symbol('a'));
    span.setAttributes({
      my_string_attribute: 'foo',
      my_number_attribute: 123,
    });

    const linkContext = {
      traceId: 'e4cda95b652f4a1592b449d5929fda1b',
      spanId: '7e0c63257de34c92',
      traceFlags: TraceFlags.SAMPLED,
    };
    span.addLink({ context: linkContext });
    span.addLinks([{ context: linkContext }]);

    span.addEvent('sent');
    span.addEvent('sent', { id: '42', key: 'value' });

    span.setStatus({ code: SpanStatusCode.ERROR });

    span.updateName('my-span');

    assert.ok(!span.isRecording());
    assert.deepStrictEqual(span.spanContext(), {
      traceId: INVALID_TRACEID,
      spanId: INVALID_SPANID,
      traceFlags: TraceFlags.NONE,
    });
    span.end();
  });
});
