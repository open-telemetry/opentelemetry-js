/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

const Benchmark = require('benchmark');
const { ROOT_CONTEXT } = require('@opentelemetry/api');

const { AsyncMetricStorage } = require('../../../build/src/state/AsyncMetricStorage.js');
const { MultiMetricStorage } = require('../../../build/src/state/MultiWritableMetricStorage.js');
const { AttributeHashMap } = require('../../../build/src/state/HashMap.js');
const {
  createAllowListAttributesProcessor,
} = require('../../../build/src/view/AttributesProcessor.js');
const { SumAggregator } = require('../../../build/src/aggregator/Sum.js');
const {
  createInstrumentDescriptor,
} = require('../../../build/src/InstrumentDescriptor.js');
const { InstrumentType } = require('../../../build/src/export/MetricData.js');

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

const asyncMeasurements = new AttributeHashMap();
for (let i = 0; i < 4_000; i++) {
  asyncMeasurements.set(createAttributes(i), i + 1);
}
let observationNanos = 0;
const asyncStorage = new AsyncMetricStorage(
  createInstrumentDescriptor('bench.async.storage', InstrumentType.OBSERVABLE_GAUGE),
  new SumAggregator(false),
  attributeProcessor,
  [],
  10_000
);

class FakeWritableMetricStorage {
  constructor() {
    this.total = 0;
  }

  record(value, attributes) {
    this.total += value + attributes.service.length + attributes.method.length;
  }
}

const fanoutStorages = Array.from({ length: 8 }, () => new FakeWritableMetricStorage());
const multiStorage = new MultiMetricStorage(fanoutStorages);
const fanoutAttributes = {
  service: 'checkout',
  method: 'POST',
  region: 'us-east-1',
};

const suite = new Benchmark.Suite();

suite.on('cycle', event => {
  console.log(String(event.target));
});

suite.add('AllowListProcessor.process x 4k', () => {
  for (const attributes of processorInput) {
    attributeProcessor.process(attributes);
  }
});

suite.add('AsyncMetricStorage.record x 4k', () => {
  observationNanos += 1;
  asyncStorage.record(asyncMeasurements, [0, observationNanos]);
});

suite.add('MultiMetricStorage.record x 50k', () => {
  for (const storage of fanoutStorages) {
    storage.total = 0;
  }
  for (let i = 0; i < 50_000; i++) {
    multiStorage.record(i, fanoutAttributes, ROOT_CONTEXT, [0, i]);
  }
});

suite.run();
