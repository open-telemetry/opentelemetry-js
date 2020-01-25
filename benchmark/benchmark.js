'use strict';

const Benchmark = require('benchmark');
const benchmarks = require('beautify-benchmark');

Benchmark.options.maxTime = 0;

module.exports = (minSamples) => {
  Benchmark.options.minSamples = minSamples;
  const suite = new Benchmark.Suite();

  return suite
    .on('cycle', event => {
      benchmarks.add(event.target);
    })
    .on('error', event => {
      throw event.target.error;
    })
    .on('complete', function () {
      benchmarks.log();
    });
};
