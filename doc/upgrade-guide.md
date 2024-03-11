# Upgrade guidelines

## 0.37.x to 0.38.0

- `@opentelemetry/sdk-node` `NodeSDKConfiguration.defaultAttributes` has been unused and was removed as the concept does not exist in OpenTelemetry anymore
  - Please use `NodeSDKConfiguration.resource` instead.

## 0.35.x to 0.36.0

- `@opentelemetry/sdk-node` changed `await start()` to now be synchronous
- `@opentelemetry/sdk-node` changed `await detectResources()` to now be synchronous

## 0.28.x to 0.29.x

- `@opentelemetry/exporter-trace-otlp-http` is now exporting `scopeSpans` instead of `instrumentationLibrarySpans`
  - this exporter now requires collector version `0.48` and up.
- `@opentelemetry/exporter-metrics-otlp-http` is now exporting `scopeMetrics` instead of `instrumentationLibraryMetrics`
  - this exporter now requires collector version `0.48` and up.

## 0.27.x to 0.28.x

- In `@opentelemetry/exporter-trace-otlp-http`, `OTLPExporterBase._isShutdown` is replaced with `_shutdownOnce`.

## 0.26.x to 0.27.x

Metric and trace exporters are split into separate packages:

- `@opentelemetry/exporter-otlp-http` => `@opentelemetry/exporter-trace-otlp-http` and `@opentelemetry/exporter-metrics-otlp-http`
- `@opentelemetry/exporter-otlp-grpc` => `@opentelemetry/exporter-trace-otlp-grpc` and `@opentelemetry/exporter-metrics-otlp-grpc`
- `@opentelemetry/exporter-otlp-proto` => `@opentelemetry/exporter-trace-otlp-proto` and `@opentelemetry/exporter-metrics-otlp-proto`

Metric types are renamed:

- `@openetelemetry/api-metrics`
  - `Meter`
    - `createValueRecorder` => `createHistogram`
    - `createValueObserver` => `createObservableGauge`
    - `createSumObserver` => `createObservableCounter`
    - `createUpDownSumObserver` => `createObservableUpDownCounter`
  - `ValueRecorder` => `Histogram`
  - `ValueObserver` => `ObservableGauge`
  - `SumObserver` => `ObservableCounter`
  - `UpDownSumObserver` => `ObservableUpDownCounter`
  - `ObserverResult` => `ObservableResult`
  - `Observation.observer` => `Observation.observable`
- `@opentelemetry/sdk-metrics-base`
  - `MetricKind`
    - `VALUE_RECORDER` => `HISTOGRAM`
    - `SUM_OBSERVER` => `OBSERVABLE_COUNTER`
    - `UP_DOWN_SUM_OBSERVER` => `OBSERVABLE_UP_DOWN_COUNTER`
    - `VALUE_OBSERVER` => `OBSERVABLE_GAUGE`

## 0.25.x to 1.x.y

Collector exporter packages and types are renamed:

- `@opentelemetry/exporter-collector` => `@opentelemetry/exporter-otlp-http`
  - `CollectorExporterBase` => `OTLPExporterBase`
  - `CollectorTraceExporter` => `OTLPTraceExporter`
  - `CollectorMetricExporter` => `OTLPMetricExporter`
  - `CollectorExporterBrowserBase` => `OTLPExporterBrowserBase`
  - `CollectorExporterNodeBase` => `OTLPExporterNodeBase`
  - `CollectorExporterConfigBase` => `OTLPExporterConfigBase`
  - `CollectorExporterError` => `OTLPExporterError`
  - `COLLECTOR_SPAN_KIND_MAPPING` => `OTLP_SPAN_KIND_MAPPING`
  - `collectorTypes` => `otlpTypes`
- `@opentelemetry/exporter-collector-grpc` => `@opentelemetry/exporter-otlp-grpc`
  - `CollectorTraceExporter` => `OTLPTraceExporter`
  - `CollectorMetricExporter` => `OTLPMetricExporter`
  - `CollectorExporterConfigNode` => `OTLPExporterConfigNode`
- `@opentelemetry/exporter-collector-proto` => `@opentelemetry/exporter-otlp-proto`
  - `CollectorExporterNodeBase` => `OTLPExporterNodeBase`
  - `CollectorMetricExporter` => `OTLPMetricExporter`
  - `CollectorTraceExporter` => `OTLPTraceExporter`
- W3C propagators in @opentelemetry/core were renamed
  - `HttpTraceContextPropagator` -> `W3CTraceContextPropagator`
  - `HttpBaggagePropagator` -> `W3CBaggagePropagator`

## 0.24.x to 0.25.x

- SDKs packages for trace and metrics has been renamed to have a consistent naming schema:
  - @opentelemetry/tracing -> @opentelemetry/sdk-trace-base
  - @opentelemetry/node -> @opentelemetry/sdk-trace-node
  - @opentelemetry/web -> @opentelemetry/sdk-trace-web
  - @opentelemetry/metrics -> @opentelemetry/sdk-metrics-base
  - @opentelemetry/node-sdk -> @opentelemetry/sdk-node

## 0.23.x to 0.24.x

- `ResourceAttributes` renamed to `SemanticResourceAttributes` in the `@opentelemetry/semantic-conventions` package

## 0.19.x to 0.20.0

- `HttpBaggage` renamed to `HttpBaggagePropagator`

- `HttpTraceContext` renamed to `HttpTraceContextPropagator`

- `JaegerHttpTracePropagator` renamed to `JaegerPropagator`

- `serviceName` configuration removed from Collector exporters. Use `service.name` Resource attribute instead.

- Prometheus exporter added suffix `_total` to counter metrics.

## 0.18.x to 0.19.0

- API is now a peer dependency. This means that users will need to include `@opentelemetry/api` as a dependency of their project in order to use the SDK. NPM version 7+ (Node 15+) should do this automatically.

- All plugins have been removed in favor of instrumentations.

- The `@opentelemetry/propagator-b3` package previously exported three propagators: `B3Propagator`,`B3SinglePropagator`, and `B3MultiPropagator`, but now only exports the `B3Propagator`. It extracts b3 context in single and multi-header encodings, and injects context using the single-header encoding by default, but can be configured to inject context using the multi-header encoding during construction: `new B3Propagator({ injectEncoding: B3InjectEncoding.MULTI_HEADER })`. If you were previously using the `B3SinglePropagator` or `B3MultiPropagator` directly, you should update your code to use the `B3Propagator` with the appropriate configuration. See the [README][otel-propagator-b3] for full details and usage.

- Sampling configuration via environment variable has changed. If you were using `OTEL_SAMPLING_PROBABILITY` then you should replace it with `OTEL_TRACES_SAMPLER=parentbased_traceidratio` and `OTEL_TRACES_SAMPLER_ARG=<number>` where `<number>` is a number in the [0..1] range, e.g. "0.25". Default is 1.0 if unset.

## 0.17.0 to 0.18.0

- `diag.setLogLevel` is removed and LogLevel can be set by an optional second parameter to `setLogger`

[PR-1975](https://github.com/open-telemetry/opentelemetry-js/pull/1975)

- Breaking change - The resulting resource MUST have all attributes that are on any of the two input resources. If a key exists on both the old and updating resource, the value of the updating resource MUST be picked - previously it was opposite.

## 0.16.0 to 0.17.0

[PR-1880](https://github.com/open-telemetry/opentelemetry-js/pull/1880) feat(diag-logger): introduce a new global level api.diag for internal diagnostic logging

[PR-1925](https://github.com/open-telemetry/opentelemetry-js/pull/1925) feat(diag-logger): part 2 - breaking changes - remove api.Logger, api.NoopLogger, core.LogLevel, core.ConsoleLogger

- These PR's remove the previous `Logger` and `LogLevel` implementations and change the way you should use the replacement `DiagLogger` and `DiagLogLevel`, below are simple examples of how to change your existing usages.

### Setting the global diagnostic logger

The new global [`api.diag`](https://github.com/open-telemetry/opentelemetry-js/blob/main/api/src/api/diag.ts) provides the ability to set the global diagnostic logger `setLogger()` and logging level `setLogLevel()`, it is also a `DiagLogger` implementation and should be directly to log diagnostic messages.

All included logger references have been removed in preference to using the global `api.diag` directly, so you no longer need to pass around the logger instance via function parameters or included as part of the configuration for a component.

```javascript
import { diag, DiagConsoleLogger, DiagLogLevel } from "@opentelemetry/api";
// Setting the default Global logger to use the Console
// And optionally change the logging level (Defaults to INFO)
diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.ERROR)
```

### Using the logger anywhere in the code

```typescript
import { diag } from "@opentelemetry/api";

// Remove or make optional the parameter and don't use it.
export function MyFunction() {
  diag.debug("...");
  diag.info("...");
  diag.warn("...");
  diag.error("...");
  diag.verbose("..");
}

```

### Setting the logger back to a noop

```typescript
import { diag } from "@opentelemetry/api";
diag.setLogger();

```

[PR-1855](https://github.com/open-telemetry/opentelemetry-js/pull/1855) Use instrumentation loader to load plugins and instrumentations

- Providers do no load the plugins anymore. Also PluginLoader has been removed from providers, use `registerInstrumentations` instead

```javascript
//Previously in node
const provider = new NodeTracerProvider({
  plugins: {
    '@grpc/grpc-js': {
      enabled: true,
      path: '@opentelemetry/plugin-grpc-js',
    },
  }
});

// Now
const provider = new NodeTracerProvider();
const { registerInstrumentations } = require('@opentelemetry/instrumentation');
registerInstrumentations({
  instrumentations: [
    {
      plugins: {
        '@grpc/grpc-js': {
          enabled: true,
          path: '@opentelemetry/plugin-grpc-js',
        },
      }
    }
  ],
  tracerProvider: provider,
});

// or if you want to load only default instrumentations / plugins
registerInstrumentations({
  tracerProvider: provider,
});

//Previously in browser
const provider = new WebTracerProvider({
  plugins: [
    new DocumentLoad()
  ]
});
// Now
const { registerInstrumentations } = require('@opentelemetry/instrumentation');
const provider = new WebTracerProvider();
registerInstrumentations({
  instrumentations: [
    new DocumentLoad(),
  ],
});
```

- `registerInstrumentations` supports loading old plugins and instrumentations together. It also supports setting tracer provider and meter provider on instrumentations

[PR-1874](https://github.com/open-telemetry/opentelemetry-js/pull/1874) More specific API type names

Some types exported from `"@opentelemetry/api"` have been changed to be more specific.

- `AttributeValue` renamed to `SpanAttributeValue`
- `Attributes` renamed to `SpanAttributes`
- `EntryTtl` renamed to `BaggageEntryTtl`
- `EntryValue` renamed to `BaggageEntryValue`
- `Status` renamed to `SpanStatus`
- `StatusCode` renamed to `SpanStatusCode`

## 0.15.0 to 0.16.0

[PR-1863](https://github.com/open-telemetry/opentelemetry-js/pull/1863) removed public attributes `keepAlive` and `httpAgentOptions` from Node.js `CollectorTraceExporter` and `CollectorMetricExporter`

## 0.14.0 to 0.15.0

[PR-1764](https://github.com/open-telemetry/opentelemetry-js/pull/1764) removed some APIs from `Tracer`:

- `Tracer.getCurrentSpan()`: use `api.getSpan(api.context.active())`
- `Tracer.withSpan(span)`: use `api.context.with(api.setSpan(api.context.active(), span))`
- `Tracer.bind(target)`: use `api.context.bind(target)`

[PR-1797](https://github.com/open-telemetry/opentelemetry-js/pull/1797) chore!: split metrics into its own api package:

- Any references to `require("@opentelemetry/api").metrics` will need to be changed to `require("@opentelemetry/api-metrics").metrics`

[PR-1725](https://github.com/open-telemetry/opentelemetry-js/pull/1725) Use new gRPC default port

- The default port used by `@opentelemetry/exporter-collector-grpc` is changed from `55680` to `4317`

[PR-1749](https://github.com/open-telemetry/opentelemetry-js/pull/1749) chore: improve naming of span related context APIs

- Rename `[gs]etActiveSpan()` to `[gs]etSpan()`
- Rename `setExtractedSpanContext()` to `setSpanContext()`
- Rename `getParentSpanContext()` to `getSpanContext()`
