/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import * as Benchmark from 'benchmark';
import { RandomIdGenerator } from '../../src/platform';

const idGenerator = new RandomIdGenerator();

describe('RandomIdGenerator benchmark (browser)', function () {
  it('generateTraceId (browser)', async () => {
    await new Promise<void>(resolve => {
      const suite = new Benchmark.Suite();
      suite
        .add('generateTraceId (browser)', () => idGenerator.generateTraceId())
        .on('cycle', (event: Benchmark.Event) =>
          console.log(String(event.target))
        )
        .on('complete', () => resolve())
        .run({ async: true });
    });
  });

  it('generateSpanId (browser)', async () => {
    await new Promise<void>(resolve => {
      const suite = new Benchmark.Suite();
      suite
        .add('generateSpanId (browser)', () => idGenerator.generateSpanId())
        .on('cycle', (event: Benchmark.Event) =>
          console.log(String(event.target))
        )
        .on('complete', () => resolve())
        .run({ async: true });
    });
  });
});
