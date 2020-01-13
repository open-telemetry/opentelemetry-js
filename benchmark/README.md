# Benchmarks

## How to run

To run your benchmark, just:
```sh
$ npm run bench
```

> NOTE: If you're interested in writing benchmarking for other APIs, please write a benchmark in the `benchmark/index.js` module. Please refer to the `benchmark/tracer.js` or `benchmark/propagator.js` for more comprehensive examples.

## Results

### `v0.3.3` release

```
Beginning BasicTracerRegistry Benchmark...
  7 tests completed.

  #startSpan                          x 79,704 ops/sec ±4.46% (10 runs sampled)
  #startSpan:parent                   x 55,975 ops/sec ±1.90% (10 runs sampled)
  #startSpan with attribute           x 84,479 ops/sec ±2.82% (10 runs sampled)
  #startSpan with 30 attributes       x 36,239 ops/sec ±2.67% (10 runs sampled)
  #startSpan with 100 attributes      x  3,716 ops/sec ±1.92% (10 runs sampled)
  #startSpan with SimpleSpanProcessor x  5,440 ops/sec ±39.90% (10 runs sampled)
  #startSpan with BatchSpanProcessor  x  2,284 ops/sec ±6.51% (10 runs sampled)

Beginning NodeTracerRegistry Benchmark...
  7 tests completed.

  #startSpan                          x 81,777 ops/sec ±4.32% (10 runs sampled)
  #startSpan:parent                   x 57,455 ops/sec ±3.87% (10 runs sampled)
  #startSpan with attribute           x 85,139 ops/sec ±4.09% (10 runs sampled)
  #startSpan with 30 attributes       x 38,240 ops/sec ±1.95% (10 runs sampled)
  #startSpan with 100 attributes      x  3,670 ops/sec ±6.85% (10 runs sampled)
  #startSpan with SimpleSpanProcessor x  4,504 ops/sec ±37.04% (10 runs sampled)
  #startSpan with BatchSpanProcessor  x  1,847 ops/sec ±5.26% (10 runs sampled)


Beginning B3Format Benchmark...
  2 tests completed.

  #Inject  x 5,569,330 ops/sec ±1.44% (10 runs sampled)
  #Extract x 4,882,488 ops/sec ±3.72% (10 runs sampled)

Beginning HttpTraceContext Benchmark...
  2 tests completed.

  #Inject  x 13,423,892 ops/sec ±4.62% (10 runs sampled)
  #Extract x  1,673,804 ops/sec ±2.29% (10 runs sampled)
```
