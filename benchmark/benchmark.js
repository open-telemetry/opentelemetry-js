'use strict';

const Benchmark = require('benchmark');
const benchmarks = require('beautify-benchmark');
const { finish, processResult, initBenchmark } = require("./data");

Benchmark.options.maxTime = 0;

module.exports = (name, minSamples) => {
  Benchmark.options.minSamples = minSamples;
  const suite = new Benchmark.Suite();
  initBenchmark(name);
  return suite
    .on('cycle', event => {
      benchmarks.add(event.target);
      processResult(event.target);
    })
    .on('error', event => {
      throw event.target.error;
    })
    .on('complete', function () {
      benchmarks.log();
      finish();
    });
};
