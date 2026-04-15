const os = require('node:os');
const { performance } = require('node:perf_hooks');
const { ROOT_CONTEXT } = require('@opentelemetry/api');

const { AsyncMetricStorage } = require('../../packages/sdk-metrics/build/src/state/AsyncMetricStorage.js');
const { MultiMetricStorage } = require('../../packages/sdk-metrics/build/src/state/MultiWritableMetricStorage.js');
const { AttributeHashMap } = require('../../packages/sdk-metrics/build/src/state/HashMap.js');
const {
  createAllowListAttributesProcessor,
} = require('../../packages/sdk-metrics/build/src/view/AttributesProcessor.js');
const { SumAggregator } = require('../../packages/sdk-metrics/build/src/aggregator/Sum.js');
const {
  createInstrumentDescriptor,
} = require('../../packages/sdk-metrics/build/src/InstrumentDescriptor.js');
const {
  InstrumentType,
} = require('../../packages/sdk-metrics/build/src/export/MetricData.js');

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

const processorInput = Array.from({ length: 4_000 }, (_, i) => createAttributes(i));

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
