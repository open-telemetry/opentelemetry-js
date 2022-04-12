# CHANGELOG

All notable changes to experimental packages in this project will be documented in this file.

## Unreleased

### :boom: Breaking Change

* feat(sdk-metrics-base): update metric exporter interfaces #2707 @srikanthccv
* feat(api-metrics): remove observable types #2687 @legendecas
* fix(otlp-http-exporter): remove content length header #2879 @svetlanabrennan
* feat(experimental-packages): Update packages to latest SDK Version. #2871 @pichlermarc
  * removed the -wip suffix from api-metrics and metrics-sdk-base.
  * updated dependencies to stable packages to `1.1.1` for all "experimental" packages.
  * updated Metrics Exporters to the latest Metrics SDK (`exporter-metrics-otlp-grpc`, `exporter-metrics-otlp-http`, `exporter-metrics-otlp-proto`)
  * updated `opentelemetry-sdk-node` to the latest Metrics SDK.
  * updated `otlp-transformer` to the latest Metrics SDK.
  * updated all `instrumentation-*` packages to use local implementations of `parseUrl()` due to #2884

### :rocket: (Enhancement)

* feat: spec compliant metric creation and sync instruments #2588 @dyladan
* feat(api-metrics): async instruments spec compliance #2569 @legendecas
* feat(sdk-metrics-base): add ValueType support for sync instruments #2776 @legendecas
* feat(sdk-metrics-base): implement async instruments support #2686 @legendecas
* feat(sdk-metrics-base): meter registration #2666 @legendecas
* feat(sdk-metrics-base): bootstrap metrics exemplars #2641 @srikanthccv
* feat(metrics-sdk): bootstrap aggregation support #2634 @legendecas
* feat(metrics-sdk): bootstrap views api #2625 @legendecas
* feat(sdk-metrics): bootstrap metric streams #2636 @legendecas
* feat(views): add FilteringAttributesProcessor #2733 @pichlermarc
* feat(metric-reader): add metric-reader #2681 @pichlermarc
* feat(sdk-metrics-base): document and export basic APIs #2725 @legendecas
* feat(views): Update addView() to disallow named views that select more than one instrument. #2820 @pichlermarc
* feat(sdk-metrics-base): update exporting names #2829 @legendecas
* Add grpc compression to trace-otlp-grpc exporter #2813 @svetlanabrennan
* refactor: unifying shutdown once with BindOnceFuture #2695 @legendecas
* feat(prometheus): update prometheus exporter with wip metrics sdk #2824 @legendecas
* feat(instrumentation-xhr): add applyCustomAttributesOnSpan hook #2134 @mhennoch
* feat(proto): add @opentelemetry/otlp-transformer package with hand-rolled transformation #2746 @dyladan
* feat(sdk-metrics-base): shutdown and forceflush on MeterProvider #2890 @legendecas

### :bug: (Bug Fix)

* fix(sdk-metrics-base): remove aggregator.toMetricData dependency on AggregationTemporality #2676 @legendecas
* fix(sdk-metrics-base): coerce histogram boundaries to be implicit Infinity #2859 @legendecas
* fix(instrumentation-http): HTTP 400 status code should not set span status to error on servers #2789 @nordfjord

### :books: (Refine Doc)

* Update metrics example #2658 @svetlanabrennan
* docs(api-metrics): add notes on ObservableResult.observe #2712 @legendecas

### :house: (Internal)

* chore: move trace exporters back to experimental #2835 @dyladan
* refactor(sdk-metrics-base): meter shared states #2821 @legendecas

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
