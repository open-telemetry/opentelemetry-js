# Upgrade to OpenTelemetry JS SDK 2.x

In late February 2025, the OpenTelemetry JavaScript project released the first versions of "JS SDK 2.x" packages, which include a number of *breaking changes*. This document shows how to migrate to the new 2.x. For the most part, this document *only covers breaking changes*. Refer to the full changelogs for these releases here:

- [CHANGELOG for stable SDK packages](https://github.com/open-telemetry/opentelemetry-js/blob/main/CHANGELOG.md)
- [CHANGELOG for experimental SDK packages](https://github.com/open-telemetry/opentelemetry-js/blob/main/experimental/CHANGELOG.md)

<!-- TODO: update these changelog links to the 2.0.0 and 0.200.0 anchors when we have a final release. -->

Per [OpenTelemetry guidelines](https://opentelemetry.io/docs/specs/otel/versioning-and-stability/#sdk-support), the 1.x versions of stable SDK packages will be supported for one year from the 2.0.0 release.

If you have any questions about the 2.x changes, please ask! You can reach the OTel JS community on the [#otel-js](https://cloud-native.slack.com/archives/C01NL1GRPQR) channel of the [CNCF Slack](https://cloud-native.slack.com), [open a Discussion issue](https://github.com/open-telemetry/opentelemetry-js/issues/new?template=discussion.md) on the repository, or join the weekly [OTel JS SIG zoom call](https://docs.google.com/document/d/1tCyoQK49WVcE-x8oryZOTTToFm7sIeUhxFPm9g-qL1k/edit).

## What is JS SDK 2.x?

"JS SDK 2.x" encompasses new releases of the `@opentelemetry/*` JavaScript packages published from the [opentelemetry-js.git](https://github.com/open-telemetry/opentelemetry-js) repository, except the API and semantic-conventions packages &mdash; categories 3 and 4 in the groupings below. The package versions for this new major will be `>=2.0.0` for the stable and `>=0.200.0` for the unstable packages. (The jump to `0.200.x` was intentional, to hopefully help signal that these packages are in the "2.x generation".)

If your usage of OpenTelemetry does not *directly* use these packages, then you most likely will not need to change your code to migrate. You still need to be aware of the new minimum versions of Node.js, TypeScript, and ES that are supported.

<details>
<summary>Categories of OpenTelemetry JS packages</summary>

The OpenTelemetry JS SIG is responsible for numerous packages, all published to npm under the `@opentelemetry/` org, and developed in two git repositories: [opentelemetry-js.git](https://github.com/open-telemetry/opentelemetry-js) (sometimes called the "core" repo) and [opentelemetry-js-contrib.git](https://github.com/open-telemetry/opentelemetry-js-contrib) (the "contrib" repo). For the sake of this document, these packages can be grouped into these categories:

1. The [API](../api/) (`@opentelemetry/api`). The API is versioned independently of all other packages. Its version is *not* being changed as part of "JS SDK 2.x".
2. The [Semantic Conventions](../semantic-conventions/) (`@opentelemetry/semantic-conventions`). This package follows the [versioning](https://github.com/open-telemetry/semantic-conventions/releases) of the language-independent Semantic Conventions. It is *not* being changed as part of "JS SDK 2.x".
3. [Stable packages from opentelemetry-js.git](../packages/). These are packages that have reached "1.x". These packages are all versioned together, and are at version "1.30.0" at the time of writing.
4. [Unstable packages from opentelemetry-js.git](../experimental/packages/). These are packages deemed still experimental. They are all at "0.x" versions. These packages are all versioned together, and are at version "0.57.0" at the time of writing.
5. All packages from opentelemetry-js-contrib.git. These packages are all versioned independently. These packages are not considered part of the "JS SDK 2.0" release. However, eventually they will update to use JS SDK 2.x releases.

"JS SDK 2.x" refers to categories 3 and 4.

</details>

<details>
<summary>The full set of "JS SDK 2.x" packages</summary>

| Package | Version |
| ------- | ------- |
| @opentelemetry/context-async-hooks | 2.0.0 |
| @opentelemetry/context-zone | 2.0.0 |
| @opentelemetry/context-zone-peer-dep | 2.0.0 |
| @opentelemetry/core | 2.0.0 |
| @opentelemetry/exporter-jaeger | 2.0.0 |
| @opentelemetry/exporter-zipkin | 2.0.0 |
| @opentelemetry/propagator-b3 | 2.0.0 |
| @opentelemetry/propagator-jaeger | 2.0.0 |
| @opentelemetry/resources | 2.0.0 |
| @opentelemetry/sdk-metrics | 2.0.0 |
| @opentelemetry/sdk-trace-base | 2.0.0 |
| @opentelemetry/sdk-trace-node | 2.0.0 |
| @opentelemetry/sdk-trace-web | 2.0.0 |
| @opentelemetry/shim-opentracing | 2.0.0 |
| @opentelemetry/api-events | 0.200.0 |
| @opentelemetry/api-logs | 0.200.0 |
| @opentelemetry/exporter-logs-otlp-grpc | 0.200.0 |
| @opentelemetry/exporter-logs-otlp-http | 0.200.0 |
| @opentelemetry/exporter-logs-otlp-proto | 0.200.0 |
| @opentelemetry/exporter-metrics-otlp-grpc | 0.200.0 |
| @opentelemetry/exporter-metrics-otlp-http | 0.200.0 |
| @opentelemetry/exporter-metrics-otlp-proto | 0.200.0 |
| @opentelemetry/exporter-prometheus | 0.200.0 |
| @opentelemetry/exporter-trace-otlp-grpc | 0.200.0 |
| @opentelemetry/exporter-trace-otlp-http | 0.200.0 |
| @opentelemetry/exporter-trace-otlp-proto | 0.200.0 |
| @opentelemetry/instrumentation | 0.200.0 |
| @opentelemetry/instrumentation-fetch | 0.200.0 |
| @opentelemetry/instrumentation-grpc | 0.200.0 |
| @opentelemetry/instrumentation-http | 0.200.0 |
| @opentelemetry/instrumentation-xml-http-request | 0.200.0 |
| @opentelemetry/opentelemetry-browser-detector | 0.200.0 |
| @opentelemetry/otlp-exporter-base | 0.200.0 |
| @opentelemetry/otlp-grpc-exporter-base | 0.200.0 |
| @opentelemetry/otlp-transformer | 0.200.0 |
| @opentelemetry/sampler-jaeger-remote | 0.200.0 |
| @opentelemetry/sdk-events | 0.200.0 |
| @opentelemetry/sdk-logs | 0.200.0 |
| @opentelemetry/sdk-node | 0.200.0 |
| @opentelemetry/shim-opencensus | 0.200.0 |
| @opentelemetry/web-common | 0.200.0 |

</details>

## 💥 Node.js supported versions

The **minimum supported Node.js has been raised to `^18.19.0 || >=20.6.0`**. This means that support for Node.js 14 and 16 has been dropped.

> [!NOTE]
>
> - The minimum supported Node.js versions for `@opentelemetry/api` (Node.js v8) and `@opentelemetry/semantic-conventions` (Node.js v14) are *not* changing as part of "JS SDK 2.x".
> - The particular minimum *minor* versions of Node.js 18 and 20 were selected to include support for Node.js's `--import` flag and `module.register()` API. It is expected that this will provide a smoother experience for improved automatic ES module instrumentation.
>
> Related issues and PRs:
> [#5395](https://github.com/open-telemetry/opentelemetry-js/issues/5395)

## 💥 TypeScript supported versions

The **minimum supported TypeScript version has been raised to 5.0.4**.

As well, going forward all packages published from this repository will **drop support for old versions of `typescript` in minor releases**. We will only drop support for versions that are older than 2 years.

Important: Both of these changes (typescript@5.0.4, dropping old TypeScript versions in minor releases) **also apply to the `@opentelemetry/api` and `@opentelemetry/semantic-conventions` packages**, even though those two packages aren't otherwise considered part of the "JS SDK 2.x" update.

> [!NOTE]
> Related issues and PRs:
> [#5145](https://github.com/open-telemetry/opentelemetry-js/pull/5145)

## 💥 ES2022 compilation target

The **compilation target for transpiled TypeScript has been raised to ES2022** (from ES2017) for all packages (except `@opentelemetry/api`, `@opentelemetry/api-logs`, `@opentelemetry/api-events`, and `@opentelemetry/semantic-conventions`).

For Browser usage, this drops support for any browser versions that do not support ES2022 features.
For Node.js usage, this already follows from the new minimum supported Node.js versions mentioned above.

> [!NOTE]
> Related issues and PRs:
> [#5393](https://github.com/open-telemetry/opentelemetry-js/issues/5393)
> [#5456](https://github.com/open-telemetry/opentelemetry-js/pull/5456)

## 💥 Drop `window.OTEL_*` support in browsers

For browser users, support for `window.OTEL_*` environment variable configuration (previous handled by the `envDetector`) has been dropped.  OpenTelemetry bootstrap code for the browser should be configured via code.

> [!NOTE]
> Related issues and PRs:
> [#5217](https://github.com/open-telemetry/opentelemetry-js/issues/5217)
> [#5455](https://github.com/open-telemetry/opentelemetry-js/pull/5455)
> [#5472](https://github.com/open-telemetry/opentelemetry-js/pull/5472)
> [#5465](https://github.com/open-telemetry/opentelemetry-js/pull/5465)
> [#5473](https://github.com/open-telemetry/opentelemetry-js/pull/5473)

## 💥 `@opentelemetry/resources` API changes

Perhaps the most likely API change you will need to update for is from the `@opentelemetry/resources` package.

<br/>

The `Resource` *class* is no longer exported; instead use new utility functions.

- Creating a resource: `new Resource(...)` -> `resourceFromAttributes(...)`
- Getting the default resource: `Resource.default()` -> `defaultResource()`
- Getting an empty resource: `Resource.empty()` or `Resource.EMPTY` -> `emptyResource()`
- TypeScript interface for a resource: `IResource` -> `Resource`

```ts
// Before
import { Resource } from '@opentelemetry/resources';
new Resource({ ... });  // Create a resource
Resource.default();     // Get a resource with the default attributes
Resource.empty();       // Get an empty resource

// After
import { resourceFromAttributes, defaultResource, emptyResource } from '@opentelemetry/resources';
resourceFromAttributes({ ... });
defaultResource();
emptyResource();
```

<br/>

"Sync" and async resource detectors have been unified. For example, where before there were both `hostDetector` and `hostDetectorSync`, now there is only `hostDetector` which may be used in all cases.

- `envDetectorSync` -> `envDetector`
- `hostDetectorSync` -> `hostDetector`
- `osDetectorSync` -> `osDetector`
- `processDetectorSync` -> `processDetector`
- `serviceInstanceIdDetectorSync` -> `serviceInstanceIdDetector`
- `detectResourcesSync` -> `detectResources`

<br/>

The `browserDetector` and `browserDetectorSync` exports were dropped. This resource detector was long ago replaced by the (semantic-conventions-compliant) browser detector in the separate `@opentelemetry/opentelemetry-browser-detector` package.

- `browserDetector` or `browserDetectorSync` -> `import { browserDetector } from '@opentelemetry/opentelemetry-browser-detector'`

<br/>

As mentioned above, support for `window.OTEL_*` environment variable configuration in browsers has been dropped. This means that the `envDetector` in browsers is now a no-op.

- `envDetector` in a browser -> manually create a resource with the API

<br/>

In TypeScript code, the `ResourceAttributes` type was replaced with the `Attributes` type from the 'api' package. Though unlikely, it is possible this could be a breaking change because it raised the minimum `peerDependencies` entry for `@opentelemetry/api` from `1.0.0` to `1.3.0`.

- type `ResourceAttributes` -> `import type { Attributes } from '@opentelemetry/api';`

<br/>

If you maintain an *implementation* of a resource detector, i.e. if you have a class that `implements DetectorSync` (or the deprecated `Detector`) interface from `@opentelemetry/resources`, then please see the [section below for implementors of resource detectors](#-opentelemetryresources-changes-for-implementors-of-resource-detectors).

- `class ... implements DetectorSync` -> see section below for implementation changes

> [!NOTE]
>
> - In general, the OTel JS packages are trending away from exporting *classes* because that results in exporting types with internal details that inhibit later refactoring. See [#5283](https://github.com/open-telemetry/opentelemetry-js/issues/5283) for details.
> - The unification of sync and async resource detectors simplified the API, clarified the behavior for merging results from multiple detectors, and laid the groundwork for supporting OpenTelemetry *Entities* in the future. See [#5350](https://github.com/open-telemetry/opentelemetry-js/pull/5350) for details.
>
> Related issues and PRs:
> [#5421](https://github.com/open-telemetry/opentelemetry-js/pull/5421)
> [#5467](https://github.com/open-telemetry/opentelemetry-js/pull/5467)
> [#5350](https://github.com/open-telemetry/opentelemetry-js/pull/5350)
> [#5420](https://github.com/open-telemetry/opentelemetry-js/issues/5420)
> [#5217](https://github.com/open-telemetry/opentelemetry-js/issues/5217)
> [#5016](https://github.com/open-telemetry/opentelemetry-js/issues/5016)

## 💥 `@opentelemetry/core` API changes

The environment variable utilities have changed to no longer have one large load and parse of all possible `OTEL_*` environment variables. Instead there are `get{Type}FromEnv()` utilities to handle the various [specified OpenTelemetry SDK environment variable types](https://opentelemetry.io/docs/specs/otel/configuration/sdk-environment-variables/#configuration-types).

The caller should now handle default values. The authority for default values is the [OpenTelemetry Environment Variable Spec](https://opentelemetry.io/docs/specs/otel/configuration/sdk-environment-variables/#general-sdk-configuration). See [the previously used defaults in the 1.x code here](https://github.com/open-telemetry/opentelemetry-js/blob/e9d3c71918635d490b6a9ac9f8259265b38394d0/packages/opentelemetry-core/src/utils/environment.ts#L154-L239).

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
// Before
import { getEnv, getEnvWithoutDefaults } from '@opentelemetry/core';
const flavor = getEnv().OTEL_EXPORTER_OTLP_PROTOCOL;
const limit = getEnv().OTEL_BSP_MAX_QUEUE_SIZE;
const level = getEnv().OTEL_LOG_LEVEL;

// After
import { getStringFromEnv, getNumberFromEnv, diagLogLevelFromString } from '@opentelemetry/core';
const flavor = getStringFromEnv('OTEL_EXPORTER_OTLP_PROTOCOL') ?? 'http/protobuf';
const limit = getNumberFromEnv('OTEL_BSP_MAX_QUEUE_SIZE') ?? 2048;
const level = diagLogLevelFromString(getStringFromEnv('OTEL_LOG_LEVEL'));
```

<br/>

A number of deprecated, obsolete, unused, and accidentally exported functions and variables have been removed from the `core` package. (If there is a replacement, it is mentioned with `-> ...`.)

- `IdGenerator` and `RandomIdGenerator` (deprecated)
- type `InstrumentationLibrary` (deprecated) -> type `InstrumentationScope`
- `AlwaysOnSampler` (deprecated) -> moved to `@opentelemetry/sdk-trace-base`
- `AlwaysOffSampler` (deprecated) -> moved to `@opentelemetry/sdk-trace-base`
- `ParentBasedSampler` (deprecated) -> moved to `@opentelemetry/sdk-trace-base`
- `TraceIdRatioSampler` (deprecated) -> moved to  `@opentelemetry/sdk-trace-base`
- `TracesSamplerValues` (was only used internally)
- `VERSION`
- `isWrapped` -> use `isWrapped` from `@opentelemetry/instrumentation`
- `ShimWrapped` -> use `ShimWrapped` from `@opentelemetry/instrumentation`
- `hexToBase64`
- `hexToBinary`
- `baggageUtils.getKeyPairs` (unintentionally exported)
- `baggageUtils.serializeKeyPairs` (unintentionally exported)
- `baggageUtils.parseKeyPairsIntoRecord` -> `parseKeyPairsIntoRecord`
- `baggageUtils.parsePairKeyValue` (unintentionally exported)
- `TimeOriginLegacy`
- `isAttributeKey` (unintentionally exported)
- `DEFAULT_ATTRIBUTE_VALUE_LENGTH_LIMIT` -> use `Infinity`
- `DEFAULT_ATTRIBUTE_VALUE_COUNT_LIMIT` -> use `128`
- `DEFAULT_SPAN_ATTRIBUTE_PER_EVENT_COUNT_LIMIT` -> use `128`
- `DEFAULT_SPAN_ATTRIBUTE_PER_LINK_COUNT_LIMIT` -> use `128`

<br/>

> [!NOTE]
>
> - The `getEnv()` et al API changes avoid a problem of requiring an update to
>   `@opentelemetry/core` for any added `OTEL_*` envvars, including in unstable
>   packages and packages maintained in the separate contrib repository.
>   See [#5443](https://github.com/open-telemetry/opentelemetry-js/pull/5443).
>
> Related issues and PRs:
> [#5443](https://github.com/open-telemetry/opentelemetry-js/pull/5443)
> [#5481](https://github.com/open-telemetry/opentelemetry-js/pull/5481)
> [#5475](https://github.com/open-telemetry/opentelemetry-js/pull/5475)
> [#5309](https://github.com/open-telemetry/opentelemetry-js/pull/5309)
> [#5308](https://github.com/open-telemetry/opentelemetry-js/pull/5308)
> [#5316](https://github.com/open-telemetry/opentelemetry-js/pull/5316)
> [#5406](https://github.com/open-telemetry/opentelemetry-js/pull/5406)
> [#5444](https://github.com/open-telemetry/opentelemetry-js/pull/5444)
> [#5504](https://github.com/open-telemetry/opentelemetry-js/pull/5504)

## 💥 Tracing SDK API changes

This section describes API changes in the set of packages that implement the tracing SDK: `@opentelemetry/sdk-trace-base`, `@opentelemetry/sdk-trace-node`, `@opentelemetry/sdk-trace-web`.

Tracing was the first signal to have an SDK. Over time, and as the Metrics and Logs SDKs were added, the API design separating functionality between the `{Tracer,Meter,Logs}Provider`s APIs and the higher level `NodeSDK` (in `@opentelemetry/sdk-node`) improved. The Tracing SDK was left with some cruft that is being removed in JS SDK 2.0. (See [#5290](https://github.com/open-telemetry/opentelemetry-js/issues/5290) for motivation.)

- removed `BasicTracerProvider#addSpanProcessor(...)` -> use constructor options to the TracerProvider class
- made `BasicTracerProvider#getActiveSpanProcessor()` private
- made `BasicTracerProvider#resource` private
- `BasicTracerProvider` and `NodeTracerProvider` will no longer use the `OTEL_TRACES_EXPORTER` envvar to create exporters -> This functionality already resides in `NodeSDK` (from `@opentelemetry/sdk-node`).
- `BasicTracerProvider` and `NodeTracerProvider` will no longer use the `OTEL_PROPAGATORS` envvar to create propagators -> This functionality already resides in `NodeSDK` (from `@opentelemetry/sdk-node`).
- The following internal properties were removed from `BasicTracerProvider`: `_registeredExporters`, `_getSpanExporter`, `_buildExporterFromEnv`
- The following exports were dropped from `@opentelemetry/sdk-trace-*`:
  - `EXPORTER_FACTORY` is not used anymore and has been removed
  - `PROPAGATOR_FACTORY` is not used anymore and has been removed
  - `ForceFlushState` was intended for internal use and has been removed
  - the `Tracer` class was unintentionally exported and has been removed
    - to obtain a `Tracer`, please use `BasicTracerProvider#getTracer()`, `NodeTracerProvider#getTracer()` or `WebTracerProvider#getTracer()`
    - to reference the `Tracer` type, please use the `Tracer` type from `@opentelemetry/api`
- removed `BasicTracerProvider#register()` -> use `NodeTracerProvider#register()` or `WebTracerProvider#register()`, or call `trace.setGlobalTracerProvider()` et al manually (see [#5503](https://github.com/open-telemetry/opentelemetry-js/pull/5503))

<br/>

The export of the `Span` class has been removed. It was not intended to be used directly. One should always use methods on a `Tracer` instance (e.g. `startSpan()`) for creating spans.

- `new Span(...)` -> use `tracer.startSpan(...)`

<br/>

The `parentSpanId` field on the `Span` and `ReadableSpan` interfaces was replaced by `parentSpanContext`, to adhere to the OTel spec. [#5450](https://github.com/open-telemetry/opentelemetry-js/pull/5450)

- `span.parentSpanId` -> `span.parentSpanContext?.spanId`

<br/>

As mentioned above in the "core" section, `InstrumentationLibrary` has been changed to `InstrumentationScope`:

- `ReadableSpan.instrumentationLibrary` -> `ReadableSpan.instrumentationScope`

<br/>

When invalid data is set on `OTEL_TRACES_SAMPLER`, the SDK now uses `ParentBasedAlwaysOnSampler` rather than `AlwaysOnSampler`, per [spec](https://opentelemetry.io/docs/specs/otel/configuration/sdk-environment-variables/#general-sdk-configuration).

> [!NOTE]
> Related issues and PRs:
> [#5290](https://github.com/open-telemetry/opentelemetry-js/issues/5290)
> [#5134](https://github.com/open-telemetry/opentelemetry-js/pull/5134)
> [#5192](https://github.com/open-telemetry/opentelemetry-js/pull/5192)
> [#5239](https://github.com/open-telemetry/opentelemetry-js/pull/5239)
> [#5355](https://github.com/open-telemetry/opentelemetry-js/pull/5355)
> [#5405](https://github.com/open-telemetry/opentelemetry-js/pull/5405)
> [#5048](https://github.com/open-telemetry/opentelemetry-js/pull/5048)
> [#5450](https://github.com/open-telemetry/opentelemetry-js/pull/5450)
> [#5308](https://github.com/open-telemetry/opentelemetry-js/pull/5308)
> [#5503](https://github.com/open-telemetry/opentelemetry-js/pull/5503)

## 💥 `@opentelemetry/sdk-metrics` API changes

The Metrics SDK now internally uses the `Gauge` and `MetricAdvice` types from the API package, which requires bumping its peer dependency.

- bumped minimum version of `@opentelemetry/api` peer dependency to 1.9.0

<br/>

The `View` *class* has been removed in favor of passing an object of `type ViewOptions` to a MeterProvider. As well, the `*Aggregation` classes have been removed in favor of `type AggregationOption` and the `AggregationType` enum. (See [#4931](https://github.com/open-telemetry/opentelemetry-js/pull/4931) for motivation.)

- removed class `View` -> pass a `type ViewOptions` object to a MeterProvider
- removed `Aggregation` -> pass a `type ViewOptions` object to a MeterProvider
  - removed `DefaultAggregation` -> pass a ViewOptions object with `type: AggregationType.DEFAULT`
  - removed `DropAggregation` -> pass a ViewOptions object with `type: AggregationType.DROP`
  - removed `ExponentialHistogramAggregation` -> pass a ViewOptions object with `type: AggregationType.EXPONENTIAL_HISTOGRAM`
  - removed `ExplicitBucketHistogramAggregation` -> pass a ViewOptions object with `type: AggregationType.EXPLICIT_BUCKET_HISTOGRAM`
  - removed `HistogramAggregation` -> pass a ViewOptions object with `type: AggregationType.EXPLICIT_BUCKET_HISTOGRAM`
  - removed `LastValueAggregation` -> pass a ViewOptions object with `type: AggregationType.LAST_VALUE`
  - removed `SumAggregation` -> pass a ViewOptions object with `type: AggregationType.SUM`

For example:

```js
// Before
import {
  MeterProvider,
  View,
  InstrumentType,
  ExplicitBucketHistogramAggregation
} from '@opentelemetry/sdk-metrics';
const provider = new MeterProvider({
  views: [
    new View({
      instrumentName: 'http.server.duration',
      instrumentType: InstrumentType.HISTOGRAM,
      aggregation: new ExplicitBucketHistogramAggregation([0, 1, 5, 10, 15, 20, 25, 30]),
    })
  ]
});

// After
import {MeterProvider, InstrumentType, AggregationType} from '@opentelemetry/sdk-metrics';
const provider = new MeterProvider({
  views: [
    { // type ViewOptions
      instrumentName: 'http.server.duration',
      instrumentType: InstrumentType.HISTOGRAM,
      aggregation: { // type AggregationOption
        type: AggregationType.EXPLICIT_BUCKET_HISTOGRAM,
        options: {
          boundaries: [0, 1, 5, 10, 15, 20, 25, 30],
        }
      }
    }
  ]
});
```

<br/>

The `attributeKeys` View option has been replaced with more capable filtering. (See [#4532](https://github.com/open-telemetry/opentelemetry-js/pull/4532).)

- `attributeKeys` `View` option -> use the `attributesProcessors` ViewOptions property, and `createAllowListAttributesProcessor()` or `createDenyListAttributesProcessor()`

For example:

```js
// Before
import {MeterProvider, View} from '@opentelemetry/sdk-metrics';
const provider = new MeterProvider({
  views: [
    new View({
      attributeKeys: ['attrib1'],
    })
  ]
});

// After
import {MeterProvider, createAllowListAttributesProcessor} from '@opentelemetry/sdk-metrics';
const provider = new MeterProvider({
  views: [
    {
      attributesProcessors: [
        createAllowListAttributesProcessor(['attrib1']),
      ],
    }
  ]
});
```

<br/>

Some deprecated things have been removed:

- drop deprecated `type` field on interface `MetricDescriptor`
- drop deprecated `InstrumentDescriptor` type -> use `MetricDescriptor` instead

<br/>

The following changes were made to MetricReader-related APIs:

- removed `MeterProvider.addMetricReader()` -> use the `readers` constructor option
- new `IMetricReader` interface -> This is preferred to the `MetricReader` abstract class. The `MeterProviderOptions` `readers` constructor option now uses this slightly narrower type.
  - If you accept `MetricReader` in your public interface, prefer accepting the more general `IMetricReader` type instead to avoid unintentional breaking changes.

<br/>

> [!NOTE]
> Related issues and PRs:
> [#5254](https://github.com/open-telemetry/opentelemetry-js/pull/5254)
> [#4931](https://github.com/open-telemetry/opentelemetry-js/pull/4931)
> [#4532](https://github.com/open-telemetry/opentelemetry-js/pull/4532)
> [#5291](https://github.com/open-telemetry/opentelemetry-js/pull/5291)
> [#5266](https://github.com/open-telemetry/opentelemetry-js/pull/5266)
> [#4419](https://github.com/open-telemetry/opentelemetry-js/pull/4419)
> [#5311](https://github.com/open-telemetry/opentelemetry-js/pull/5311)

## 💥 `@opentelemetry/resources` changes for *implementors* of Resource Detectors

If you maintain an *implementation* of a resource detector, then you will need to update for JS SDK 2.x.  If you have a class that `implements DetectorSync` (or the deprecated `Detector`) interface from `@opentelemetry/resources`, then this section applies to you. There are two cases: if your detector can gather all attribute data *synchronously* (this is the easy case), or if your detector needs to *asynchronously* gather some attribute data.

### Synchronous Resource Detector migration

Before:

```ts
import {
  DetectorSync,
  Resource,
  IResource,
} from '@opentelemetry/resources';

class FooDetector implements DetectorSync {
  detect(): IResource {
    const attributes = {
      'foo.bar': process.env.FOO_BAR,
      'foo.baz': process.env.FOO_BAZ,
    };
    return new Resource(attributes);
  }
}

export const fooDetector = new FooDetector();
```

After:

```ts
import { ResourceDetector, DetectedResource } from '@opentelemetry/resources';

// 1. `ResourceDetector` is the interface name now
class FooDetector implements ResourceDetector {
  detect(): DetectedResource { // 2.
    const attributes = {
      'foo.bar': process.env.FOO_BAR,
      'foo.baz': process.env.FOO_BAZ,
    };
    // 2. The `.detect()` method now returns a vanilla JS object with the
    //    attributes, rather than building a `Resource` instance. The
    //    type is `DetectedResource` rather than `IResource`.
    return { attributes };
  }
}

export const fooDetector = new FooDetector();
```

### Asynchronous Resource Detector migration

If your resource detector implementation *asynchronously* gathers attribute data, then the migration to JS SDK 2.x will be a little bit more work. In the newer `@opentelemetry/resources`, the `ResourceDetector#detect()` method must *synchronously* return every attribute *name* that it *may* provide. Any of those attribute *values* can be a Promise that resolves to a value or to `undefined` if not applicable.

Before:

```ts
import {
  DetectorSync,
  Resource,
  IResource,
  ResourceAttributes,
} from '@opentelemetry/resources';

class FooDetector implements DetectorSync {
  detect(): IResource {
    // A common pattern was to asynchronously gather attributes in a separate
    // async function and pass that Promise to the second argument to
    // `new Resource(...)`.
    return new Resource({}, this._getAttributes());
  }

  private async _getAttributes(): Promise<ResourceAttributes> {
    try {
      const data = await this._someAsyncFunctionToGatherData();
      return {
        'foo.pid': data.pid,
        'foo.agentUuid': data.agentUuid,
      };
    } catch {
      return {};
    }
  }
}

export const fooDetector = new FooDetector();
```

After:

```ts
import {
  ResourceDetector,
  DetectedResource,
  DetectedResourceAttributes,
} from '@opentelemetry/resources';

// 1. `ResourceDetector` is the interface name now.
class FooDetector implements ResourceDetector {
  // 2. `DetectedResource` is the return type now.
  detect(): DetectedResource {
    // 3. Get all attributes, as before. Cannot `await` them.
    const dataPromise = this._gatherData();

    // 4. List all the possible attribute names returned by this detector.
    const attrNames = [
      'foo.pid',
      'foo.agentUuid',
    ];

    const attributes = {} as DetectedResourceAttributes;
    attrNames.forEach(name => {
      // Each resource attribute is determined asynchronously in _gatherData().
      attributes[name] = dataPromise.then(data => data[name]);
    });

    return { attributes };
  }

  // 5. Other than the change in function name and return type, this method is
  //    unchanged from the `_getAttributes` above.
  private async _gatherData(): Promise<DetectedResourceAttributes> {
    try {
      const data = await this._someAsyncFunctionToGatherData();
      return {
        'foo.pid': data.pid,
        'foo.agentUuid': data.agentUuid,
      };
    } catch {
      return {};
    }
  }
}

export const fooDetector = new FooDetector();
```

This shows **one way** that can localize all code changes to the `.detect()` method.

A concrete example of this can be found in [this commit](https://github.com/open-telemetry/opentelemetry-js-contrib/commit/e6c5dbacc2a105ad1f2006504b6984fac97838d7#diff-7c36e5027a21a15157754a62c4b1b7cac3714d92ba263b843af8124c76fb58e1) that migrated the `InstanaAgentDetector` in the `@opentelemetry/resource-detector-instana` package.

### Resource Detector test changes

In your tests, you may need to change how to get a `Resource` instance for assertions.

Before:

```ts
const resource = await fooDetector.detect();
assert.deepStrictEqual(resource.attributes, { ... });
```

After:

```ts
import { detectResources } from '@opentelemetry/resources';

const resource = detectResources({ detectors: [fooDetector] });
await resource.waitForAsyncAttributes?.();
assert.deepStrictEqual(resource.attributes, { ... });
```

## 💥 Other changes

This section describes the remaining breaking changes, not otherwise mentioned in a section above.

Usage of the deprecated `SpanAttributes` and `MetricAttributes` types from the API package has been changed to use the `Attributes` type.

- bumped minimum version of `@opentelemetry/api` peer dependency to 1.1.0 for the following packages: `@opentelemetry/core` [#4408](https://github.com/open-telemetry/opentelemetry-js/pull/4408), `@opentelemetry/resources` [#4428](https://github.com/open-telemetry/opentelemetry-js/pull/4428), `@opentelemetry/sdk-trace-base` [#5009](https://github.com/open-telemetry/opentelemetry-js/pull/5009), `@opentelemetry/shim-opentracing` [#4430](https://github.com/open-telemetry/opentelemetry-js/pull/4430)

<br/>

And finally:

- `@opentelemetry/sdk-node`: The type of `NodeSDKConfiguration.metricReader` has narrowed slightly from `MetricReader` to `IMetricReader`. [#5311](https://github.com/open-telemetry/opentelemetry-js/pull/5311)
- `@opentelemetry/exporter-jaeger`: `ReadableSpan.instrumentationLibrary` -> `ReadableSpan.instrumentationScope` [#5308](https://github.com/open-telemetry/opentelemetry-js/pull/5308)
- `@opentelemetry/exporter-zipkin`: `ReadableSpan.instrumentationLibrary` -> `ReadableSpan.instrumentationScope` [#5308](https://github.com/open-telemetry/opentelemetry-js/pull/5308)
- `@opentelemetry/exporter-prometheus`: Any non-monotonic sums will now be treated as counters and will now include the `_total` suffix. [#5291](https://github.com/open-telemetry/opentelemetry-js/pull/5291) [#5266 (comment)](https://github.com/open-telemetry/opentelemetry-js/pull/5266#issuecomment-2556564698)
- `@opentelemetry/shim-opencenus`: stop mapping removed Instrument `type` to OpenTelemetry metrics [#5291](https://github.com/open-telemetry/opentelemetry-js/pull/5291)
- `@opentelemetry/instrumentation-fetch`: Passthrough original response to `applyCustomAttributes` hook, rather than cloning the response. This means it is no longer possibly to consume the response in `applyCustomAttributes`. [#5281](https://github.com/open-telemetry/opentelemetry-js/pull/5281)
