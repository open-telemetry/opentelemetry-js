import * as assert from 'assert';
import { NoopTracer } from '../../src/trace/NoopTracer';
import { NoopTracerFactory } from '../../src/trace/NoopTracerFactory';
import { NOOP_SPAN } from '../../src/trace/NoopSpan';

describe('NoopTracerFactory', () => {
  it('should return a NOOP_SPAN', () => {
    const factory = new NoopTracerFactory();
    const span = factory.getTracer().startSpan('my-span')
    assert.deepStrictEqual(span, NOOP_SPAN);
  })
})
