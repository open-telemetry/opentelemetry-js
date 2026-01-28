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
import { RandomIdGenerator } from '../../src/platform';

const idGenerator = new RandomIdGenerator();

describe('RandomIdGenerator benchmark (browser)', function () {
  this.timeout(60000);

  it('generateTraceId (browser)', done => {
    const suite = new Benchmark.Suite();
    suite
      .add('generateTraceId (browser)', () => idGenerator.generateTraceId())
      .on('cycle', (event: Benchmark.Event) =>
        console.log(String(event.target))
      )
      .on('complete', () => done())
      .run({ async: true });
  });

  it('generateSpanId (browser)', done => {
    const suite = new Benchmark.Suite();
    suite
      .add('generateSpanId (browser)', () => idGenerator.generateSpanId())
      .on('cycle', (event: Benchmark.Event) =>
        console.log(String(event.target))
      )
      .on('complete', () => done())
      .run({ async: true });
  });
});
