# Upgrade to OpenTelemetry JS SDK 2.x

In late February 2025, the OpenTelemetry JavaScript project released the first versions of "JS SDK 2.x" packages. These packages include a number of breaking changes. This document shows the necessary code changes to upgrade to the new 2.x.

Some of the sections below include an "Implementation notes:" section the provides brief background and motivation for some changes. Feel free to skip these sections if you are not interested.

If you have any questions about the 2.x changes, please ask! You can reach the OTel JS community on the [#otel-js](https://cloud-native.slack.com/archives/C01NL1GRPQR) channel of the [CNCF Slack](https://slack.cncf.io/), or [open a Discussion issue](https://github.com/open-telemetry/opentelemetry-js/issues/new?template=discussion.md) on the repository.


## What is JS SDK 2.x?

"JS SDK 2.x" encompasses new releases of packages published from the from opentelemetry-js.git repository (except the API and semantic-conventions packages) -- categories 3 and 4 in the groupings below. The package versions for this new major will be `>=2.0.0` for the stable and `>=0.200.0` for the unstable packages. (The jump to `0.200.x` was intentional, to hopefully help signal that these packages are in the "2.x generation".)

The OpenTelemetry JS SIG is responsible for numerous packages, all published to npm under the `@opentelemetry/` org, and developed in two git repositories: [opentelemetry-js.git](https://github.com/open-telemetry/opentelemetry-js) (sometimes called the "core" repo) and [opentelemetry-js-contrib.git](https://github.com/open-telemetry/opentelemetry-js-contrib) (the "contrib" repo). For the sake of this document, these packages can be grouped into these categories:

1. The [API](../api/) (`@opentelemetry/api`). The API is versioned independently of all other packages. Its version is *not* being changed as part of "JS SDK 2.x".
2. The [Semantic Conventions](../semantic-conventions/) (`@opentelemetry/semantic-conventions`). This package follows the [versioning](https://github.com/open-telemetry/semantic-conventions/releases) of the language-independent Semantic Conventions. It is *not* being changed as part of "JS SDK 2.x".
3. [Stable packages from opentelemetry-js.git](../packages/). These are packages that have reached "1.x". These packages are all versioned together, and are at version "1.30.0" at the time of writing.
4. [Unstable packages from opentelemetry-js.git](../experimental/packages/). These are packages deemed still experimental. They are all at "0.x" versions. These packages are all versioned together, and are at version "0.57.0" at the time of writing.
5. All packages from opentelemetry-js-contrib.git. These packages are all versioned independently. These packages are not considered part of the "JS SDK 2.0" release. However, eventually they will update to use JS SDK 2.x releases.

"JS SDK 2.x" refers to categories 3 and 4.

<!--
XXX
The full set of packages is:

(TODO: List full table of "SDK 2.x" packages. The idea is to make it clear whether a given 0.x `@opentelemetry/` package applies. I'm not sure if this is useful. There *will* be upgrades to contrib packages for compat as well, so the line is blurry. Could put this in a disclosure.)
-->


## 💥 Node.js supported versions

The **minimum supported Node.js has be raised to `^18.19.0 || >=20.6.0`**. This means that support Node.js 14 and 16 has been dropped.

(The minimum supported Node.js versions for `@opentelemetry/api` (Node.js v8) and `@opentelemetry/semantic-conventions` (Node.js v14) are *not* changing as part of "JS SDK 2.x".)

> [!NOTE]
> Implementation notes:
> - The particular minimum *minor* versions of Node.js 18 and 20 were selected to include support for Node.js's `--import` flag and `module.register()` API. It is expected that this will provide a smoother experience for improved automatic ES module instrumentation.
>
> Related issues:
> [#5395](https://github.com/open-telemetry/opentelemetry-js/issues/5395)


## 💥 TypeScript supported versions

The **minimum supported TypeScript version has been raised to 5.0.4**.

As well, going forward all packages published from this repository will **drop support for old versions of `typescript` in minor releases**. We will only drop support for versions that are older than 2 years.

> [!NOTE]
> Related issues:
> [#5145](https://github.com/open-telemetry/opentelemetry-js/pull/5145)


## 💥 ES2022 compilation target

The **compilation target for transpiled TypeScript has been raised to ES2022** (from ES2017) for all packages (except `@opentelemetry/api`, `@opentelemetry/api-logs`, `@opentelemetry/api-events`, and `@opentelemetry/semantic-conventions`).

For Browser usage, this drops support for any browser versions that do not support ES2022 features.
For Node.js usage, this already follows from the new minimum supported Node.js versions mentioned above.

> [!NOTE]
> Related issues:
> [#5393](https://github.com/open-telemetry/opentelemetry-js/issues/5393)
> [#5456](https://github.com/open-telemetry/opentelemetry-js/pull/5456)


## 💥 Drop `window.OTEL_*` support in browsers

For browser users, support for `window.OTEL_*` environment variable configuration (previous handled by the `envDetector`) has been dropped.  OpenTelemetry bootstrap code for the browser should be configured via existing "Environment variable" configuration for *browsers* was always odd and confusing.

> [!NOTE]
> Related issues:
> [#5217](https://github.com/open-telemetry/opentelemetry-js/issues/5217)
> [#5445](https://github.com/open-telemetry/opentelemetry-js/pull/5445)
> [#5472](https://github.com/open-telemetry/opentelemetry-js/pull/5472)
> [#5465](https://github.com/open-telemetry/opentelemetry-js/pull/5465)
> [#5473](https://github.com/open-telemetry/opentelemetry-js/pull/5473)


## 💥 `@opentelemetry/resources` API changes

Perhaps the most likely API change you will need to update for is from the `@opentelemetry/resources` package.

The `Resource` *class* is no longer exported; instead use new utility functions.

- Creating a resource: `new Resource(...)` -> `resourceFromAttributes(...)`
- Getting the default resource: `Resource.default()` -> `defaultResource()`
- Getting an empty resource: `Resource.empty()` or `Resource.EMPTY` -> `emptyResource()`
- TypeScript interface for a resource: `IResource` -> `Resource`

```ts
// Before (pre-2.x)
import { Resource } from '@opentelemetry/resources';
new Resource({ ... });  // Create a resource
Resource.default();     // Get a resource with the default attributes
Resource.empty();       // Get an empty resource

// After (2.x)
import { resourceFromAttributes, defaultResource, emptyResource } from '@opentelemetry/resources';
resourceFromAttributes({ ... });
defaultResource();
emptyResource();
```

"Sync" and async resource detectors have been unified. Where before there were both `hostDetector` and `hostDetectorSync`, now there is only `hostDetector` which may be used in all cases.

- `envDetectorSync` -> `envDetector`
- `hostDetectorSync` -> `hostDetector`
- `osDetectorSync` -> `osDetector`
- `processDetectorSync` -> `processDetector`
- `serviceInstanceIdDetectorSync` -> `serviceInstanceIdDetector`
- `detectResourcesSync` -> `detectResources`

The `browserDetector` and `browserDetectorSync` exports were dropped. This resource detector was ago replaced by the (semantic-conventions compliant) browser detector in the separate `@opentelemetry/opentelemetry-browser-detector` package.

- `browserDetector` or `browserDetectorSync` -> `import { browserDetector } from '@opentelemetry/opentelemetry-browser-detector'`

As mentioned above, support for `window.OTEL_*` environment variable configuration in browsers has been dropped. This means that the `envDetector` in browsers is now a no-op.

- `envDetector` in a browser -> manually create a resource with the API

In TypeScript code, the `ResourceAttributes` type was replaced the `Attributes` type from the 'api' package. While unlikely, this could be a breaking change because it raised the minimum `peerDependencies` entry for `@opentelemetry/api` from `1.0.0` to `1.3.0`.

- type `ResourceAttributes` -> `import type { Attributes } from '@opentelemetry/api';`

> [!NOTE]
> Implementation notes:
> - In general, the OTel JS packages are tending away from exporting *classes* because that results in exporting types with internal details that inhibit later refactoring. See [#5283](https://github.com/open-telemetry/opentelemetry-js/issues/5283) for details.
> - The unification of sync and async resource detectors simplified the API, clarified the behavior for merging results from multiple detectors, and laid the ground work for support OpenTelemetry Entities in the future. See [#5350](https://github.com/open-telemetry/opentelemetry-js/pull/5350) for details.
>
> Related issues:
> [#5421](https://github.com/open-telemetry/opentelemetry-js/pull/5421)
> [#5350](https://github.com/open-telemetry/opentelemetry-js/pull/5350)
> [#5420](https://github.com/open-telemetry/opentelemetry-js/issues/5420)
> [#5217](https://github.com/open-telemetry/opentelemetry-js/issues/5217)
> [#5016](https://github.com/open-telemetry/opentelemetry-js/issues/5016)


## 💥 `@opentelemetry/core` API changes

The environment variable utilities have changed to not longer have one large load and parse of all possible `OTEL_*` environment variables. Instead there are `get{Type}FromEnv()` utilities to handle the various [specified OpenTelemetry SDK environment variable types](https://opentelemetry.io/docs/specs/otel/configuration/sdk-environment-variables/#configuration-types). The caller should now handle default values.

- `getEnv().OTEL_FOO` -> `get{Type}FromEnv('OTEL_FOO') ?? defaultValue`
  - `getStringFromEnv()`
  - `getNumberFromEnv()`
  - `getBooleanFromEnv()`
  - `getStringListFromEnv()`
  - `diagLogLevelFromString()` for reading `OTEL_LOG_LEVEL`
- `getEnvWithoutDefaults().OTEL_FOO` -> `get{Type}FromEnv('OTEL_FOO')`
- The following have been removed without replacement:
  - `DEFAULT_ENVIRONMENT`
  - `ENVIRONMENT`
  - `RAW_ENVIRONMENT`
  - `parseEnvironment`

For example:

```ts
// Before (pre-2.x)
import { getEnv, getEnvWithoutDefaults } from '@opentelemetry/core';
const flavor = getEnv().OTEL_EXPORTER_OTLP_PROTOCOL;
const limit = getEnv().OTEL_BSP_MAX_QUEUE_SIZE;
const level = getEnv().OTEL_LOG_LEVEL;

// After (2.x)
import { getStringFromEnv } from '@opentelemetry/core';
const flavor = getStringFromEnv('OTEL_EXPORTER_OTLP_PROTOCOL') ?? 'http/protobuf';
const limit = getNumberFromEnv('OTEL_BSP_MAX_QUEUE_SIZE') ?? 2048;
const level = diagLogLevelFromString(getStringFromEnv('OTEL_LOG_LEVEL'));
```

> [!NOTE]
> Implementation notes:
> - The `getEnv()` et al API changes avoid a problem of requiring an update to
>   `@opentelemetry/core` for any added `OTEL_*` envvars, including in unstable
>   packages and packages maintained in the separate contrib repository.
>   See [#5443](https://github.com/open-telemetry/opentelemetry-js/pull/5443).
>
> Related issues:
> [#5443](https://github.com/open-telemetry/opentelemetry-js/pull/5443)
> [#5481](https://github.com/open-telemetry/opentelemetry-js/pull/5481)
> [#5475](https://github.com/open-telemetry/opentelemetry-js/pull/5475)

---

A number of deprecated, obsolete, unused, and accidentally exported functions and variables have been removed from the `core` package. (If there is a replacement, it is mentioned with `-> ...`.)

- `IdGenerator` and `RandomIdGenerator` (deprecated)
- type `InstrumentationLibrary` (deprecated) -> type `InstrumentationScope`
- `AlwaysOnSampler` (deprecated) -> moved to `@opentelemetry/sdk-trace-base`
- `AlwaysOffSampler` (deprecated) -> moved to `@opentelemetry/sdk-trace-base`
- `TraceIdRatioSampler` (deprecated) -> moved to `@opentelemetry/sdk-trace-base`
- `TraceIdRatioSampler` (deprecated) -> moved to  `@opentelemetry/sdk-trace-base`
- `TracesSamplerValues` (was only used internally)
- `VERSION`
- `isWrapped` -> use `isWrapped` from `@opentelemetry/instrumentation`
- `ShimWrapped` -> use `ShimWrapped` from `@opentelemetry/instrumentation`
- `hexToBase64`
- `hexToBinary`
- `baggageUtils.getKeyParis` (unintentionally exported)
- `baggageUtils.serializeKeyPairs` (unintentionally exported)
- `baggageUtils.parseKeyPairsIntoRecord` -> `parseKeyPairsIntoRecord`
- `baggageUtils.parsePairKeyValue` (unintentionally exported)
- `TimeOriginLegacy`
- `isAttributeKey` (unintentionally exported)

> [!NOTE]
> Related issues:
> [#5309](https://github.com/open-telemetry/opentelemetry-js/pull/5309)
> [#5308](https://github.com/open-telemetry/opentelemetry-js/pull/5308)
> [#5316](https://github.com/open-telemetry/opentelemetry-js/pull/5316)
> [#5406](https://github.com/open-telemetry/opentelemetry-js/pull/5406)
> [#5444](https://github.com/open-telemetry/opentelemetry-js/pull/5444)


## 💥 Tracing SDK API changes

XXX

## 💥 `@opentelemetry/sdk-metrics` API changes

XXX TODO

* feat(sdk-metrics)!: drop deprecated `type` field on `MetricDescriptor` [#5291](https://github.com/open-telemetry/opentelemetry-js/pull/5291) @chancancode
* feat(sdk-metrics)!: drop deprecated `InstrumentDescriptor` type; use `MetricDescriptor` instead [#5277](https://github.com/open-telemetry/opentelemetry-js/pull/5266) @chancancode
* feat(sdk-metrics)!: bump minimum version of `@opentelemetry/api` peer dependency to 1.9.0 [#5254](https://github.com/open-telemetry/opentelemetry-js/pull/5254) @chancancode
* feat(sdk-metrics)!: remove MeterProvider.addMetricReader() in favor of constructor option [#4419](https://github.com/open-telemetry/opentelemetry-js/pull/4419) @pichlermarc
* feat(sdk-metrics)!: remove MeterProvider.addMetricReader() in favor of constructor option [#4419](https://github.com/open-telemetry/opentelemetry-js/pull/4419) @pichlermarc
* feat(sdk-metrics)!: replace attributeKeys with custom processors option [#4532](https://github.com/open-telemetry/opentelemetry-js/pull/4532) @pichlermarc
* feat(sdk-metrics)!: drop `View` and `Aggregation` in favor of `ViewOptions` and `AggregationOption` [#4931](https://github.com/open-telemetry/opentelemetry-js/pull/4931) @pichlermarc
    XXX see marc's https://github.com/open-telemetry/opentelemetry-js/pull/5485/files that updates some docs for this usage in oj.
* feat(sdk-metrics)!: extract `IMetricReader` interface and use it over abstract class [#5311](https://github.com/open-telemetry/opentelemetry-js/pull/5311)
  * (user-facing): `MeterProviderOptions` now provides the more general `IMetricReader` type over `MetricReader`
  * If you accept `MetricReader` in your public interface, consider accepting the more general `IMetricReader` instead to avoid unintentional breaking changes

XXX deprecated SpanAttributes removal, requires new min api v1.1.0

* chore(shim-opentracing): replace deprecated SpanAttributes [#4430](https://github.com/open-telemetry/opentelemetry-js/pull/4430) @JamieDanielson
* chore(otel-core): replace deprecated SpanAttributes [#4408](https://github.com/open-telemetry/opentelemetry-js/pull/4408) @JamieDanielson
* chore(otel-resources): replace deprecated SpanAttributes [#4428](https://github.com/open-telemetry/opentelemetry-js/pull/4428) @JamieDanielson
* refactor(sdk-trace-base)!: replace `SpanAttributes` with `Attributes` [#5009](https://github.com/open-telemetry/opentelemetry-js/pull/5009) @david-luna

XXX  ResourceAttributes -> Attributes, requires new min api v1.3.0

* refactor(resources)!: replace `ResourceAttributes` with `Attributes` [#5016](https://github.com/open-telemetry/opentelemetry-js/pull/5016) @david-luna



XXX tracing APIs

* refactor(sdk-trace-base)!: remove `new Span` constructor in favor of `Tracer.startSpan` API [#5048](https://github.com/open-telemetry/opentelemetry-js/pull/5048) @david-luna
* refactor(sdk-trace-base)!: remove `BasicTracerProvider.addSpanProcessor` API in favor of constructor options. [#5134](https://github.com/open-telemetry/opentelemetry-js/pull/5134) @david-luna
* refactor(sdk-trace-base)!: make `resource` property private in `BasicTracerProvider` and remove `getActiveSpanProcessor` API. [#5192](https://github.com/open-telemetry/opentelemetry-js/pull/5192) @david-luna
* feat(sdk-trace)!: remove ability to have BasicTracerProvider instantiate exporters [#5239](https://github.com/open-telemetry/opentelemetry-js/pull/5239) @pichlermarc
  * When extending `BasicTracerProvider`, the class offered multiple methods to facilitate the creation of exporters and auto-pairing with `SpanProcessor`s.
    * This functionality has been removed - users may now pass `SpanProcessor`s to the base class constructor when extending
    * (user-facing): `_registeredExporters` has been removed
    * (user-facing): `_getSpanExporter` has been removed
    * (user-facing): `_buildExporterFromEnv` has been removed
* feat(sdk-trace-base)!: replace usages fo `InstrumentationLibrary` with `InstrumentationScope` [#5308](https://github.com/open-telemetry/opentelemetry-js/pull/5308) @pichlermarc
  * (user-facing) rename `Tracer.instrumentationLibrary` -> `Tracer.instrumentationScope`
  * (user-facing) rename `ReadableSpan.instrumentationLibrary` -> `ReadableSpan.instrumentationScope`
    * also renames the property in implementations of `ReadableSpan`
* feat(sdk-trace-base)!: drop ability to instantiate propagators beyond defaults [#5355](https://github.com/open-telemetry/opentelemetry-js/pull/5355) @pichlermarc
  * (user-facing): only a non-env-var based default is now used on `BasicTracerProvider#register()`.
    * propagators can now not be configured via `OTEL_PROPAGATORS` or `window.OTEL_PROPAGATORS` anymore, please pass the propagator to `NodeTracerProvider#register()` instead.
    * if not configured directly via code, `BasicTracerProvider#register()` will now fall back to defaults (`tracecontext` and `baggage`)
* feat(sdk-trace-node)!: drop ability to instantiate propagators beyond defaults [#5355](https://github.com/open-telemetry/opentelemetry-js/pull/5355) @pichlermarc
  * (user-facing): only a non-env-var based default is now used on `NodeTracerProvider#register()`.
    * propagators can now not be configured via `OTEL_PROPAGATORS` anymore, please pass the propagator to `NodeTracerProvider#register()` instead.
    * if not configured via code, `NodeTracerProvider#register()` will now fall back to the defaults (`tracecontext` and `baggage`)
    * if autoconfiguration based on enviornment variables is needed, please use `NodeSDK` from `@opentelemetry/sdk-node`.
* feat(sdk-trace-web)!: drop ability to instantiate propagators beyond defaults [#5355](https://github.com/open-telemetry/opentelemetry-js/pull/5355) @pichlermarc
  * (user-facing): only a non-env-var based default is now used on `WebTracerProvider#register()`.
    * propagators can now not be configured via `window.OTEL_PROPAGATORS` anymore, please pass the propagator to `WebTracerProvider#register()` instead.
    * if not configured via code, `WebTracerProvider#register()` will now fall back to defaults (`tracecontext` and `baggage`)
* feat(sdk-trace)!: drop unnecessary exports [#5405](https://github.com/open-telemetry/opentelemetry-js/pull/5405) @pichlermarc
  * (user-facing): `EXPORTER_FACTORY` is not used anymore and has been removed
  * (user-facing): `PROPAGATOR_FACTORY` is not used anymore and has been removed
  * (user-facing): `ForceFlushState` was intended for internal use and has been removed
  * (user-facing): the `Tracer` class was unintentionally exported and has been removed
    * to obtain a `Tracer`, please use `BasicTracerProvider#getTracer()`, `NodeTracerProvider#getTracer()` or `WebTracerProvider#getTracer()`
    * to reference a `Tracer`, please use the `Tracer` type from `@opentelemetry/api`


+* feat(sdk-trace-base)!: Add `parentSpanContext` and remove `parentSpanId` from `Span` and `ReadableSpan` [#5450](https://github.com/open-telemetry/opentelemetry-js/pull/5450) @JacksonWeber
+  * (user-facing): the SDK's `Span`s `parentSpanId` was replaced by `parentSpanContext`, to migrate to the new property, please replace `span.parentSpanId` -> `span.parentSpanContext?.spanId`




XXX

* feat(exporter-jaeger): use `ReadableSpan.instrumentationScope` over `ReadableSpan.instrumentationLibrary` [#5308](https://github.com/open-telemetry/opentelemetry-js/pull/5308) @pichlermarc
* feat(exporter-zipkin): use `ReadableSpan.instrumentationScope` over `ReadableSpan.instrumentationLibrary` [#5308](https://github.com/open-telemetry/opentelemetry-js/pull/5308) @pichlermarc



## XXX the unstable breaking changes

XXX can merge these in with above. E.g. grouping the metrics changes.

* feat(exporter-prometheus)!: stop the using `type` field to enforce naming conventions [#5291](https://github.com/open-telemetry/opentelemetry-js/pull/5291) @chancancode
  * Any non-monotonic sums will now be treated as counters and will therefore include the `_total` suffix.
* feat(shim-opencenus)!: stop mapping removed Instrument `type` to OpenTelemetry metrics [#5291](https://github.com/open-telemetry/opentelemetry-js/pull/5291) @chancancode
  * The internal OpenTelemetry data model dropped the concept of instrument type on exported metrics, therefore mapping it is not necessary anymore.
* feat(instrumentation-fetch)!: passthrough original response to `applyCustomAttributes` hook [#5281](https://github.com/open-telemetry/opentelemetry-js/pull/5281) @chancancode
  * Previously, the fetch instrumentation code unconditionally clones every `fetch()` response in order to preserve the ability for the `applyCustomAttributes` hook to consume the response body. This is fundamentally unsound, as it forces the browser to buffer and retain the response body until it is fully received and read, which crates unnecessary memory pressure on large or long-running response streams. In extreme cases, this is effectively a memory leak and can cause the browser tab to crash. If your use case for `applyCustomAttributes` requires access to the response body, please chime in on [#5293](https://github.com/open-telemetry/opentelemetry-js/issues/5293).

* feat(sdk-node)!: use `IMetricReader` over `MetricReader` [#5311](https://github.com/open-telemetry/opentelemetry-js/pull/5311)
  * (user-facing): `NodeSDKConfiguration` now provides the more general `IMetricReader` type over `MetricReader`




## Links

- XXX the 2 changelogs
- XXX git link to a full diff, if helpful
- XXX updated opentelemetry.io getting started guide


# scratch


- XXX The easy path if just using `@opentelemetry/auto-instrumentations-node/register`. Is this totally unchanged?
- XXX mention that it will take some time for contrib repo packages to migrate
- XXX `rg`-using tool to list if one needs to look at updating
- XXX eventually get to all the examples/. They will be like bad docs.

> [!NOTE]
> Related issues:
> [#XXX](https://github.com/open-telemetry/opentelemetry-js/issues/XXX)
> [#XXX](https://github.com/open-telemetry/opentelemetry-js/pull/XXX)

## XXX outline

- Am I ready for JS SDK 2.x?  Dropped Node 14 and 16 support. >=18.19.0.
- The highlights: min node, min TypeScript, moving away from exported *classes* because ...,
- "Why SDK 2.0?"  I.e. why should a user upgrade, other than this is what will be maintained. We don't *have* to answer this. That is more about "What's New" than covering breaking changes here.
- Statement on maint of 1.x: how long?

## XXX new changelog entries to merge

```
git ls-files | rg CHANGELOG | while read f; do echo; echo "# $f"; diff -u $f ~/src/opentelemetry-js/$f ; done
```




