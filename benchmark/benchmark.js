'use strict';

const Benchmark = require('benchmark');
const benchmarks = require('beautify-benchmark');

Benchmark.options.maxTime = 0;
// @todo : Change it to between 50-100 or keep it random.
Benchmark.options.minSamples = 5;

module.exports = () => {
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
