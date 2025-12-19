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

import * as Benchmark from 'benchmark';
import { BasicTracerProvider } from '../../src';

const tracerProvider = new BasicTracerProvider();
const tracer = tracerProvider.getTracer('test');

describe('Span benchmark', function () {
  this.timeout(60000);

  it('create spans (10 attributes)', done => {
    const suite = new Benchmark.Suite();
    suite
      .add('create spans (10 attributes)', () => {
        const span = tracer.startSpan('span');
        span.setAttribute('aaaaaaaaaaaaaaaaaaaa', 'aaaaaaaaaaaaaaaaaaaa');
        span.setAttribute('bbbbbbbbbbbbbbbbbbbb', 'aaaaaaaaaaaaaaaaaaaa');
        span.setAttribute('cccccccccccccccccccc', 'aaaaaaaaaaaaaaaaaaaa');
        span.setAttribute('dddddddddddddddddddd', 'aaaaaaaaaaaaaaaaaaaa');
        span.setAttribute('eeeeeeeeeeeeeeeeeeee', 'aaaaaaaaaaaaaaaaaaaa');
        span.setAttribute('ffffffffffffffffffff', 'aaaaaaaaaaaaaaaaaaaa');
        span.setAttribute('gggggggggggggggggggg', 'aaaaaaaaaaaaaaaaaaaa');
        span.setAttribute('hhhhhhhhhhhhhhhhhhhh', 'aaaaaaaaaaaaaaaaaaaa');
        span.setAttribute('iiiiiiiiiiiiiiiiiiii', 'aaaaaaaaaaaaaaaaaaaa');
        span.setAttribute('jjjjjjjjjjjjjjjjjjjj', 'aaaaaaaaaaaaaaaaaaaa');
        span.end();
      })
      .on('cycle', (event: Benchmark.Event) =>
        console.log(String(event.target))
      )
      .on('complete', () => done())
      .run({ async: true });
  });
});
