# CHANGELOG

All notable changes to experimental packages in this project will be documented in this file.

## Unreleased

### :boom: Breaking Change

* [#2707](https://github.com/open-telemetry/opentelemetry-js/pull/2707) feat(sdk-metrics-base): update metric exporter interfaces ([@srikanthccv](https://github.com/srikanthccv))
* [#2687](https://github.com/open-telemetry/opentelemetry-js/pull/2687) feat(api-metrics): remove observable types ([@legendecas](https://github.com/legendecas))
* [#2879](https://github.com/open-telemetry/opentelemetry-js/pull/2879) fix(otlp-http-exporter): remove content length header ([@svetlanabrennan](https://github.com/svetlanabrennan))

### :rocket: (Enhancement)

* [#2588](https://github.com/open-telemetry/opentelemetry-js/pull/2588) feat: spec compliant metric creation and sync instruments ([@dyladan](https://github.com/dyladan))
* [#2569](https://github.com/open-telemetry/opentelemetry-js/pull/2569) feat(api-metrics): async instruments spec compliance ([@legendecas](https://github.com/legendecas))
* [#2776](https://github.com/open-telemetry/opentelemetry-js/pull/2776) feat(sdk-metrics-base): add ValueType support for sync instruments ([@legendecas](https://github.com/legendecas))
* [#2686](https://github.com/open-telemetry/opentelemetry-js/pull/2686) feat(sdk-metrics-base): implement async instruments support ([@legendecas](https://github.com/legendecas))
* [#2666](https://github.com/open-telemetry/opentelemetry-js/pull/2666) feat(sdk-metrics-base): meter registration ([@legendecas](https://github.com/legendecas))
* [#2641](https://github.com/open-telemetry/opentelemetry-js/pull/2641) feat(sdk-metrics-base): bootstrap metrics exemplars ([@srikanthccv](https://github.com/srikanthccv))
* [#2634](https://github.com/open-telemetry/opentelemetry-js/pull/2634) feat(metrics-sdk): bootstrap aggregation support ([@legendecas](https://github.com/legendecas))
* [#2625](https://github.com/open-telemetry/opentelemetry-js/pull/2625) feat(metrics-sdk): bootstrap views api ([@legendecas](https://github.com/legendecas))
* [#2636](https://github.com/open-telemetry/opentelemetry-js/pull/2636) feat(sdk-metrics): bootstrap metric streams ([@legendecas](https://github.com/legendecas))
* [#2733](https://github.com/open-telemetry/opentelemetry-js/pull/2733) feat(views): add FilteringAttributesProcessor ([@pichlermarc](https://github.com/pichlermarc))
* [#2681](https://github.com/open-telemetry/opentelemetry-js/pull/2681) feat(metric-reader): add metric-reader ([@pichlermarc](https://github.com/pichlermarc))
* [#2725](https://github.com/open-telemetry/opentelemetry-js/pull/2725) feat(sdk-metrics-base): document and export basic APIs ([@legendecas](https://github.com/legendecas))
* [#2820](https://github.com/open-telemetry/opentelemetry-js/pull/2820) feat(views): Update addView() to disallow named views that select more than one instrument. ([@pichlermarc](https://github.com/pichlermarc))
* [#2829](https://github.com/open-telemetry/opentelemetry-js/pull/2829) feat(sdk-metrics-base): update exporting names ([@legendecas](https://github.com/legendecas))
* [#2813](https://github.com/open-telemetry/opentelemetry-js/pull/2813) Add grpc compression to trace-otlp-grpc exporter ([@svetlanabrennan](https://github.com/svetlanabrennan))
* [#2695](https://github.com/open-telemetry/opentelemetry-js/pull/2695) refactor: unifying shutdown once with BindOnceFuture ([@legendecas](https://github.com/legendecas))
* [#2824](https://github.com/open-telemetry/opentelemetry-js/pull/2824) feat(prometheus): update prometheus exporter with wip metrics sdk ([@legendecas](https://github.com/legendecas))
* [#2134](https://github.com/open-telemetry/opentelemetry-js/pull/2134) feat(instrumentation-xhr): add applyCustomAttributesOnSpan hook ([@mhennoch](https://github.com/mhennoch))
* [#2746](https://github.com/open-telemetry/opentelemetry-js/pull/2746) feat(proto): add @opentelemetry/otlp-transformer package with hand-rolled transformation ([@dyladan](https://github.com/dyladan))

### :bug: (Bug Fix)

* [#2676](https://github.com/open-telemetry/opentelemetry-js/pull/2676) fix(sdk-metrics-base): remove aggregator.toMetricData dependency on AggregationTemporality ([@legendecas](https://github.com/legendecas))
* [#2859](https://github.com/open-telemetry/opentelemetry-js/pull/2859) fix(sdk-metrics-base): coerce histogram boundaries to be implicit Infinity ([@legendecas](https://github.com/legendecas))
* [#2789](https://github.com/open-telemetry/opentelemetry-js/pull/2789) fix(instrumentation-http): HTTP 400 status code should not set span status to error on servers ([@nordfjord](https://github.com/nordfjord))

### :books: (Refine Doc)

* [#2658](https://github.com/open-telemetry/opentelemetry-js/pull/2658) Update metrics example ([@svetlanabrennan](https://github.com/svetlanabrennan))
* [#2712](https://github.com/open-telemetry/opentelemetry-js/pull/2712) docs(api-metrics): add notes on ObservableResult.observe ([@legendecas](https://github.com/legendecas))

### :house: (Internal)

* [#2835](https://github.com/open-telemetry/opentelemetry-js/pull/2835) chore: move trace exporters back to experimental ([@dyladan](https://github.com/dyladan))

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
