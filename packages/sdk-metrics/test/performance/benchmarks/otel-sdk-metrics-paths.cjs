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

const os = require('node:os');
const { performance } = require('node:perf_hooks');
const { ROOT_CONTEXT } = require('@opentelemetry/api');

const { AsyncMetricStorage } = require('../../../dist/state/AsyncMetricStorage.cjs');
const { MultiMetricStorage } = require('../../../dist/state/MultiWritableMetricStorage.cjs');
const { AttributeHashMap } = require('../../../dist/state/HashMap.cjs');
const {
  createAllowListAttributesProcessor,
} = require('../../../dist/view/AttributesProcessor.cjs');
const { SumAggregator } = require('../../../dist/aggregator/Sum.cjs');
const {
  createInstrumentDescriptor,
} = require('../../../dist/InstrumentDescriptor.cjs');
const {
  InstrumentType,
} = require('../../../dist/export/MetricData.cjs');

let sink = 0;

function median(values) {
  const copy = [...values].sort((a, b) => a - b);
  const mid = Math.floor(copy.length / 2);
  return copy.length % 2 === 0
    ? (copy[mid - 1] + copy[mid]) / 2
    : copy[mid];
}

function benchmark(name, fn, { warmup = 5, rounds = 7, iterations = 20 }) {
  for (let i = 0; i < warmup; i++) {
    sink ^= fn() & 0xffff;
  }

  const perIterationMs = [];

  for (let round = 0; round < rounds; round++) {
    let checksum = 0;
    const start = performance.now();
    for (let i = 0; i < iterations; i++) {
      checksum += fn();
    }
    const elapsed = performance.now() - start;
    sink ^= checksum & 0xffff;
    perIterationMs.push(elapsed / iterations);
  }

  const medianMs = median(perIterationMs);
  return { name, medianMs, opsPerSec: 1000 / medianMs };
}

function printResult(title, result) {
  console.log(`\n${title}`);
  console.log(`  ${result.name.padEnd(34)} ${result.medianMs.toFixed(3)} ms/op`);
  console.log(`  ${result.opsPerSec.toFixed(2)} ops/sec`);
}

function createAttributes(index) {
  return {
    service: `svc-${index % 16}`,
    route: `/users/${index}`,
    method: index % 2 === 0 ? 'GET' : 'POST',
    region: `us-${index % 4}`,
    ignoredA: `a-${index}`,
    ignoredB: `b-${index % 32}`,
    ignoredC: `c-${index % 8}`,
    ignoredD: `d-${index % 64}`,
  };
}

const attributeProcessor = createAllowListAttributesProcessor([
  'service',
  'route',
  'method',
  'region',
]);

const processorInput = Array.from({ length: 4_000 }, (_, i) =>
  createAttributes(i)
);

const allowListProcessorBench = benchmark(
  'AllowListProcessor.process x 4k',
  () => {
    let count = 0;
    for (const attributes of processorInput) {
      count += Object.keys(attributeProcessor.process(attributes)).length;
    }
    return count;
  },
  { iterations: 10 }
);

const asyncMeasurements = new AttributeHashMap();
for (let i = 0; i < 4_000; i++) {
  asyncMeasurements.set(createAttributes(i), i + 1);
}
const asyncStorage = new AsyncMetricStorage(
  createInstrumentDescriptor(
    'bench.async.storage',
    InstrumentType.OBSERVABLE_GAUGE
  ),
  new SumAggregator(false),
  attributeProcessor,
  [],
  10_000
);
let observationNanos = 0;
const asyncStorageBench = benchmark(
  'AsyncMetricStorage.record x 4k',
  () => {
    observationNanos += 1;
    asyncStorage.record(asyncMeasurements, [0, observationNanos]);
    return asyncMeasurements.size;
  },
  { iterations: 10 }
);

class FakeWritableMetricStorage {
  constructor() {
    this.total = 0;
  }

  record(value, attributes) {
    this.total += value + attributes.service.length + attributes.method.length;
  }
}

const fanoutStorages = Array.from(
  { length: 8 },
  () => new FakeWritableMetricStorage()
);
const multiStorage = new MultiMetricStorage(fanoutStorages);
const fanoutAttributes = {
  service: 'checkout',
  method: 'POST',
  region: 'us-east-1',
};
const multiStorageBench = benchmark(
  'MultiMetricStorage.record x 50k',
  () => {
    for (const storage of fanoutStorages) {
      storage.total = 0;
    }
    for (let i = 0; i < 50_000; i++) {
      multiStorage.record(i, fanoutAttributes, ROOT_CONTEXT, [0, i]);
    }
    return fanoutStorages[0].total;
  },
  { iterations: 5 }
);

console.log('OpenTelemetry SDK benchmark');
console.log(`Node: ${process.version}`);
console.log(`CPU: ${os.cpus()[0]?.model ?? 'unknown'}`);
printResult('sdk-metrics allow-list attribute processing', allowListProcessorBench);
printResult('sdk-metrics async observable accumulation', asyncStorageBench);
printResult('sdk-metrics sync fan-out recording', multiStorageBench);
console.log(`\nIgnore this checksum: ${sink}`);
