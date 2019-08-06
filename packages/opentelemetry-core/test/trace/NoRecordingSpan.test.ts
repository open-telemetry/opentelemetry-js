import * as assert from 'assert';
import { NoRecordingSpan } from '../../src/trace/NoRecordingSpan';
import { TraceOptions } from '@opentelemetry/types';

describe('NoRecordingSpan', () => {
  it('propagates span contexts', () => {
    const spanContext = {
      traceId: 'd4cda95b652f4a1592b449d5929fda1b',
      spanId: '6e0c63257de34c92',
      traceOptions: TraceOptions.UNSAMPLED,
    };

    const span = new NoRecordingSpan(spanContext);
    assert.strictEqual(span.context(), spanContext);
    span.end();
  });
});
