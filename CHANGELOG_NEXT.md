<!-- markdownlint-disable MD004 -->

## 2.0

### :boom: Breaking Change

* chore(shim-opentracing): replace deprecated SpanAttributes [#4430](https://github.com/open-telemetry/opentelemetry-js/pull/4430) @JamieDanielson
* chore(otel-core): replace deprecated SpanAttributes [#4408](https://github.com/open-telemetry/opentelemetry-js/pull/4408) @JamieDanielson
* feat(sdk-metrics)!: remove MeterProvider.addMetricReader() in favor of constructor option [#4419](https://github.com/open-telemetry/opentelemetry-js/pull/4419) @pichlermarc
* chore(otel-resources): replace deprecated SpanAttributes [#4428](https://github.com/open-telemetry/opentelemetry-js/pull/4428) @JamieDanielson
* feat(sdk-metrics)!: remove MeterProvider.addMetricReader() in favor of constructor option [#4419](https://github.com/open-telemetry/opentelemetry-js/pull/4419) @pichlermarc
* feat(sdk-metrics)!: replace attributeKeys with custom processors option [#4532](https://github.com/open-telemetry/opentelemetry-js/pull/4532) @pichlermarc
* refactor(sdk-trace-base)!: replace `SpanAttributes` with `Attributes` [#5009](https://github.com/open-telemetry/opentelemetry-js/pull/5009) @david-luna
* refactor(resources)!: replace `ResourceAttributes` with `Attributes` [#5016](https://github.com/open-telemetry/opentelemetry-js/pull/5016) @david-luna
* feat(sdk-metrics)!: drop `View` and `Aggregation` in favor of `ViewOptions` and `AggregationOption` [#4931](https://github.com/open-telemetry/opentelemetry-js/pull/4931) @pichlermarc
* refactor(sdk-trace-base)!: remove `new Span` constructor in favor of `Tracer.startSpan` API [#5048](https://github.com/open-telemetry/opentelemetry-js/pull/5048) @david-luna
* refactor(sdk-trace-base)!: remove `BasicTracerProvider.addSpanProcessor` API in favor of constructor options. [#5134](https://github.com/open-telemetry/opentelemetry-js/pull/5134) @david-luna
* refactor(sdk-trace-base)!: make `resource` property private in `BasicTracerProvider` and remove `getActiveSpanProcessor` API. [#5192](https://github.com/open-telemetry/opentelemetry-js/pull/5192) @david-luna

### :rocket: (Enhancement)

### :books: (Refine Doc)

### :house: (Internal)

* chore: remove checks for unsupported node versions [#4341](https://github.com/open-telemetry/opentelemetry-js/pull/4341) @dyladan
* refactor(sdk-trace-base): remove `BasicTracerProvider._registeredSpanProcessors` private property. [#5134](https://github.com/open-telemetry/opentelemetry-js/pull/5177) @david-luna

### :bug: (Bug Fix)
