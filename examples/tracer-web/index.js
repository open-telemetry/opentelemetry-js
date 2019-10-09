import { WebTracer } from '@opentelemetry/web';

import * as shimmer from 'shimmer';

class Tester {
  constructor() {
  }
  add(name) {
    console.log('calling add', name);
  }
}

const tester = new Tester();

const webTracer = new WebTracer();
const span = webTracer.startSpan('span1');

shimmer.wrap(Tester.prototype, 'add', (originalFunction) => {
  return function patchedFunction() {
    try {
      span.addEvent('start');
    } catch (e) {
      console.log('error', e);
    } finally {
      const result = originalFunction.apply(this, arguments);
      span.addEvent('after call');
      span.end();
      return result;
    }
  };
});

webTracer.withSpan(span, function () {
  console.log(this === span);
});

tester.add('foo');
console.log(span);
