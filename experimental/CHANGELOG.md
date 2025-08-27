<!-- markdownlint-disable MD004 -->
# CHANGELOG

All notable changes to experimental packages in this project will be documented in this file.
For notes on migrating to 2.x / 0.200.x see [the upgrade guide](doc/upgrade-to-2.x.md).

## Unreleased

### :boom: Breaking Changes

* feat(api-logs)!: Marked private methods as "conventionally private". [#5789](https://github.com/open-telemetry/opentelemetry-js/pull/5789)
* feat(exporter-otlp-\*): support custom HTTP agents [#5719](https://github.com/open-telemetry/opentelemetry-js/pull/5719) @raphael-theriault-swi
  * `OtlpHttpConfiguration.agentOptions` has been removed and functionality has been rolled into `OtlpHttpConfiguration.agentFactory`
    * (old) `{ agentOptions: myOptions }`
    * (new) `{ agentFactory: httpAgentFactoryFromOptions(myOptions) }`

### :rocket: Features

* feat(otlp-exporter-base): Add fetch transport for fetch-only environments like service workers. [#5807](https://github.com/open-telemetry/opentelemetry-js/pull/5807)
  * when using headers, the Browser exporter now prefers `fetch` over `XMLHttpRequest` if present. Sending via `XMLHttpRequest` will be removed in a future release.

* feat(opentelemetry-configuration): creation of basic ConfigProvider [#5809](https://github.com/open-telemetry/opentelemetry-js/pull/5809) @maryliag
* feat(opentelemetry-configuration): creation of basic FileConfigProvider [#5863](https://github.com/open-telemetry/opentelemetry-js/pull/5863) @maryliag

### :bug: Bug Fixes

* fix(otlp-exporter-base): prioritize `esnext` export condition as it is more specific [#5458](https://github.com/open-telemetry/opentelemetry-js/pull/5458)
* fix(otlp-exporter-base): consider relative urls as valid in browser environments [#5807](https://github.com/open-telemetry/opentelemetry-js/pull/5807)

### :books: Documentation

### :house: Internal

* refactor(otlp-exporter-base): use getStringFromEnv instead of process.env [#5594](https://github.com/open-telemetry/opentelemetry-js/pull/5594) @weyert
* chore(sdk-logs): refactored imports [#5801](https://github.com/open-telemetry/opentelemetry-js/pull/5801) @svetlanabrennan

## 0.203.0

### :boom: Breaking Changes

* feat(sdk-logs)!: Removed deprecated LoggerProvider#addLogRecordProcessor() [#5764](https://github.com/open-telemetry/opentelemetry-js/pull/5764) @svetlanabrennan
* feat(sdk-logs)!: Changed `LogRecord` class to be an interface [#5749](https://github.com/open-telemetry/opentelemetry-js/pull/5749) @svetlanabrennan
  * user-facing: `LogRecord` class is now not exported anymore. A newly exported interface `SdkLogRecord` is used in its place.
* feat!: Removed `api-events` and `sdk-events` [#5737](https://github.com/open-telemetry/opentelemetry-js/pull/5737) @svetlanabrennan

### :house: Internal

* chore: Regenerated certs [#5752](https://github.com/open-telemetry/opentelemetry-js/pull/5752) @svetlanabrennan
* refactor(otlp-exporter-base): remove compatibility code that was intended for now unsupported runtime Node.js v14 @pichlermarc

## 0.202.0

### :rocket: Features

* feat(exporter-otlp-\*): update proto to `v1.7.0`
* feat(exporter-metrics-otlp-proto): Support to protobuf in browser metrics. [#5710](https://github.com/open-telemetry/opentelemetry-js/pull/5710) @YangJonghun
* feat(logs): add eventName to emit [#5707](https://github.com/open-telemetry/opentelemetry-js/pull/5707)

### :bug: Bug Fixes

* fix(instrumentation): remove dependency on the shimmer module [#5652](https://github.com/open-telemetry/opentelemetry-js/pull/5652) @cjihrig

## 0.201.1

### :bug: Bug Fixes

* fix(instrumentation): Change `SemconvStability` export from `const enum` to `enum` to allow single-file transpilation tooling to work with code that uses `SemconvStability`. [#5691](https://github.com/open-telemetry/opentelemetry-js/issues/5691) @trentm

## 0.201.0

### :rocket: Features

* feat(instrumentation-xml-http-request): support migration to stable HTTP semconv, v1.23.1  [#5662](https://github.com/open-telemetry/opentelemetry-js/pull/5662) @trentm
  * Configure the instrumentation with `semconvStabilityOptIn: 'http'` to use the new, stable semconv v1.23.1 semantics or `'http/dup'` for both old (v1.7.0) and stable semantics. When `semconvStabilityOptIn` is not specified (or does not contain these values), it uses the old semconv v1.7.0. I.e. the default behavior is unchanged.
* feat(instrumentation-fetch): support migration to stable HTTP semconv, v1.23.1  [#5651](https://github.com/open-telemetry/opentelemetry-js/pull/5651) @trentm
  * Configure the instrumentation with `semconvStabilityOptIn: 'http'` to use the new, stable semconv v1.23.1 semantics or `'http/dup'` for both old (v1.7.0) and stable semantics. When `semconvStabilityOptIn` is not specified (or does not contain these values), it uses the old semconv v1.7.0. I.e. the default behavior is unchanged.
* feat(instrumentation): New `semconvStabilityFromStr()` utility for semconv stability migration in instrumentations. [#5684](https://github.com/open-telemetry/opentelemetry-js/pull/5684) @trentm
  * See [the utility comment](https://github.com/trentm/opentelemetry-js/blob/main/experimental/packages/opentelemetry-instrumentation/src/semconvStability.ts).
* feat(instrumentation-grpc): support migration to stable HTTP semconv [#5653](https://github.com/open-telemetry/opentelemetry-js/pull/5653) @JamieDanielson
* feat(instrumentation-http): capture synthetic source type on requests [#5488](https://github.com/open-telemetry/opentelemetry-js/pull/5488) @JacksonWeber

### :bug: Bug Fixes

* fix(otlp-transformer): do not throw when deserializing empty JSON response [#5551](https://github.com/open-telemetry/opentelemetry-js/pull/5551) @pichlermarc
* fix(instrumentation-http): report stable client metrics response code [#9586](https://github.com/open-telemetry/opentelemetry-js/pull/9586) @jtescher
* fix(sdk-node): instantiate baggage processor when env var is set [#5634](https://github.com/open-telemetry/opentelemetry-js/pull/5634) @pichlermarc
* fix(instrumentation-http): report `error.type` metrics attribute [#5647](https://github.com/open-telemetry/opentelemetry-js/pull/5647)

### :house: Internal

* refactor(instrumentation-http): Remove legacy http span attributes and metrics [#5552](https://github.com/open-telemetry/opentelemetry-js/pull/5552) @svetlanabrennan
* refactor(instrumentation-http): Add back support for http semconv [#5665](https://github.com/open-telemetry/opentelemetry-js/pull/5665) @JamieDanielson
  * Note: We initially removed support for legacy http attributes and metrics, but then added back for an additional 6 months to ensure all instrumentations could be updated and kept consistent. There should be no net new change in this instrumentation related to these semantic conventions. See [#5646](https://github.com/open-telemetry/opentelemetry-js/issues/5646) for details.
* refactor(sdk-node): update semconv usage to `ATTR_` exports [#5668](https://github.com/open-telemetry/opentelemetry-js/pull/5668) @trentm
* chore(sdk-node): Refactored using `get*FromEnv` utility function instead of `process.env` for NodeSDK's resource detector setup. [#5582](https://github.com/open-telemetry/opentelemetry-js/pull/5582) @beeme1mr
* chore(sdk-node): Refactored using `get*FromEnv` utility function instead of `process.env` for NodeSDK's logging setup. [#5563](https://github.com/open-telemetry/opentelemetry-js/issues/5563) @weyert
* test: test Node.js 24 in CI [#5661](https://github.com/open-telemetry/opentelemetry-js/pull/5661) @cjihrig

## 0.200.0

### Summary

- The **minimum supported Node.js has been raised to `^18.19.0 || >=20.6.0`**. This means that support for Node.js 14 and 16 has been dropped.
- The **minimum supported TypeScript version has been raised to 5.0.4**.
- The **compilation target for transpiled TypeScript has been raised to ES2022** (from ES2017).
- The **public interface has changed**
  - for notes on migrating to 2.x / 0.200.x see [the upgrade guide](https://github.com/open-telemetry/opentelemetry-js/tree/main/doc/upgrade-to-2.x.md)
- Only stable versions `2.0.0` are compatible with this release

### :boom: Breaking Change

* feat(exporter-prometheus)!: stop the using `type` field to enforce naming conventions [#5291](https://github.com/open-telemetry/opentelemetry-js/pull/5291) @chancancode
  * Any non-monotonic sums will now be treated as counters and will therefore include the `_total` suffix.
* feat(shim-opencenus)!: stop mapping removed Instrument `type` to OpenTelemetry metrics [#5291](https://github.com/open-telemetry/opentelemetry-js/pull/5291) @chancancode
  * The internal OpenTelemetry data model dropped the concept of instrument type on exported metrics, therefore mapping it is not necessary anymore.
* feat(instrumentation-fetch)!: passthrough original response to `applyCustomAttributes` hook [#5281](https://github.com/open-telemetry/opentelemetry-js/pull/5281) @chancancode
  * Previously, the fetch instrumentation code unconditionally clones every `fetch()` response in order to preserve the ability for the `applyCustomAttributes` hook to consume the response body. This is fundamentally unsound, as it forces the browser to buffer and retain the response body until it is fully received and read, which crates unnecessary memory pressure on large or long-running response streams. In extreme cases, this is effectively a memory leak and can cause the browser tab to crash. If your use case for `applyCustomAttributes` requires access to the response body, please chime in on [#5293](https://github.com/open-telemetry/opentelemetry-js/issues/5293).
* chore!: Raise the minimum supported Node.js version to `^18.19.0 || >=20.6.0`. Support for Node.js 14, 16, and early minor versions of 18 and 20 have been dropped. This applies to all packages except the 'api' and 'semantic-conventions' packages. [#5395](https://github.com/open-telemetry/opentelemetry-js/issues/5395) @trentm
* feat(sdk-node)!: use `IMetricReader` over `MetricReader` [#5311](https://github.com/open-telemetry/opentelemetry-js/pull/5311)
  * (user-facing): `NodeSDKConfiguration` now provides the more general `IMetricReader` type over `MetricReader`
* feat(exporter-metrics-otlp-http)!: do not read environment variables from window in browsers [#5473](https://github.com/open-telemetry/opentelemetry-js/pull/5473) @pichlermarc
  * (user-facing): all configuration previously possible via `window.OTEL_*` is now not supported anymore, please pass configuration options to constructors instead.
  * Note: Node.js environment variable configuration continues to work as-is.
* feat(sdk-logs)!: do not read environment variables from window in browsers [#5472](https://github.com/open-telemetry/opentelemetry-js/pull/5472) @pichlermarc
  * (user-facing): all configuration previously possible via `window.OTEL_*` is now not supported anymore, please pass configuration options to constructors instead.
    * Note: Node.js environment variable configuration continues to work as-is.

### :rocket: (Enhancement)

* feat(instrumentation-fetch): add a `requestHook` option [#5380](https://github.com/open-telemetry/opentelemetry-js/pull/5380)
* feat(instrumentation): re-export initialize function from import-in-the-middle [#5123](https://github.com/open-telemetry/opentelemetry-js/pull/5123)
* feat(sdk-node): lower diagnostic level [#5360](https://github.com/open-telemetry/opentelemetry-js/pull/5360) @cjihrig
* feat(exporter-prometheus): add additional attributes option [#5317](https://github.com/open-telemetry/opentelemetry-js/pull/5317) @marius-a-mueller
  * Add `withResourceConstantLabels` option to `ExporterConfig`. It can be used to define a regex pattern to choose which resource attributes will be used as static labels on the metrics. The default is to not set any static labels.

### :bug: (Bug Fix)

* fix(instrumentation-grpc): monitor error events with events.errorMonitor [#5369](https://github.com/open-telemetry/opentelemetry-js/pull/5369) @cjihrig
* fix(exporter-metrics-otlp-http): browser OTLPMetricExporter was not passing config to OTLPMetricExporterBase super class [#5331](https://github.com/open-telemetry/opentelemetry-js/pull/5331) @trentm
* fix(instrumentation-fetch, instrumentation-xhr): Ignore network events with zero-timings [#5332](https://github.com/open-telemetry/opentelemetry-js/pull/5332) @chancancode
* fix(exporter-logs/trace-otlp-grpc): fix error for missing dependency otlp-exporter-base [#5412](https://github.com/open-telemetry/opentelemetry-js/pull/5412) @JamieDanielson

### :house: (Internal)

* chore(instrumentation-grpc): remove unused findIndex() function [#5372](https://github.com/open-telemetry/opentelemetry-js/pull/5372) @cjihrig
* refactor(otlp-exporter-base): remove unnecessary isNaN() checks [#5374](https://github.com/open-telemetry/opentelemetry-js/pull/5374) @cjihrig
* refactor(exporter-prometheus): remove unnecessary isNaN() check [#5377](https://github.com/open-telemetry/opentelemetry-js/pull/5377) @cjihrig
* refactor(sdk-node): move code to auto-instantiate propagators into utils [#5355](https://github.com/open-telemetry/opentelemetry-js/pull/5355) @pichlermarc
* chore: unpin `@opentelemetry/semantic-conventions` dep to allow better de-duplication in installs [#5439](https://github.com/open-telemetry/opentelemetry-js/pull/5439) @trentm
* refactor(instrumentation-http): migrate away from getEnv() [#5469](https://github.com/open-telemetry/opentelemetry-js/pull/5469) @pichlermarc
* refactor(sdk-node): migrate away from getEnv() [#5475](https://github.com/open-telemetry/opentelemetry-js/pull/5475) @pichlermarc

## 0.57.0

### :rocket: (Enhancement)

* feat(opentelemetry-sdk-node): automatically configure metrics exporter based on environment variables [#5168](https://github.com/open-telemetry/opentelemetry-js/pull/5168) @bhaskarbanerjee

### :house: (Internal)

* refactor(otlp-transformer): re-structure package to prepare for separate entrypoints [#5264](https://github.com/open-telemetry/opentelemetry-js/pull/5264) @pichlermarc

## 0.56.0

### :boom: Breaking Change

* feat(otlp-exporter-base)!: collapse base classes into one [#5031](https://github.com/open-telemetry/opentelemetry-js/pull/5031) @pichlermarc
  * `OTLPExporterNodeBase` has been removed in favor of a platform-agnostic implementation (`OTLPExporterBase`)
  * `OTLPExporterBrowserBase` has been removed in favor of a platform-agnostic implementation (`OTLPExporterBase`)
  * `ExportServiceError` was intended for internal use and has been dropped from exports
  * `validateAndNormalizeHeaders` was intended for internal use and has been dropped from exports
  * `OTLPExporterBase` all properties are now private, the constructor now takes an `IOTLPExportDelegate`, the type parameter for config type has been dropped.
    * This type is scheduled for removal in a future version of this package, please treat all exporters as `SpanExporter`, `PushMetricExporter` or `LogRecordExporter`, based on their respective type.
* feat(otlp-grpc-exporter-base)!: collapse base classes into one [#5031](https://github.com/open-telemetry/opentelemetry-js/pull/5031) @pichlermarc
  * `OTLPGRPCExporterNodeBase` has been removed in favor of a platform-agnostic implementation (`OTLPExporterBase` from `@opentelemetry/otlp-exporter-base`)
* feat(otlp-transformer)!: accept `ResourceMetrics` in serializers instead of `ResourceMetrics[]`
  * (user-facing): `ProtobufMetricsSerializer` now only accepts `ResourceMetrics` instead of `ResourceMetrics[]` to align with `PushMetricExporter` requirements
  * (user-facing): `JsonMetricsSerializer` now only accepts `ResourceMetrics` instead of `ResourceMetrics[]` to align with `PushMetricExporter` requirements
* feat(otlp-transformer)!: remove internal types and functions from public API @pichlermarc
  * (user-facing): the following types and functions were intended for internal use and have been removed from exports
    * `OtlpEncodingOptions`
    * `IKeyValueList`
    * `IKeyValue`
    * `IInstrumentationScope`
    * `IArrayValue`
    * `LongBits`
    * `IAnyValue`
    * `Fixed64`
    * `SpanContextEncodeFunction`
    * `toLongBits`
    * `OptionalSpanContextEncodeFunction`
    * `getOtlpEncoder`
    * `Encoder`
    * `HrTimeEncodeFunction`
    * `encodeAsLongBits`
    * `encodeAsString`
    * `hrTimeToNanos`
    * `IValueAtQuantile`
    * `ISummaryDataPoint`
    * `ISummary`
    * `ISum`
    * `IScopeMetrics`
    * `IResourceMetrics`
    * `INumberDataPoint`
    * `IHistogramDataPoint`
    * `IHistogram`
    * `IExponentialHistogramDataPoint`
    * `IExponentialHistogram`
    * `IMetric`
    * `IGauge`
    * `IExemplar`
    * `EAggregationTemporality`
    * `IExportMetricsServiceRequest`
    * `IBuckets`
    * `IResource`
    * `IStatus`
    * `EStatusCode`
    * `ILink`
    * `IEvent`
    * `IScopeSpans`
    * `ISpan`
    * `IResourceSpans`
    * `ESpanKind`
    * `IExportTraceServiceRequest`
    * `IScopeLogs`
    * `IExportLogsServiceRequest`
    * `IResourceLogs`
    * `ILogRecord`
    * `ESeverityNumber`
    * `createExportTraceServiceRequest`
    * `createExportMetricsServiceRequest`
    * `createExportLogsServiceRequest`

### :rocket: (Enhancement)

* feat(otlp-exporter-base): handle OTLP partial success [#5183](https://github.com/open-telemetry/opentelemetry-js/pull/5183) @pichlermarc
* feat(otlp-exporter-base): internally accept a http header provider function only [#5179](https://github.com/open-telemetry/opentelemetry-js/pull/5179) @pichlermarc
* refactor(otlp-exporter-base): don't create blob before sending xhr [#5193](https://github.com/open-telemetry/opentelemetry-js/pull/5193) @pichlermarc
  * improves compatibility with some unsupported runtimes
* feat(otlp-exporter-base): add http response body to exporter error [#5204](https://github.com/open-telemetry/opentelemetry-js/pull/5204) @pichlermarc

### :bug: (Bug Fix)

* fix(otlp-exporter-\*): de-confuse Nuxt build tooling by not using 'export *' in comments [#5227](https://github.com/open-telemetry/opentelemetry-js/pull/5227) @pichlermarc

### :house: (Internal)

* chore(otlp-exporter-\*-grpc): clean up tests [#5196](https://github.com/open-telemetry/opentelemetry-js/pull/5196) @pichlermarc
* chore(otlp-exporter-\*-http): clean up tests [#5196](https://github.com/open-telemetry/opentelemetry-js/pull/5198) @pichlermarc
* chore(otlp-exporter-\*-proto): clean up tests [#5196](https://github.com/open-telemetry/opentelemetry-js/pull/5199) @pichlermarc

## 0.55.0

### :boom: Breaking Change

* feat(instrumentation-http)!: reduce public API surface by removing exports and making protected methods private [#5124](https://github.com/open-telemetry/opentelemetry-js/pull/5124) @pichlermarc
  * (user-facing) the following exports were intended for internal use only and have been removed without replacement
    * extractHostnameAndPort
    * getAbsoluteUrl
    * getIncomingRequestAttributes
    * getIncomingRequestAttributesOnResponse
    * getIncomingRequestMetricAttributes
    * getIncomingRequestMetricAttributesOnResponse
    * getOutgoingRequestAttributes
    * getOutgoingRequestAttributesOnResponse
    * getOutgoingRequestMetricAttributes
    * getOutgoingRequestMetricAttributesOnResponse
    * getRequestInfo
    * headerCapture
    * isCompressed
    * isValidOptionsType
    * parseResponseStatus
    * satisfiesPattern
    * setAttributesFromHttpKind
    * setRequestContentLengthAttribute
    * setResponseContentLengthAttribute
    * setSpanWithError
    * RequestSignature
    * RequestFunction
    * ParsedRequestOptions
    * IgnoreMatcher
    * Https
    * HttpRequestArgs
    * HttpCallbackOptional
    * HttpCallback
    * Http
    * GetFunction
    * Func
    * Err

### :rocket: (Enhancement)

* feat(sdk-node, sdk-logs): add `mergeResourceWithDefaults` flag, which allows opting-out of resources getting merged with the default resource [#4617](https://github.com/open-telemetry/opentelemetry-js/pull/4617)
  * default: `true`
  * note: `false` will become the default behavior in a future iteration in order to comply with [specification requirements](https://github.com/open-telemetry/opentelemetry-specification/blob/f3511a5ccda376dfd1de76dfa086fc9b35b54757/specification/resource/sdk.md?plain=1#L31-L36)
* feat(instrumentation): Track request body size in XHR and Fetch instrumentations [#4706](https://github.com/open-telemetry/opentelemetry-js/pull/4706) @mustafahaddara

### :bug: (Bug Fix)

* fix(instrumentation-http): Fix the `OTEL_SEMCONV_STABILITY_OPT_IN` variable check. Using `of` instead of `in` [#5137](https://github.com/open-telemetry/opentelemetry-js/pull/5137)
* fix(instrumentation-http): drop url.parse in favor of URL constructor [#5091](https://github.com/open-telemetry/opentelemetry-js/pull/5091) @pichlermarc
  * fixes a bug where using cyrillic characters in a client request string URL would throw an exception, whereas an un-instrumented client would accept the same input without throwing an exception
* fix(otlp-exporter-base): fix unhandled error when writing to destroyed http request [#5163](https://github.com/open-telemetry/opentelemetry-js/pull/5163) @pichlermarc

## 0.54.2

### :bug: (Bug Fix)

* fix(instrumentation): Fix wrapping ESM files with absolute path [#5094](https://github.com/open-telemetry/opentelemetry-js/pull/5094) @serkan-ozal

## 0.54.1

### :bug: (Bug Fix)

* fix(instrumentation-http): skip malformed forwarded headers. [#5095](https://github.com/open-telemetry/opentelemetry-js/issues/5095) @pmlanger

## 0.54.0

### :boom: Breaking Change

* feat(exporter-*-otlp-*)!: rewrite exporter config logic for testability [#4971](https://github.com/open-telemetry/opentelemetry-js/pull/4971) @pichlermarc
  * (user-facing) `getDefaultUrl` was intended for internal use has been removed from all exporters
  * (user-facing) `getUrlFromConfig` was intended for internal use and has been removed from all exporters
  * (user-facing) `hostname` was intended for internal use and has been removed from all exporters
  * (user-facing) `url` was intended for internal use and has been removed from all exporters
  * (user-facing) `timeoutMillis` was intended for internal use and has been removed from all exporters
  * (user-facing) `onInit` was intended for internal use and has been removed from all exporters
  * (user-facing) OTLP exporter config `headers` type changed from `Partial<Record<string, unknown>>` to `Record<string, string>`
* feat(otlp-exporter-base)!: do not export functions that are intended for internal use [#4971](https://github.com/open-telemetry/opentelemetry-js/pull/4971) @pichlermarc
  * Drops the following functions and types that were intended for internal use from the package exports:
    * `parseHeaders`
    * `appendResourcePathToUrl`
    * `appendResourcePathToUrlIfNeeded`
    * `configureExporterTimeout`
    * `invalidTimeout`
* feat(instrumentation-http)!: remove long deprecated options [#5085](https://github.com/open-telemetry/opentelemetry-js/pull/5085) @pichlermarc
  * `ignoreIncomingPaths` has been removed, use the more versatile `ignoreIncomingRequestHook` instead.
  * `ignoreOutgoingUrls` has been removed, use the more versatile `ignoreOutgoingRequestHook` instead.
  * `isIgnored` utility function was intended for internal use and has been removed without replacement.

### :rocket: (Enhancement)

* feat(api-logs): Add delegating no-op logger provider [#4861](https://github.com/open-telemetry/opentelemetry-js/pull/4861) @hectorhdzg
* feat(instrumentation-http): Add support for [Semantic Conventions 1.27+](https://github.com/open-telemetry/semantic-conventions/releases/tag/v1.27.0) [#4940](https://github.com/open-telemetry/opentelemetry-js/pull/4940) [#4978](https://github.com/open-telemetry/opentelemetry-js/pull/4978) [#5026](https://github.com/open-telemetry/opentelemetry-js/pull/5026) @dyladan
  * Applies to client and server spans and metrics
  * Generate spans and metrics compliant with Semantic Conventions 1.27+ when `OTEL_SEMCONV_STABILITY_OPT_IN` contains `http` or `http/dup`
  * Generate spans and metrics backwards compatible with previous attributes when `OTEL_SEMCONV_STABILITY_OPT_IN` contains `http/dup` or DOES NOT contain `http`

### :bug: (Bug Fix)

* fix(sampler-jaeger-remote): fixes an issue where package could emit unhandled promise rejections @Just-Sieb
* fix(otlp-grpc-exporter-base): default compression to `'none'` if env vars `OTEL_EXPORTER_OTLP_TRACES_COMPRESSION` and `OTEL_EXPORTER_OTLP_COMPRESSION` are falsy @sjvans
* fix(sdk-events): remove devDependencies to old `@opentelemetry/api-logs@0.52.0`, `@opentelemetry/api-events@0.52.0` packages [#5013](https://github.com/open-telemetry/opentelemetry-js/pull/5013) @pichlermarc
* fix(sdk-logs): remove devDependencies to old `@opentelemetry/api-logs@0.52.0` [#5013](https://github.com/open-telemetry/opentelemetry-js/pull/5013) @pichlermarc
* fix(sdk-logs): align LogRecord#setAttribute type with types from `@opentelemetry/api-logs@0.53.0` [#5013](https://github.com/open-telemetry/opentelemetry-js/pull/5013) @pichlermarc
* fix(exporter-*-otlp-*): fixes a bug where signal-specific environment variables would not be applied and the trace-specific one was used instead [#4971](https://github.com/open-telemetry/opentelemetry-js/pull/4971) @pichlermarc
  * Fixes:
    * `OTEL_EXPORTER_OTLP_METRICS_COMPRESSION`
    * `OTEL_EXPORTER_OTLP_LOGS_COMPRESSION`
    * `OTEL_EXPORTER_OTLP_METRICS_CLIENT_CERTIFICATE`
    * `OTEL_EXPORTER_OTLP_LOGS_CLIENT_CERTIFICATE`
    * `OTEL_EXPORTER_OTLP_METRICS_CLIENT_KEY`
    * `OTEL_EXPORTER_OTLP_LOGS_CLIENT_KEY`
    * `OTEL_EXPORTER_OTLP_METRICS_INSECURE`
    * `OTEL_EXPORTER_OTLP_LOGS_INSECURE`
* fix(sdk-node): use warn instead of error on unknown OTEL_NODE_RESOURCE_DETECTORS values [#5034](https://github.com/open-telemetry/opentelemetry-js/pull/5034)
* fix(exporter-logs-otlp-proto): Use correct config type in Node constructor
* fix(instrumentation-http): Fix instrumentation of `http.get`, `http.request`, `https.get`, and `https.request` when used from ESM code and imported via the `import defaultExport from 'http'` style. [#5024](https://github.com/open-telemetry/opentelemetry-js/issues/5024) @trentm

### :house: (Internal)

* refactor(exporter-prometheus): replace `MetricAttributes` and `MetricAttributeValues` with `Attributes` and `AttributeValues` [#4993](https://github.com/open-telemetry/opentelemetry-js/pull/4993)

* refactor(browser-detector): replace `ResourceAttributes` with `Attributes` [#5004](https://github.com/open-telemetry/opentelemetry-js/pull/5004)
* refactor(sdk-logs): replace `ResourceAttributes` with `Attributes` [#5005](https://github.com/open-telemetry/opentelemetry-js/pull/5005) @david-luna

## 0.53.0

### :boom: Breaking Change

* fix(instrumentation)!:remove unused description property from interface [#4847](https://github.com/open-telemetry/opentelemetry-js/pull/4847) @blumamir
* feat(exporter-*-otlp-*)!: use transport interface in node.js exporters [#4743](https://github.com/open-telemetry/opentelemetry-js/pull/4743) @pichlermarc
  * (user-facing) `headers` was intended for internal use has been removed from all exporters
  * (user-facing) `compression` was intended for internal use and has been removed from all exporters
  * (user-facing) `hostname` was intended for use in tests and is not used by any exporters, it will be removed in a future release
* fix(exporter-*-otlp-*)!: ensure `User-Agent` header cannot be overwritten by the user [#4743](https://github.com/open-telemetry/opentelemetry-js/pull/4743) @pichlermarc
  * allowing overrides of the `User-Agent` header was not specification compliant.
* feat(exporter-*-otlp*)!: remove environment-variable specific code from browser exporters
  * (user-facing) removes the ability to configure browser exporters by using `process.env` polyfills
* feat(sdk-node)!: Automatically configure logs exporter [#4740](https://github.com/open-telemetry/opentelemetry-js/pull/4740)
* feat(exporter-*-otlp-*)!: use transport interface in browser exporters [#4895](https://github.com/open-telemetry/opentelemetry-js/pull/4895) @pichlermarc
  * (user-facing) protected `headers` property was intended for internal use has been removed from all exporters

### :rocket: (Enhancement)

* feat(otlp-transformer): Do not limit @opentelemetry/api upper range peerDependency [#4816](https://github.com/open-telemetry/opentelemetry-js/pull/4816) @mydea
* feat(instrumentation-http): Allow to opt-out of instrumenting incoming/outgoing requests [#4643](https://github.com/open-telemetry/opentelemetry-js/pull/4643) @mydea
* feat(sampler-jaeger-remote): added support of jaeger-remote-sampler according to this [spec](https://github.com/open-telemetry/opentelemetry-specification/blob/main/specification/trace/sdk.md#jaegerremotesampler) [#4534](https://github.com/open-telemetry/opentelemetry-js/pull/4589) @legalimpurity

### :bug: (Bug Fix)

* fix(instrumentation): ensure .setConfig() results in config.enabled defaulting to true [#4941](https://github.com/open-telemetry/opentelemetry-js/pull/4941) @trentm
* fix(instrumentation-http): Ensure instrumentation of `http.get` and `https.get` work when used in ESM code [#4857](https://github.com/open-telemetry/opentelemetry-js/issues/4857) @trentm
* fix(api-logs): align AnyValue to spec [#4893](https://github.com/open-telemetry/opentelemetry-js/pull/4893) @blumamir
* fix(instrumentation): remove diag.debug() message for instrumentations that do not patch modules [#4925](https://github.com/open-telemetry/opentelemetry-js/pull/4925) @trentm

### :house: (Internal)

* refactor: Simplify the code for the `getEnv` function [#4799](https://github.com/open-telemetry/opentelemetry-js/pull/4799) @danstarns
* refactor: remove "export *" in favor of explicit named exports [#4880](https://github.com/open-telemetry/opentelemetry-js/pull/4880) @robbkidd
  * Packages updated:
    * api-events
    * api-logs
    * opentelemetry-browser-detector
    * opentelemetry-exporter-prometheus
    * opentelemetry-instrumentation-fetch
    * opentelemetry-instrumentation-http
    * opentelemetry-instrumentation-xml-http-request
    * opentelemetry-instrumentation

## 0.52.1

### :rocket: (Enhancement)

* refactor(instrumentation-fetch): move fetch to use SEMATRR [#4632](https://github.com/open-telemetry/opentelemetry-js/pull/4632)
* refactor(otlp-transformer): use explicit exports [#4785](https://github.com/open-telemetry/opentelemetry-js/pull/4785) @pichlermarc

### :bug: (Bug Fix)

* fix(sdk-node): register context manager if no tracer options are provided [#4781](https://github.com/open-telemetry/opentelemetry-js/pull/4781) @pichlermarc
* fix(instrumentation): Update `import-in-the-middle` to fix [numerous bugs](https://github.com/DataDog/import-in-the-middle/releases/tag/v1.8.1) [#4806](https://github.com/open-telemetry/opentelemetry-js/pull/4806) @timfish
* chore(instrumentation): Use a caret version for `import-in-the-middle` dependency [#4810](https://github.com/open-telemetry/opentelemetry-js/pull/4810) @timfish

### :house: (Internal)

* test: add `npm run maint:regenerate-test-certs` maintenance script and regenerate recently expired test certs [#4777](https://github.com/open-telemetry/opentelemetry-js/pull/4777)

## 0.52.0

### :boom: Breaking Change

* feat(exporter-*-otlp-*)!: move serialization for Node.js exporters to `@opentelemetry/otlp-transformer` [#4542](https://github.com/open-telemetry/opentelemetry-js/pull/4542) @pichlermarc
  * Breaking changes:
    * (user-facing) `convert()` now returns an empty object and will be removed in a follow-up
    * (internal) OTLPExporterNodeBase now has additional constructor parameters that are required
    * (internal) OTLPExporterNodeBase now has an additional `ResponseType` type parameter
* feat(exporter-*-otlp-*)!: move serialization for Node.js exporters to `@opentelemetry/otlp-transformer` [#4581](https://github.com/open-telemetry/opentelemetry-js/pull/4581) @pichlermarc
  * Breaking changes:
    * (user-facing) `convert()` has been removed from all exporters
    * (internal) OTLPExporterBrowserBase: `RequestType` has been replaced by a `ResponseType` type-argument
    * (internal) OTLPExporterNodeBase: `ServiceRequest` has been replaced by a `ServiceResponse` type-argument
    * (internal) the `@opentelemetry/otlp-exporter-proto-base` package has been removed, and will from now on be deprecated in `npm`
* feat(instrumentation): remove default value for config in base instrumentation constructor [#4695](https://github.com/open-telemetry/opentelemetry-js/pull/4695): @blumamir
* fix(instrumentation)!: remove unused supportedVersions from Instrumentation interface [#4694](https://github.com/open-telemetry/opentelemetry-js/pull/4694) @blumamir
* feat(instrumentation)!: simplify `registerInstrumentations()` API
  * Breaking changes:
    * removes `InstrumentationOptions` type
    * occurrences of `InstrumentationOptions` are now replaced by `(Instrumentation | Instrumentation[])[]`
      * migrate usages of `registerInstrumentations({instrumentations: fooInstrumentation})` to `registerInstrumentations({instrumentations: [fooInstrumentation]})`
      * passing Instrumentation classes to `registerInstrumentations()` is now not possible anymore.
* feat(sdk-node)!: simplify type of `instrumentations` option
  * Breaking changes:
    * replaces `InstrumentationOptions` with `(Instrumentation | Instrumentation[])[]`

### :rocket: (Enhancement)

* feat(instrumentation): apply unwrap before wrap in base class [#4692](https://github.com/open-telemetry/opentelemetry-js/pull/4692)
* feat(instrumentation): add util to execute span customization hook in base class [#4663](https://github.com/open-telemetry/opentelemetry-js/pull/4663) @blumamir
* feat(instrumentation): generic config type in instrumentation base [#4659](https://github.com/open-telemetry/opentelemetry-js/pull/4659) @blumamir
* feat: support node 22 [#4666](https://github.com/open-telemetry/opentelemetry-js/pull/4666) @dyladan
* feat(propagator-aws-xray-lambda): add AWS Xray Lambda propagator [4554](https://github.com/open-telemetry/opentelemetry-js/pull/4554)
* refactor(instrumentation-xml-http-request): use exported strings for semantic attributes. [#4681](https://github.com/open-telemetry/opentelemetry-js/pull/4681/files)
* refactor(sdk-node): Use tree-shakeable string constants for semconv [#4767](https://github.com/open-telemetry/opentelemetry-js/pull/4767) @JohannesHuster

### :bug: (Bug Fix)

* fix(instrumentation): Update `import-in-the-middle` to fix [numerous bugs](https://github.com/DataDog/import-in-the-middle/pull/91) [#4745](https://github.com/open-telemetry/opentelemetry-js/pull/4745) @timfish

### :books: (Refine Doc)

* docs(instrumentation): better docs for supportedVersions option [#4693](https://github.com/open-telemetry/opentelemetry-js/pull/4693) @blumamir
* docs: align all supported versions to a common format [#4696](https://github.com/open-telemetry/opentelemetry-js/pull/4696) @blumamir
* refactor(examples): use new exported string constants for semconv in experimental/examples/opencensus-shim [#4763](https://github.com/open-telemetry/opentelemetry-js/pull/4763#pull) @Zen-cronic

## 0.51.1

### :bug: (Bug Fix)

* fix(instrumentation): update import-in-the-middle to 1.7.4

## 0.51.0

### :boom: Breaking Change

* feat(sdk-node)!: remove long deprecated methods in favor of constructor options [#4606](https://github.com/open-telemetry/opentelemetry-js/pull/4606) @pichlermarc
  * `NodeSDK.configureTracerProvider()`, please use constructor options instead
  * `NodeSDK.configureMeterProvider()`, please use constructor options instead
  * `NodeSDK.configureLoggerProvider()`, please use constructor options instead
  * `NodeSDK.addResource()`, please use constructor options instead
  * `NodeSDK.detectResources()`, this is not necessary anymore, resources are now auto-detected on `NodeSDK.start()` if the constructor option `autoDetectResources` is unset, `undefined` or `true`.
* feat(instrumentation): add patch and unpatch diag log messages [#4641](https://github.com/open-telemetry/opentelemetry-js/pull/4641)
  * Instrumentations should not log patch and unpatch messages to diag channel.
* feat!(instrumentation): remove moduleExports generic type from instrumentation registration [#4598](https://github.com/open-telemetry/opentelemetry-js/pull/4598) @blumamir
  * breaking for instrumentation authors that depend on
    * `InstrumentationBase`
    * `InstrumentationNodeModuleDefinition`
    * `InstrumentationNodeModuleFile`
* feat(api-events): removed traceId and spanId from Event interface, added context and severityNumber [#4629](https://github.com/open-telemetry/opentelemetry-js/pull/4629)

### :rocket: (Enhancement)

* feat(sdk-logs): log resource attributes in ConsoleLogRecordExporter [#4646](https://github.com/open-telemetry/opentelemetry-js/pull/4646) @harelmo-lumigo
* refactor(instrumentation-grpc): move to use SEMATTRS [#4633](https://github.com/open-telemetry/opentelemetry-js/pull/4633)
* feat(otlp-transformer): consolidate scope/resource creation in transformer [#4600](https://github.com/open-telemetry/opentelemetry-js/pull/4600)
* feat(sdk-logs): print message when attributes are dropped due to attribute count limit [#4614](https://github.com/open-telemetry/opentelemetry-js/pull/4614) @HyunnoH
* feat(sdk-node): add usage for the detector ServiceInstanceIdDetectorSync. [#4626](https://github.com/open-telemetry/opentelemetry-js/pull/4626) @maryliag
  * The resource detector can be added to default resource detector list by adding the value `serviceinstance` to the list of resource detectors on the environment variable `OTEL_NODE_RESOURCE_DETECTORS`, e.g `OTEL_NODE_RESOURCE_DETECTORS=env,host,os,serviceinstance`
  * The value can be overwritten by
    * merging a resource containing the `service.instance.id` attribute
    * using another resource detector which writes `service.instance.id`
* feat(sdk-events): add Events SDK [#4629](https://github.com/open-telemetry/opentelemetry-js/pull/4629)

### :bug: (Bug Fix)

* fix(otlp-grpc-exporter-base): avoid TypeError on exporter shutdown [#4612](https://github.com/open-telemetry/opentelemetry-js/pull/4612) @pichlermarc
* fix(instrumentation): Don't use `require` to load `package.json` files [#4593](https://github.com/open-telemetry/opentelemetry-js/pull/4593) @timfish

## 0.50.0

### :boom: Breaking Change

* fix(exporter-*-otlp-grpc)!: lazy load gRPC to improve compatibility with `@opentelemetry/instrumenation-grpc` [#4432](https://github.com/open-telemetry/opentelemetry-js/pull/4432) @pichlermarc
  * Fixes a bug where requiring up the gRPC exporter before enabling the instrumentation from `@opentelemetry/instrumentation-grpc` would lead to missing telemetry
  * Breaking changes, removes several functions and properties that were used internally and were not intended for end-users
    * `getServiceClientType()`
      * this returned a static enum value that would denote the export type (`SPAN`, `METRICS`, `LOGS`)
    * `getServiceProtoPath()`
      * this returned a static enum value that would correspond to the gRPC service path
    * `metadata`
      * was used internally to access metadata, but as a side effect allowed end-users to modify metadata on runtime.
    * `serviceClient`
      * was used internally to keep track of the service client used by the exporter, as a side effect it allowed end-users to modify the gRPC service client that was used
    * `compression`
      * was used internally to keep track of the compression to use but was unintentionally exposed to the users. It allowed to read and write the value, writing, however, would have no effect.

### :rocket: (Enhancement)

* feat(instrumentation-xhr): optionally ignore network events [#4571](https://github.com/open-telemetry/opentelemetry-js/pull/4571/) @mustafahaddara
* refactor(instrumentation-http): use exported strings for semconv [#4573](https://github.com/open-telemetry/opentelemetry-js/pull/4573/) @JamieDanielson
* perf(instrumentation-http): remove obvious temp allocations [#4576](https://github.com/open-telemetry/opentelemetry-js/pull/4576) @Samuron
* feat(sdk-node): add `HostDetector` as default resource detector [#4566](https://github.com/open-telemetry/opentelemetry-js/pull/4566) @maryliag
* feat(api-events): added data field to the Event interface [#4575](https://github.com/open-telemetry/opentelemetry-js/pull/4575) @martinkuba

### :bug: (Bug Fix)

* fix(exporter-*-otlp-*): use parseHeaders() to ensure header-values are not 'undefined' #4540
  * Fixes a bug where passing `undefined` as a header value would crash the end-user app after the export timeout elapsed.
* fix(sdk-logs): ensure default resource attributes are used as fallbacks when a resource is passed to LoggerProvider.

### :books: (Refine Doc)

* docs(instrumentation-http): document semantic conventions and attributes in use. [#4587](https://github.com/open-telemetry/opentelemetry-js/pull/4587/) @JamieDanielson

## 0.49.1

### :bug: (Bug Fix)

* fix(instrumentation): don't add `@opentelemetry/api-logs` as a `peerDependency`

## 0.49.0

### :boom: Breaking Change

* fix(otlp-exporter-base)!: remove unload event from OTLPExporterBrowserBase [#4438](https://github.com/open-telemetry/opentelemetry-js/pull/4438) @eldavojohn
  * Reason: The 'unload' event prevents sites from taking advantage of Google's [backward/forward cache](https://web.dev/articles/bfcache#never_use_the_unload_event) and will be [deprecated](https://developer.chrome.com/articles/deprecating-unload/).  It is now up to the consuming site to implement these shutdown events.
  * This breaking change affects users under this scenario:
    1. A user extends the exporter and overrides the shutdown function, and does something which is usually called by the unload listener
    2. We remove the unload event listener
    3. That user's overridden shutdown function no longer gets called

### :rocket: (Enhancement)

* feat(instrumentation): allow LoggerProvider to be specified in Instrumentations [#4314](https://github.com/open-telemetry/opentelemetry-js/pull/4314) @hectorhdzg
* feat(instrumentation): add getModuleDefinitions() to InstrumentationBase [#4475](https://github.com/open-telemetry/opentelemetry-js/pull/4475) @pichlermarc
* feat(exporter-metrics-otlp-http): add option to set the exporter aggregation preference  [#4409](https://github.com/open-telemetry/opentelemetry-js/pull/4409) @AkselAllas
* feat(node-sdk): add spanProcessors option [#4454](https://github.com/open-telemetry/opentelemetry-js/pull/4454) @naseemkullah

### :bug: (Bug Fix)

* fix(sdk-node): allow using samplers when the exporter is defined in the environment [#4394](https://github.com/open-telemetry/opentelemetry-js/pull/4394) @JacksonWeber
* fix(instrumentation): normalize paths for internal files in scoped packages [#4467](https://github.com/open-telemetry/opentelemetry-js/pull/4467) @pichlermarc
  * Fixes a bug where, on Windows, internal files on scoped packages would not be instrumented.
* fix(otlp-transformer): only use BigInt inside hrTimeToNanos() [#4484](https://github.com/open-telemetry/opentelemetry-js/pull/4484) @pichlermarc
* fix(instrumentation-fetch): do not enable in Node.js; clarify in docs this instr is for web fetch only [#4498](https://github.com/open-telemetry/opentelemetry-js/pull/4498) @trentm

### :house: (Internal)

* refactor(instrumentation-grpc): clean up remnants of 'grpc' package instrumentation [#4420](https://github.com/open-telemetry/opentelemetry-js/pull/4420) @pichlermarc

## 0.48.0

### :boom: Breaking Change

* fix(instrumentation)!: pin import-in-the-middle@1.7.1 [#4441](https://github.com/open-telemetry/opentelemetry-js/pull/4441)
  * Fixes a bug where, in some circumstances, ESM instrumentation packages would try to instrument CJS exports on ESM, causing the end-user application to crash.
  * This breaking change only affects users that are using the *experimental* `@opentelemetry/instrumentation/hook.mjs` loader hook AND Node.js 18.19 or later:
    * This reverts back to an older version of `import-in-the-middle` due to <https://github.com/DataDog/import-in-the-middle/issues/57>
    * This version does not support Node.js 18.19 or later

### :bug: (Bug Fix)

* fix(exporter-prometheus): avoid invoking callback synchronously [#4431](https://github.com/open-telemetry/opentelemetry-js/pull/4431) @legendecas
* fix(exporter-logs-otlp-grpc): set User-Agent header [#4398](https://github.com/open-telemetry/opentelemetry-js/pull/4398) @Vunovati
* fix(exporter-logs-otlp-http): set User-Agent header [#4398](https://github.com/open-telemetry/opentelemetry-js/pull/4398) @Vunovati
* fix(exporter-logs-otlp-proto): set User-Agent header [#4398](https://github.com/open-telemetry/opentelemetry-js/pull/4398) @Vunovati
* fix(instrumentation-fetch): compatibility with Map types for fetch headers

### :house: (Internal)

* refactor(exporter-prometheus): promisify prometheus tests [#4431](https://github.com/open-telemetry/opentelemetry-js/pull/4431) @legendecas

## 0.47.0

### :boom: Breaking Change

* fix(exporter-logs-otlp-http)!: programmatic headers take precedence over environment variables [#2370](https://github.com/open-telemetry/opentelemetry-js/pull/4351) @Vunovati
* fix(exporter-logs-otlp-proto)!: programmatic headers take precedence over environment variables [#2370](https://github.com/open-telemetry/opentelemetry-js/pull/4351) @Vunovati
* fix(exporter-trace-otlp-http)!: programmatic headers take precedence over environment variables [#2370](https://github.com/open-telemetry/opentelemetry-js/pull/4351) @Vunovati
* fix(exporter-trace-otlp-proto)!: programmatic headers take precedence over environment variables [#2370](https://github.com/open-telemetry/opentelemetry-js/pull/4351) @Vunovati

### :bug: (Bug Fix)

* fix(instrumentation): use caret range on import-in-the-middle [#4380](https://github.com/open-telemetry/opentelemetry-js/pull/4380) @pichlermarc
* fix(instrumentation): do not import 'path' in browser runtimes [#4386](https://github.com/open-telemetry/opentelemetry-js/pull/4386) @pichlermarc
  * Fixes a bug where bundling for web would fail due to `InstrumentationNodeModuleDefinition` importing `path`

## 0.46.0

### :boom: Breaking Change

* fix(exporter-metrics-otlp-grpc): programmatic headers take precedence over environment variables [#2370](https://github.com/open-telemetry/opentelemetry-js/pull/4334) @Vunovati
* fix(exporter-metrics-otlp-http): programmatic headers take precedence over environment variables [#2370](https://github.com/open-telemetry/opentelemetry-js/pull/4334) @Vunovati
* fix(exporter-metrics-otlp-proto): programmatic headers take precedence over environment variables [#2370](https://github.com/open-telemetry/opentelemetry-js/pull/4334) @Vunovati
* fix(otlp-exporter-base)!: decrease default concurrency limit to 30 [#4211](https://github.com/open-telemetry/opentelemetry-js/pull/4211) @pichlermarc
  * fixes a memory leak on prolonged collector unavailability
  * this change is marked as breaking as it changes defaults

### :rocket: (Enhancement)

* feat(sdk-logs): add droppedAttributesCount field to ReadableLogRecord

### :bug: (Bug Fix)

* fix(sdk-logs): await async resources in log processors
* fix(sdk-logs): avoid map attribute set when count limit exceeded
* fix(instrumentation-fetch): only access navigator if it is defined [#4063](https://github.com/open-telemetry/opentelemetry-js/pull/4063)
  * allows for experimental usage of this instrumentation with non-browser runtimes
* fix(instrumentation-http): memory leak when responses are not resumed
* fix(instrumentation-http): Do not mutate given headers object for outgoing http requests. Fixes aws-sdk signing error on retries. [#4346](https://github.com/open-telemetry/opentelemetry-js/pull/4346)
* fix(instrumentation): support Node.js v18.19.0 by using import-in-the-middle@1.6.0

## 0.45.1

### :bug: (Bug Fix)

* Bumps all dependencies to explicitly include Stable v1.18.1 packages

## 0.45.0

### :boom: Breaking Change

* fix(sdk-node)!: remove the explicit dependency on @opentelemetry/exporter-jaeger that was kept on the previous release
  * '@opentelemetry/exporter-jaeger' is no longer be a dependency of this package. To continue using '@opentelemetry/exporter-jaeger', please install it manually.
    * NOTE: `@opentelemetry/exporter-jaeger` is deprecated, consider switching to one of the alternatives described [here](https://www.npmjs.com/package/@opentelemetry/exporter-jaeger)
* fix(otlp-transformer)!: OTLP json encoding [#4220](https://github.com/open-telemetry/opentelemetry-js/pull/4220) @seemk
  * Fixes a bug in the OTLP (http/json) exporters where timestamps were not encoded as strings, causing the export to
    be rejected by OTLP endpoints

## 0.44.0

### :boom: Breaking Change

* fix(exporter-logs-otlp-proto): change OTLPLogExporter to OTLPLogExporter [#4140](https://github.com/open-telemetry/opentelemetry-js/pull/4140) @Vunovati
* fix(sdk-node): remove explicit dependency on @opentelemetry/exporter-jaeger
  * '@opentelemetry/exporter-jaeger' is no longer be a dependency of this package. To continue using '@opentelemetry/exporter-jaeger', please install it manually.
    * NOTE: `@opentelemetry/exporter-jaeger` is deprecated, consider switching to one of the alternatives described [here](https://www.npmjs.com/package/@opentelemetry/exporter-jaeger)
* fix(sdk-logs): hide internal methods with internal shared state [#3865](https://github.com/open-telemetry/opentelemetry-js/pull/3865) @legendecas

### :rocket: (Enhancement)

* feat(exporter-metrics-otlp-proto): add esm build [#4099](https://github.com/open-telemetry/opentelemetry-js/pull/4099) @pichlermarc
* feat(opencensus-shim): implement OpenCensus metric producer [#4066](https://github.com/open-telemetry/opentelemetry-js/pull/4066) @aabmass

### :bug: (Bug Fix)

* fix(otlp-exporter-base): replaced usage of window with _globalThis [#4157](https://github.com/open-telemetry/opentelemetry-js/pull/4157) @cristianmadularu
* fix(otlp-transformer): Avoid precision loss when converting from HrTime to unix nanoseconds. [#4062](https://github.com/open-telemetry/opentelemetry-js/pull/4062)

## 0.43.0

### :bug: (Bug Fix)

* Revert "feat(api): add attributes argument to recordException API [#4071](https://github.com/open-telemetry/opentelemetry-js/pull/4071)"
  * This feature was an unintentional breaking change introduced with API 1.5.0
  * This PR updates all experimental packages to allow API 1.6.0, where this change has been reverted.

## 0.42.0

### :boom: Breaking Change

* chore(sdk-node): deprecate methods in favor of constructor options [#3996](https://github.com/open-telemetry/opentelemetry-js/pull/3996) @pichlermarc
  * The following methods are now deprecated and will be removed in `0.43.0`
    * `NodeSDK.configureTracerProvider()`, please use constructor options instead
    * `NodeSDK.configureMeterProvider()`, please use constructor options instead
    * `NodeSDK.configureLoggerProvider()`, please use constructor options instead
    * `NodeSDK.addResource()`, please use constructor options instead
    * `NodeSDK.detectResources()`, this is not necessary anymore, resources are now auto-detected on startup.
* chore(sdk-node): add notice that '@opentelemetry/exporter-jaeger' has to be installed manually in the next version [#4068](https://github.com/open-telemetry/opentelemetry-js/pull/4068) @pichlermarc
  * Starting with 0.43.0 '@opentelemetry/exporter-jaeger' will no longer be a dependency of this package. To continue using '@opentelemetry/exporter-jaeger', please install it manually.
    * NOTE: `@opentelemetry/exporter-jaeger` is deprecated, consider switching to one of the alternatives described [here](https://www.npmjs.com/package/@opentelemetry/exporter-jaeger)

### :rocket: (Enhancement)

* feat: update PeriodicExportingMetricReader and PrometheusExporter to accept optional metric producers [#4077](https://github.com/open-telemetry/opentelemetry-js/pull/4077) @aabmass

### :bug: (Bug Fix)

* fix(exporter-logs-otlp-http): add @opentelemetry/api-logs as dependency

## 0.41.2

### :bug: (Bug Fix)

* fix(opentelemetry-exporter-logs-otlp-http): Add otel-api as dev dep for tests as they are directly importing the api and which is breaking the web-sandbox tests which is using rollup
* fix(instrumentation-grpc): instrument @grpc/grpc-js Client methods [#3804](https://github.com/open-telemetry/opentelemetry-js/pull/3804) @pichlermarc

## 0.41.1

### :books: (Refine Doc)

* docs(sdk-metrics): add example of exponential histogram metric [#3855](https://github.com/open-telemetry/opentelemetry-js/pull/3855) @JamieDanielson

### :rocket: (Enhancement)

* feat(sdk-node): logs support added [#3969](https://github.com/open-telemetry/opentelemetry-js/pull/3969) @psk001

### :bug: (Bug Fix)

* Revert "feat(minification): Add noEmitHelpers, importHelpers and tslib as a dependency (#3914)"
  [#4011](https://github.com/open-telemetry/opentelemetry-js/pull/4011) @dyladan

## 0.41.0

### :boom: Breaking Change

* chore(instrumentation-grpc): Drop support for package `grpc`. [#3807](https://github.com/open-telemetry/opentelemetry-js/pull/3807) @llc1123

### :rocket: (Enhancement)

* feat(otlp-grpc-exporters): add support for UDS endpoints. [#3853](https://github.com/open-telemetry/opentelemetry-js/pull/3853) @llc1123
* feat(otlp-exporters): bump otlp proto to 0.20.0 [#3932](https://github.com/open-telemetry/opentelemetry-js/pull/3932) @pichlermarc
* feat(exporter-metrics-otlp-*): add LowMemory metrics temporality preference [#3915](https://github.com/open-telemetry/opentelemetry-js/pull/3915) @martinkuba
  * Adds support for [LowMemory temporality preference](https://github.com/open-telemetry/opentelemetry-specification/blob/f09624bb97e9be3be259733b93be507df18927bd/specification/metrics/sdk_exporters/otlp.md#additional-configuration)
  * Adds support for `lowmemory` in `OTEL_EXPORTER_OTLP_METRICS_TEMPORALITY_PREFERENCE`

### :bug: (Bug Fix)

* fix(exporter-logs-otlp-http): set useHex to true [#3875](https://github.com/open-telemetry/opentelemetry-js/pull/3875) @Nico385412
* fix(otlp-proto-exporter-base): add missing type import [#3937](https://github.com/open-telemetry/opentelemetry-js/pull/3937) @pichlermarc
* fix(example-opencensus-shim): avoid OpenCensus auto instrumentations [#3951](https://github.com/open-telemetry/opentelemetry-js/pull/3951) @llc1123
* fix(http-intrumentation): prevent request socket null from throwing uncaught error [#3858](https://github.com/open-telemetry/opentelemetry-js/pull/3858) @aodysseos

### :house: (Internal)

* chore(instrumentation-grpc): Cleanup remnants of grpc-native support. [#3886](https://github.com/open-telemetry/opentelemetry-js/pull/3886) @llc1123

## 0.40.0

### :boom: Breaking Change

* fix(exporter-logs-otlp-grpc): change OTLPLogsExporter to OTLPLogExporter [#3819](https://github.com/open-telemetry/opentelemetry-js/pull/3819) @fuaiyi
* chore(instrumentation-grpc): add 'grpc' deprecation notice postinstall script [#3833](https://github.com/open-telemetry/opentelemetry-js/pull/3833) @pichlermarc
  * Support for telemetry generation for the [`grpc`](https://www.npmjs.com/package/grpc) module will be dropped in the next release as the package has been
    deprecated for over 1 year, please migrate to [`@grpc/grpc-js`](https://www.npmjs.com/package/@grpc/grpc-js) to continue receiving telemetry.

### :rocket: (Enhancement)

* feat(api-logs): support map in log attributes. [#3821](https://github.com/open-telemetry/opentelemetry-js/pull/3821) @Abinet18
* feat(instrumentation): add ESM support for instrumentation. [#3698](https://github.com/open-telemetry/opentelemetry-js/pull/3698) @JamieDanielson, @pkanal, @vmarchaud, @lizthegrey, @bengl
* feat(exporter-logs-otlp-http): otlp-http exporter for logs. [#3764](https://github.com/open-telemetry/opentelemetry-js/pull/3764/) @fuaiyi
* feat(otlp-trace-exporters): Add User-Agent header to OTLP trace exporters. [#3790](https://github.com/open-telemetry/opentelemetry-js/pull/3790) @JamieDanielson
* feat(otlp-metric-exporters): Add User-Agent header to OTLP metric exporters. [#3806](https://github.com/open-telemetry/opentelemetry-js/pull/3806) @JamieDanielson
* feat(opencensus-shim): add OpenCensus trace shim [#3809](https://github.com/open-telemetry/opentelemetry-js/pull/3809) @aabmass
* feat(exporter-logs-otlp-proto): protobuf exporter for logs. [#3779](https://github.com/open-telemetry/opentelemetry-js/pull/3779) @Abinet18

### :bug: (Bug Fix)

* fix(sdk-node): use resource interface instead of concrete class [#3803](https://github.com/open-telemetry/opentelemetry-js/pull/3803) @blumamir
* fix(sdk-logs): remove includeTraceContext configuration and use LogRecord context when available  [#3817](https://github.com/open-telemetry/opentelemetry-js/pull/3817) @hectorhdzg

## 0.39.1

### :bug: (Bug Fix)

* fix(otlp-transformer): move api-logs to dependencies [#3798](https://github.com/open-telemetry/opentelemetry-js/pull/3798) @pichlermarc

## 0.39.0

### :rocket: (Enhancement)

* feat(otlp-transformer): support log records. [#3712](https://github.com/open-telemetry/opentelemetry-js/pull/3712/) @llc1123
* feat(otlp-grpc-exporter-base): support log records. [#3712](https://github.com/open-telemetry/opentelemetry-js/pull/3712/) @llc1123
* feat(exporter-logs-otlp-grpc): otlp-grpc exporter for logs. [#3712](https://github.com/open-telemetry/opentelemetry-js/pull/3712/) @llc1123
* feat(otlp-grpc-exporter-base): use statically generated protobuf code [#3705](https://github.com/open-telemetry/opentelemetry-js/pull/3705) @pichlermarc
* refactor(otlp-transformer): refine metric transformers. [#3770](https://github.com/open-telemetry/opentelemetry-js/pull/3770/) @llc1123
* feat(api-logs): add `ObservedTimestamp` to `LogRecord`. [#3787](https://github.com/open-telemetry/opentelemetry-js/pull/3787/) @llc1123

### :bug: (Bug Fix)

* fix(instrumentation): update `require-in-the-middle` to v7.1.0 [#3727](https://github.com/open-telemetry/opentelemetry-js/pull/3727) @trentm
* fix(instrumentation): update `require-in-the-middle` to v7.0.1 [#3743](https://github.com/open-telemetry/opentelemetry-js/pull/3743) @trentm

### :books: (Refine Doc)

* doc(instrumentation): add limitiations section to readme [#3786](https://github.com/open-telemetry/opentelemetry-js/pull/3786) @flarna

## 0.38.0

### :boom: Breaking Change

* fix: remove HTTP/HTTPS prefix from span name in instrumentation-xml-http-request [#3672](https://github.com/open-telemetry/opentelemetry-js/pull/3672) @jufab
* fix(sdk-node)!: remove unused defaultAttributes option [#3724](https://github.com/open-telemetry/opentelemetry-js/pull/3724) @pichlermarc
  * Please use `NodeSDKConfiguration.resource` instead

### :rocket: (Enhancement)

* feat(sdk-logs): use logs API 0.38

### :bug: (Bug Fix)

* fix(sdk-node): only set DiagConsoleLogger when OTEL_LOG_LEVEL is set [#3693](https://github.com/open-telemetry/opentelemetry-js/pull/3693) @pichlermarc

## 0.37.0

### :boom: Breaking Change

* fix: remove HTTP/HTTPS prefix from span name in instrumentation-xml-http-request [#3672](https://github.com/open-telemetry/opentelemetry-js/pull/3672) @jufab

### :rocket: (Enhancement)

* feat(api-logs): 1.`LogRecord` fields update: `traceFlags`/`traceId`/`spanId` -> `context`; 2.`Logger` supports configuring `includeTraceContext`; 3.The `onEmit` method of `LogRecordProcessor` supports the `context` field.  [#3549](https://github.com/open-telemetry/opentelemetry-js/pull/3549/) @fuaiyi
* feat(sdk-logs): logs sdk implementation. [#3549](https://github.com/open-telemetry/opentelemetry-js/pull/3549/) @fuaiyi

## 0.36.0

### :boom: Breaking Change

* feat: remove HTTP/HTTPS prefix from span name [#3603](https://github.com/open-telemetry/opentelemetry-js/pull/3603) @Flarna

### :rocket: (Enhancement)

* feat: use HTTP_ROUTE in span name [#3603](https://github.com/open-telemetry/opentelemetry-js/pull/3603) @Flarna
* feat: add HTTP_ROUTE attribute to http incoming metrics if present [#3581](https://github.com/open-telemetry/opentelemetry-js/pull/3581) @hermogenes
* feat(opentelemetry-instrumentation-grpc): allow to add attributes from grpc metadata in the patched server [#3589](https://github.com/open-telemetry/opentelemetry-js/pull/3589) @zombispormedio
* feat(sdk-node): install diag logger with OTEL_LOG_LEVEL [#3627](https://github.com/open-telemetry/opentelemetry-js/pull/3627) @legendecas
* feat(otlp-exporter-base): add retries [#3207](https://github.com/open-telemetry/opentelemetry-js/pull/3207) @svetlanabrennan
* feat(sdk-node): override IdGenerator when using NodeSDK [#3645](https://github.com/open-telemetry/opentelemetry-js/pull/3645) @haddasbronfman
* feat(otlp-transformer): expose dropped attributes, events and links counts on the transformed otlp span [#3576](https://github.com/open-telemetry/opentelemetry-js/pull/3576) @mohitk05

### :bug: (Bug Fix)

* fix(prometheus-exporter): add possibility to respond to errors returned by `server.listen()` [#3552](https://github.com/open-telemetry/opentelemetry-js/pull/3402) @pichlermarc
* fix(sdk-node): update instrumentations once MeterProvider is initialized [#3624](https://github.com/open-telemetry/opentelemetry-js/pull/3624) @pichlermarc

## 0.35.1

### :bug: (Bug Fix)

* fix: remove JSON syntax error and regenerate tsconfig files [#3566](https://github.com/open-telemetry/opentelemetry-js/pull/3566) @Flarna
  * Fixes an error where the generated JS files were not included in the esnext package due to a failure of the tsconfig generation
* fix(sdk-node): register instrumentations early [#3502](https://github.com/open-telemetry/opentelemetry-js/pull/3502) @flarna
* fix: include tracestate in export [#3569](https://github.com/open-telemetry/opentelemetry-js/pull/3569) @flarna
* fix(http) Remove outgoing headers normalization [#3557](https://github.com/open-telemetry/opentelemetry-js/pull/3557) @marcinjahn

## 0.35.0

### :rocket: (Enhancement)

* feat(instrumentation-http): monitor error events with events.errorMonitor [#3402](https://github.com/open-telemetry/opentelemetry-js/pull/3402) @legendecas
* feat(instrumentation-grpc): added grpc metadata client side attributes in instrumentation [#3386](https://github.com/open-telemetry/opentelemetry-js/pull/3386)
* feat(instrumentation): add new `_setMeterInstruments` protected method that update the meter instruments every meter provider update.
* feat(api-logs): add the `SeverityNumber` enumeration. [#3443](https://github.com/open-telemetry/opentelemetry-js/pull/3443/) @fuaiyi
* feat(sdk-node): configure no-op sdk with `OTEL_SDK_DISABLED` environment variable [#3485](https://github.com/open-telemetry/opentelemetry-js/pull/3485/files/2211c78aec39aeb6b4b3dae71844edf8ce234d20)  @RazGvili

### :bug: (Bug Fix)

* fix(instrumentation-xhr): http.url attribute should be absolute [#3200](https://github.com/open-telemetry/opentelemetry-js/pull/3200) @t2t2
* fix(instrumentation-grpc): always set grpc semcov status code attribute with numeric value [#3076](https://github.com/open-telemetry/opentelemetry-js/pull/3076) @blumamir
* fix(instrumentation): only call `onRequire` for full matches on core modules with sub-paths [#3451](https://github.com/open-telemetry/opentelemetry-js/pull/3451) @mhassan1
* fix(instrumentation): add back support for absolute paths via `require-in-the-middle` [#3457](https://github.com/open-telemetry/opentelemetry-js/pull/3457) @mhassan1
* fix(prometheus-sanitization): replace repeated `_` with a single `_` [3470](https://github.com/open-telemetry/opentelemetry-js/pull/3470) @samimusallam
* fix(prometheus-serializer): correct string used for NaN [#3477](https://github.com/open-telemetry/opentelemetry-js/pull/3477) @JacksonWeber
* fix(instrumentation-http): close server span when response finishes [#3407](https://github.com/open-telemetry/opentelemetry-js/pull/3407) @legendecas
* fix(instrumentation-fetch): make spans resilient to clock drift by using Date.now [#3434](https://github.com/open-telemetry/opentelemetry-js/pull/3434) @dyladan
* fix(instrumentation-xml-http-request): make spans resilient to clock drift by using Date.now [#3434](https://github.com/open-telemetry/opentelemetry-js/pull/3434) @dyladan
* fix(sdk-node): fix exporter to be read only OTEL_TRACES_EXPORTER is set to a valid exporter [3492] @svetlanabrennan

### :house: (Internal)

* chore(otlp-proto-exporter-base): upgrade protobufjs to 7.1.2 and relax versioning [#3433](https://github.com/open-telemetry/opentelemetry-js/pull/3433) @seemk

## 0.34.0

* `@opentelemetry/sdk-metrics` moved to [packages/sdk-metrics](../packages/sdk-metrics)
* `@opentelemetry/api-metrics` deprecated and merged into [api](../api)

### :rocket: (Enhancement)

* feat(metrics-sdk): Add tracing suppresing for Metrics Export [#3332](https://github.com/open-telemetry/opentelemetry-js/pull/3332) @hectorhdzg
* feat(instrumentation): implement `require-in-the-middle` singleton [#3161](https://github.com/open-telemetry/opentelemetry-js/pull/3161) @mhassan1
* feat(sdk-node): configure trace exporter with environment variables [#3143](https://github.com/open-telemetry/opentelemetry-js/pull/3143) @svetlanabrennan
* feat: enable tree shaking [#3329](https://github.com/open-telemetry/opentelemetry-js/pull/3329) @pkanal
* feat(prometheus): serialize resource as target_info gauge [#3300](https://github.com/open-telemetry/opentelemetry-js/pull/3300) @pichlermarc
* feat(detectors): add browser detector module [#3292](https://github.com/open-telemetry/opentelemetry-js/pull/3292) @abinet18
* deps: remove unused proto-loader dependencies and update grpc-js and proto-loader versions [#3337](https://github.com/open-telemetry/opentelemetry-js/pull/3337) @seemk
* feat(metrics-exporters): configure temporality via environment variable [#3305](https://github.com/open-telemetry/opentelemetry-js/pull/3305) @pichlermarc
* feat(console-metric-exporter): add temporality configuration [#3387](https://github.com/open-telemetry/opentelemetry-js/pull/3387) @pichlermarc

### :bug: (Bug Fix)

* fix(node-sdk): move `@opentelemetry/semantic-conventions` to `dependencies` [#3283](https://github.com/open-telemetry/opentelemetry-js/pull/3283) @mhassan1
* fix(exporters): do not append trailing '/' when URL contains path [#3274](https://github.com/open-telemetry/opentelemetry-js/pull/3274) @pichlermarc
* fix(instrumentation): debug log on no modules defined for instrumentation [#3308](https://github.com/open-telemetry/opentelemetry-js/pull/3308) @legendecas

### :books: (Refine Doc)

* docs(metrics-exporters): fix wrong exporter const name in example [#3270](https://github.com/open-telemetry/opentelemetry-js/issues/3270) @pichlermarc

### :house: (Internal)

* ci(instrumentation-http): remove got devDependency
  [#3347](https://github.com/open-telemetry/opentelemetry-js/issues/3347) @dyladan
* deps(instrumentation-http): move sdk-metrics to dev dependencies [#3380](https://github.com/open-telemetry/opentelemetry-js/issues/3380) @pichlermarc

## 0.33.0

### :boom: Breaking Change

* Add `resourceDetectors` option to `NodeSDK` [#3210](https://github.com/open-telemetry/opentelemetry-js/issues/3210)
  * `NodeSDK.detectResources()` function is no longer able to receive config as a parameter.
    Instead, the detectors are passed to the constructor.

* chore(metrics-sdk): clean up exports [#3197](https://github.com/open-telemetry/opentelemetry-js/pull/3197) @pichlermarc
  * removes export for:
    * `AccumulationRecord`
    * `Aggregator`
    * `AggregatorKind`
    * `Accumulation`
    * `createInstrumentDescriptor`
    * `createInstrumentDescriptorWithView`
    * `isDescriptorCompatibleWith`
* chore(api-metrics): clean up exports [#3198](https://github.com/open-telemetry/opentelemetry-js/pull/3198) @pichlermarc
  * removes export for:
    * `NOOP_COUNTER_METRIC`
    * `NOOP_HISTOGRAM_METRIC`
    * `NOOP_METER_PROVIDER`
    * `NOOP_OBSERVABLE_COUNTER_METRIC`
    * `NOOP_OBSERVABLE_GAUGE_METRIC`
    * `NOOP_OBSERVABLE_UP_DOWN_COUNTER_METRIC`
    * `NOOP_UP_DOWN_COUNTER_METRIC`
    * `NoopCounterMetric`
    * `NoopHistogramMetric`
    * `NoopMeter`
    * `NoopMeterProvider`
    * `NoopMetric`
    * `NoopObservableCounterMetric`
    * `NoopObservableGaugeMetric`
    * `NoopObservableMetric`
    * `NoopObservableUpDownCounterMetric`
    * `NoopUpDownCounterMetric`
* feat(sdk-metrics): align MetricReader with specification and other language implementations [#3225](https://github.com/open-telemetry/opentelemetry-js/pull/3225) @pichlermarc
* chore(sdk-metrics): remove accidental export of the SDK `Meter` class [#3243](https://github.com/open-telemetry/opentelemetry-js/pull/3243) @pichlermarc

### :rocket: (Enhancement)

* Add `resourceDetectors` option to `NodeSDK` [#3210](https://github.com/open-telemetry/opentelemetry-js/issues/3210)
* feat: add Logs API @mkuba [#3117](https://github.com/open-telemetry/opentelemetry-js/pull/3117)

### :books: (Refine Doc)

* docs(sdk-metrics): fix typos and add missing parameter docs. [#3244](https://github.com/open-telemetry/opentelemetry-js/pull/3244) @pichlermarc

### :house: (Internal)

* ci(instrumentation-http): improve metrics test stability [#3242](https://github.com/open-telemetry/opentelemetry-js/pull/3242) @pichlermarc
* deps: remove unused protobufjs and update used ones to 7.1.1 #3251 [#3251](https://github.com/open-telemetry/opentelemetry-js/pull/3251) @pichlermarc

## 0.32.0

### :boom: Breaking Change

* Rename @opentelemetry/sdk-metrics-base package to @opentelemetry/sdk-metrics  [#3162](https://github.com/open-telemetry/opentelemetry-js/pull/3162) @hectorhdzg

### :rocket: (Enhancement)

* feature(instrumentation-http): Add HTTP Server and Client duration Metrics in HTTP Node.js Instrumentation [#3149](https://github.com/open-telemetry/opentelemetry-js/pull/3149) @hectorhdzg
* fix(add-views-to-node-sdk): added the ability to define meter views in `NodeSDK` [#3066](https://github.com/open-telemetry/opentelemetry-js/pull/3124) @weyert
* feature(add-console-metrics-exporter): add ConsoleMetricExporter [#3120](https://github.com/open-telemetry/opentelemetry-js/pull/3120) @weyert
* feature(prometheus-serialiser): export the unit block when unit is set in metric descriptor [#3066](https://github.com/open-telemetry/opentelemetry-js/pull/3041) @weyert
* feat: support latest `@opentelemetry/api` [#3177](https://github.com/open-telemetry/opentelemetry-js/pull/3177) @dyladan
* feat(sdk-metrics-base): add per metric-reader aggregation support [#3153](https://github.com/open-telemetry/opentelemetry-js/pull/3153) @legendecas
* chore(deps): update prometheus example dependencies to 0.32 [#3126](https://github.com/open-telemetry/opentelemetry-js/pull/3216) @avzis
* feature(opentelemetry-api-metrics): Adding generics to `create{metricType}` [#3151](https://github.com/open-telemetry/opentelemetry-js/issues/3151) @tomerghelber-tm

### :bug: (Bug Fix)

* fix(instrumentation-http): add `http.host` attribute before sending the request #3054 @cuichenli

## 0.31.0

### :boom: Breaking Change

* feature(views): move views registration to MeterProvider constructor [#3066](https://github.com/open-telemetry/opentelemetry-js/pull/3066) @pichlermarc
* feat(sdk-metrics-base): split up Singular into Sum and Gauge in MetricData [#3079](https://github.com/open-telemetry/opentelemetry-js/pull/3079) @pichlermarc
  * removes `DataPointType.SINGULAR`, and replaces it with `DataPointType.SUM` and `DataPointType.GAUGE`
  * removes `SingularMetricData` and replaces it with `SumMetricData` (including an additional `isMonotonic` flag) and `GaugeMetricData`
* feat(histogram): align collection of optional Histogram properties with spec [#3102](https://github.com/open-telemetry/opentelemetry-js/pull/3079) @pichlermarc
  * changes type of `sum` property on `Histogram` to `number | undefined`
  * changes type of `min` and `max` properties on `Histogram` to `number | undefined`
  * removes `hasMinMax` flag on the exported `Histogram` - this is now indicated by `min` and `max` being `undefined`

### :rocket: (Enhancement)

* feat(metrics-api): use common attributes definitions #3038 @legendecas
* feat(otlp-proto): pre-compile proto files [#3098](https://github.com/open-telemetry/opentelemetry-js/pull/3098) @legendecas
* feat(opentelemetry-sdk-metrics-base): added InMemoryMetricExporter [#3039](https://github.com/open-telemetry/opentelemetry-js/pull/3039) @weyert

### :bug: (Bug Fix)

* fix(histogram): fix maximum when only values < -1 are provided [#3086](https://github.com/open-telemetry/opentelemetry-js/pull/3086) @pichlermarc
* fix(instrumentation-grpc): always set grpc semcov status code attribute with numeric value [#3076](https://github.com/open-telemetry/opentelemetry-js/pull/3076) @blumamir

## 0.30.0

### :boom: Breaking Change

* fix: remove aws and gcp detector from SDK [#3024](https://github.com/open-telemetry/opentelemetry-js/pull/3024) @flarna
* feat(sdk-metrics-base): implement min/max recording for Histograms [#3032](https://github.com/open-telemetry/opentelemetry-js/pull/3032) @pichlermarc
  * adds `min`/`max` recording to Histograms
  * updates [opentelemetry-proto](https://github.com/open-telemetry/opentelemetry-proto) to `0.18` so that `min` and
    `max` can be exported. This change breaks the OTLP/JSON Metric Exporter for all collector versions `<0.52` due to
    [open-telemetry/opentelemetry-collector#5312](https://github.com/open-telemetry/opentelemetry-collector/issues/5312).

### :rocket: (Enhancement)

* feat(opentelemetry-instrumentation-fetch): optionally ignore network events [#3028](https://github.com/open-telemetry/opentelemetry-js/pull/3028) @gregolsen
* feat(http-instrumentation): record exceptions in http instrumentation [#3008](https://github.com/open-telemetry/opentelemetry-js/pull/3008) @luismiramirez
* feat(node-sdk): add serviceName config option [#2867](https://github.com/open-telemetry/opentelemetry-js/pull/2867) @naseemkullah
* feat(opentelemetry-exporter-prometheus): export PrometheusSerializer [#3034](https://github.com/open-telemetry/opentelemetry-js/pull/3034) @matschaffer
* feat(sdk-metrics-base): detect resets on async metrics [#2990](https://github.com/open-telemetry/opentelemetry-js/pull/2990) @legendecas
  * Added monotonicity support in SumAggregator.
  * Added reset and gaps detection for async metric instruments.
  * Fixed the start time and end time of an exported metric with regarding to resets and gaps.

### :bug: (Bug Fix)

* fix(otlp-transformer): remove type dependency on Long [#3022](https://github.com/open-telemetry/opentelemetry-js/pull/3022) @legendecas
* fix(grpc-exporter): use non-normalized URL to determine channel security [#3019](https://github.com/open-telemetry/opentelemetry-js/pull/3019) @pichlermarc
* fix(otlp-exporter-base): fix gzip output stream in http otlp export [#3046](https://github.com/open-telemetry/opentelemetry-js/pull/3046) @mattolson
* docs(grpc-exporters): remove 'web' as supported from README.md [#3070](https://github.com/open-telemetry/opentelemetry-js/pull/3070) @pichlermarc

### :house: (Internal)

* test: add node 18 and remove EoL node versions [#3048](https://github.com/open-telemetry/opentelemetry-js/pull/3048) @dyladan

## 0.29.2

* Support for 1.3.1 of stable packages

## 0.29.1

### :bug: (Bug Fix)

* fix(sdk-metrics-base): only record non-negative histogram values [#3002](https://github.com/open-telemetry/opentelemetry-js/pull/3002) @pichlermarc
* fix(otlp-transformer): include missing prepublishOnly script which ensures esm and esnext build files are created and packaged @dyladan

## 0.29.0

### :boom: Breaking Change

* feat(metrics): metric readers and exporters now select aggregation temporality based on instrument type [#2902](https://github.com/open-telemetry/opentelemetry-js/pull/2902) @seemk
* refactor(metrics-sdk): rename InstrumentationLibrary -> InstrumentationScope [#2959](https://github.com/open-telemetry/opentelemetry-js/pull/2959) @pichlermarc
* feat(metrics): multi-instrument async callback support [#2966](https://github.com/open-telemetry/opentelemetry-js/pull/2966) @legendecas
  * changes on `meter.createObservableCounter`, `meter.createObservableGauge`, `meter.createObservableUpDownCounter`
    * removed the second parameter `callback`
    * returns an `Observable` object on which callbacks can be registered or unregistered.
  * added `meter.addBatchObservableCallback` and `meter.removeBatchObservableCallback`.
* fix: remove attributes from OTLPExporterConfigBase [#2991](https://github.com/open-telemetry/opentelemetry-js/pull/2991) @flarna

### :rocket: (Enhancement)

* feat(exporters): update proto version and use otlp-transformer [#2929](https://github.com/open-telemetry/opentelemetry-js/pull/2929) @pichlermarc
* fix(sdk-metrics-base): misbehaving aggregation temporality selector tolerance [#2958](https://github.com/open-telemetry/opentelemetry-js/pull/2958) @legendecas
* feat(trace-otlp-grpc): configure security with env vars [#2827](https://github.com/open-telemetry/opentelemetry-js/pull/2827) @svetlanabrennan
* feat(sdk-metrics-base): async instruments callback timeout [#2742](https://github.com/open-telemetry/opentelemetry-js/pull/2742) @legendecas

### :bug: (Bug Fix)

* fix(opentelemetry-instrumentation-http): use correct origin when port is `null` [#2948](https://github.com/open-telemetry/opentelemetry-js/pull/2948) @danielgblanco
* fix(otlp-exporter-base): include esm and esnext in package files [#2952](https://github.com/open-telemetry/opentelemetry-js/pull/2952) @dyladan
* fix(otlp-http-exporter): update endpoint to match spec [#2895](https://github.com/open-telemetry/opentelemetry-js/pull/2895) @svetlanabrennan
* fix(instrumentation): only patch core modules if enabled [#2993](https://github.com/open-telemetry/opentelemetry-js/pull/2993) @santigimeno
* fix(otlp-transformer): include esm and esnext in package files and update README [#2992](https://github.com/open-telemetry/opentelemetry-js/pull/2992) @pichlermarc
* fix(metrics): specification compliant default metric unit [#2983](https://github.com/open-telemetry/opentelemetry-js/pull/2983) @andyfleming
* fix(opentelemetry-instrumentation): use all provided patches for the same file [#2963](https://github.com/open-telemetry/opentelemetry-js/pull/2963) @Ugzuzg

## 0.28.0

### :boom: Breaking Change

* feat(sdk-metrics-base): update metric exporter interfaces [#2707](https://github.com/open-telemetry/opentelemetry-js/pull/2707) @srikanthccv
* feat(api-metrics): remove observable types [#2687](https://github.com/open-telemetry/opentelemetry-js/pull/2687) @legendecas
* fix(otlp-http-exporter): remove content length header [#2879](https://github.com/open-telemetry/opentelemetry-js/pull/2879) @svetlanabrennan
* feat(experimental-packages): Update packages to latest SDK Version. [#2871](https://github.com/open-telemetry/opentelemetry-js/pull/2871) @pichlermarc
  * removed the -wip suffix from api-metrics and metrics-sdk-base.
  * updated dependencies to stable packages to `1.1.1` for all "experimental" packages.
  * updated Metrics Exporters to the latest Metrics SDK (`exporter-metrics-otlp-grpc`, `exporter-metrics-otlp-http`, `exporter-metrics-otlp-proto`)
  * updated `opentelemetry-sdk-node` to the latest Metrics SDK.
  * updated `otlp-transformer` to the latest Metrics SDK.
  * updated all `instrumentation-*` packages to use local implementations of `parseUrl()` due to #2884
* refactor(otlp-exporters) move base classes and associated types into their own packages [#2893](https://github.com/open-telemetry/opentelemetry-js/pull/2893) @pichlermarc
  * `otlp-exporter-base` => `OTLPExporterBase`, `OTLPExporterBrowserBase`, `OTLPExporterNodeBase`
  * `otlp-grpc-exporter-base` => `OTLPGRPCExporterNodeBase`
  * `otlp-proto-exporter-base` => `OTLPProtoExporterNodeBase`

### :rocket: (Enhancement)

* feat: spec compliant metric creation and sync instruments [#2588](https://github.com/open-telemetry/opentelemetry-js/pull/2588) @dyladan
* feat(api-metrics): async instruments spec compliance [#2569](https://github.com/open-telemetry/opentelemetry-js/pull/2569) @legendecas
* feat(sdk-metrics-base): add ValueType support for sync instruments [#2776](https://github.com/open-telemetry/opentelemetry-js/pull/2776) @legendecas
* feat(sdk-metrics-base): implement async instruments support [#2686](https://github.com/open-telemetry/opentelemetry-js/pull/2686) @legendecas
* feat(sdk-metrics-base): meter registration [#2666](https://github.com/open-telemetry/opentelemetry-js/pull/2666) @legendecas
* feat(sdk-metrics-base): bootstrap metrics exemplars [#2641](https://github.com/open-telemetry/opentelemetry-js/pull/2641) @srikanthccv
* feat(metrics-sdk): bootstrap aggregation support [#2634](https://github.com/open-telemetry/opentelemetry-js/pull/2634) @legendecas
* feat(metrics-sdk): bootstrap views api [#2625](https://github.com/open-telemetry/opentelemetry-js/pull/2625) @legendecas
* feat(sdk-metrics): bootstrap metric streams [#2636](https://github.com/open-telemetry/opentelemetry-js/pull/2636) @legendecas
* feat(views): add FilteringAttributesProcessor [#2733](https://github.com/open-telemetry/opentelemetry-js/pull/2733) @pichlermarc
* feat(metric-reader): add metric-reader [#2681](https://github.com/open-telemetry/opentelemetry-js/pull/2681) @pichlermarc
* feat(sdk-metrics-base): document and export basic APIs [#2725](https://github.com/open-telemetry/opentelemetry-js/pull/2725) @legendecas
* feat(views): Update addView() to disallow named views that select more than one instrument. [#2820](https://github.com/open-telemetry/opentelemetry-js/pull/2820) @pichlermarc
* feat(sdk-metrics-base): update exporting names [#2829](https://github.com/open-telemetry/opentelemetry-js/pull/2829) @legendecas
* Add grpc compression to trace-otlp-grpc exporter [#2813](https://github.com/open-telemetry/opentelemetry-js/pull/2813) @svetlanabrennan
* refactor: unifying shutdown once with BindOnceFuture [#2695](https://github.com/open-telemetry/opentelemetry-js/pull/2695) @legendecas
* feat(prometheus): update prometheus exporter with wip metrics sdk [#2824](https://github.com/open-telemetry/opentelemetry-js/pull/2824) @legendecas
* feat(instrumentation-xhr): add applyCustomAttributesOnSpan hook [#2134](https://github.com/open-telemetry/opentelemetry-js/pull/2134) @mhennoch
* feat(proto): add @opentelemetry/otlp-transformer package with hand-rolled transformation [#2746](https://github.com/open-telemetry/opentelemetry-js/pull/2746) @dyladan
* feat(sdk-metrics-base): shutdown and forceflush on MeterProvider [#2890](https://github.com/open-telemetry/opentelemetry-js/pull/2890) @legendecas
* feat(sdk-metrics-base): return the same meter for identical input to getMeter [#2901](https://github.com/open-telemetry/opentelemetry-js/pull/2901) @legendecas
* feat(otlp-exporter): add [OTEL_EXPORTER_OTLP_TIMEOUT](https://github.com/open-telemetry/opentelemetry-specification/blob/main/specification/protocol/exporter.md#configuration-options) env var to otlp exporters [#2738](https://github.com/open-telemetry/opentelemetry-js/pull/2738) @svetlanabrennan
* feat(sdk-metrics-base): hoist async instrument callback invocations [#2822](https://github.com/open-telemetry/opentelemetry-js/pull/2822) @legendecas

### :bug: (Bug Fix)

* fix(sdk-metrics-base): remove aggregator.toMetricData dependency on AggregationTemporality [#2676](https://github.com/open-telemetry/opentelemetry-js/pull/2676) @legendecas
* fix(sdk-metrics-base): coerce histogram boundaries to be implicit Infinity [#2859](https://github.com/open-telemetry/opentelemetry-js/pull/2859) @legendecas
* fix(instrumentation-http): HTTP 400 status code should not set span status to error on servers [#2789](https://github.com/open-telemetry/opentelemetry-js/pull/2789) @nordfjord

### :books: (Refine Doc)

* Update metrics example [#2658](https://github.com/open-telemetry/opentelemetry-js/pull/2658) @svetlanabrennan
* docs(api-metrics): add notes on ObservableResult.observe [#2712](https://github.com/open-telemetry/opentelemetry-js/pull/2712) @legendecas

### :house: (Internal)

* chore: move trace exporters back to experimental [#2835](https://github.com/open-telemetry/opentelemetry-js/pull/2835) @dyladan
* refactor(sdk-metrics-base): meter shared states [#2821](https://github.com/open-telemetry/opentelemetry-js/pull/2821) @legendecas

## v0.27.0

### :boom: Breaking Change

* [#2566](https://github.com/open-telemetry/opentelemetry-js/pull/2566) feat!(metrics): remove batch observer ([@dyladan](https://github.com/dyladan))
* [#2485](https://github.com/open-telemetry/opentelemetry-js/pull/2485) feat!: Split metric and trace exporters into new experimental packages ([@willarmiros](https://github.com/willarmiros))
* [#2540](https://github.com/open-telemetry/opentelemetry-js/pull/2540) fix(sdk-metrics-base): remove metric kind BATCH_OBSERVER ([@legendecas](https://github.com/legendecas))
* [#2496](https://github.com/open-telemetry/opentelemetry-js/pull/2496) feat(api-metrics): rename metric instruments to match feature-freeze API specification ([@legendecas](https://github.com/legendecas))

### :rocket: (Enhancement)

* [#2523](https://github.com/open-telemetry/opentelemetry-js/pull/2523) feat: Rename Labels to Attributes ([@pirgeo](https://github.com/pirgeo))
* [#2559](https://github.com/open-telemetry/opentelemetry-js/pull/2559) feat(api-metrics): remove bind/unbind and bound instruments ([@legendecas](https://github.com/legendecas))
* [#2563](https://github.com/open-telemetry/opentelemetry-js/pull/2563) feat(sdk-metrics-base): remove per-meter config on MeterProvider.getMeter ([@legendecas](https://github.com/legendecas))

### :bug: (Bug Fix)

* [#2610](https://github.com/open-telemetry/opentelemetry-js/pull/2610) fix: preventing double enable for instrumentation that has been already enabled ([@obecny](https://github.com/obecny))
* [#2581](https://github.com/open-telemetry/opentelemetry-js/pull/2581) feat: lazy initialization of the gzip stream ([@fungiboletus](https://github.com/fungiboletus))
* [#2584](https://github.com/open-telemetry/opentelemetry-js/pull/2584) fix: fixing compatibility versions for detectors ([@obecny](https://github.com/obecny))
* [#2558](https://github.com/open-telemetry/opentelemetry-js/pull/2558) fix(@opentelemetry/exporter-prometheus): unref prometheus server to prevent process running indefinitely ([@mothershipper](https://github.com/mothershipper))
* [#2495](https://github.com/open-telemetry/opentelemetry-js/pull/2495) fix(sdk-metrics-base): metrics name should be in the max length of 63 ([@legendecas](https://github.com/legendecas))
* [#2497](https://github.com/open-telemetry/opentelemetry-js/pull/2497) feat(@opentelemetry-instrumentation-fetch): support reading response body from the hook applyCustomAttributesOnSpan ([@echoontheway](https://github.com/echoontheway))

### :books: (Refine Doc)

* [#2561](https://github.com/open-telemetry/opentelemetry-js/pull/2561) Use new canonical path to Getting Started ([@chalin](https://github.com/chalin))
* [#2576](https://github.com/open-telemetry/opentelemetry-js/pull/2576) docs(instrumentation): update links in the Readme ([@OlivierAlbertini](https://github.com/OlivierAlbertini))
* [#2600](https://github.com/open-telemetry/opentelemetry-js/pull/2600) docs: fix URLs in README post-experimental move ([@arbourd](https://github.com/arbourd))
* [#2579](https://github.com/open-telemetry/opentelemetry-js/pull/2579) doc: Move upgrade propagator notes to correct section ([@NathanielRN](https://github.com/NathanielRN))
* [#2568](https://github.com/open-telemetry/opentelemetry-js/pull/2568) chore(doc): update matrix with contrib version for 1.0 core ([@vmarchaud](https://github.com/vmarchaud))
* [#2555](https://github.com/open-telemetry/opentelemetry-js/pull/2555) docs: expose existing comments ([@moander](https://github.com/moander))
* [#2493](https://github.com/open-telemetry/opentelemetry-js/pull/2493) chore: remove getting started and link to documentation. ([@svrnm](https://github.com/svrnm))

### :house: (Internal)

* [#2404](https://github.com/open-telemetry/opentelemetry-js/pull/2404) chore: Fix lint warnings in instrumentation package ([@alisabzevari](https://github.com/alisabzevari))
* [#2533](https://github.com/open-telemetry/opentelemetry-js/pull/2533) chore: regularly close stale issues ([@Rauno56](https://github.com/Rauno56))
* [#2570](https://github.com/open-telemetry/opentelemetry-js/pull/2570) chore: adding selenium tests with browserstack ([@obecny](https://github.com/obecny))
* [#2522](https://github.com/open-telemetry/opentelemetry-js/pull/2522) chore: cleanup setting config in instrumentations ([@Flarna](https://github.com/Flarna))
* [#2541](https://github.com/open-telemetry/opentelemetry-js/pull/2541) chore: slim font size for section title in PR template ([@legendecas](https://github.com/legendecas))
* [#2509](https://github.com/open-telemetry/opentelemetry-js/pull/2509) chore: expand pull request template with action items ([@pragmaticivan](https://github.com/pragmaticivan))
* [#2488](https://github.com/open-telemetry/opentelemetry-js/pull/2488) chore: inline sources in source maps ([@dyladan](https://github.com/dyladan))
* [#2514](https://github.com/open-telemetry/opentelemetry-js/pull/2514) chore: update stable dependencies to 1.0 ([@dyladan](https://github.com/dyladan))

## Previous releases

For changelog entries for previous releases see the [CHANGELOG.md](../CHANGELOG.md).
