
# Performance Benchmark Testing Guide

Benchmark tests are intended to measure performance of small units of code.

It is recommended that operations that have a high impact on the performance of the SDK (or potential for) are accompanied by a benchmark test. This helps end-users understand the performance trend over time, and it also helps maintainers catch performance regressions.

Benchmark tests are run automatically with every merge to main, and the results are available at <https://open-telemetry.github.io/opentelemetry-js/benchmark>.

## Running benchmark tests

Performance benchmark tests can be run from the root for all modules or from a single module directory only for that module:

``` bash
# benchmark all modules
npm run test:bench

# benchmark a single module
cd packages/opentelemetry-sdk-trace-base
npm run test:bench
```

## Adding a benchmark test

Unlike unit tests, benchmark tests should be written in plain JavaScript (not Typescript).

Add a new test file in folder `test/performance/benchmark` using the following as a template:

``` javascript
const Benchmark = require('benchmark');

const suite = new Benchmark.Suite();

suite.on('cycle', event => {
  console.log(String(event.target));
});

suite.add('new benchmark test', function() {
 // write code to test ...
});

suite.run();
```

## Automatically running benchmark tests

If you want your test to run automatically with every merge to main (to track trend over time), register the new test file by requiring it in `test/performance/benchmark/index.js`.

Add the `test:bench` script in package.json, if the module does not contain it already.

``` json
"test:bench": "node test/performance/benchmark/index.js | tee .benchmark-results.txt"
```
