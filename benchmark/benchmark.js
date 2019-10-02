'use strict';

const Benchmark = require('benchmark');
const benchmarks = require('beautify-benchmark');
const nock = require('nock');

Benchmark.options.maxTime = 0;
Benchmark.options.minSamples = 5;

nock.disableNetConnect();

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
