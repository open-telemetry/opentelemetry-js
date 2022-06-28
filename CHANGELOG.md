# CHANGELOG

All notable changes to this project will be documented in this file.

## Unreleased

### :boom: Breaking Change

### :rocket: (Enhancement)

### :bug: (Bug Fix)

* fix(resources): fix browser compatibility for host and os detectors [#3004](https://github.com/open-telemetry/opentelemetry-js/pull/3004) @legendecas
* fix(sdk-trace-base): fix crash on environments without global document [#3000](https://github.com/open-telemetry/opentelemetry-js/pull/3000) @legendecas

### :books: (Refine Doc)

### :house: (Internal)

* test: add node 18 and remove EoL node versions [#3048](https://github.com/open-telemetry/opentelemetry-js/pull/3048) @dyladan

## 1.3.1

### :bug: (Bug Fix)

* fix(resources): fix browser compatibility for host and os detectors [#3004](https://github.com/open-telemetry/opentelemetry-js/pull/3004) @legendecas

## 1.3.0

### :boom: Breaking Change

* chore: remove unused InstrumentationConfig#path [#2944](https://github.com/open-telemetry/opentelemetry-js/pull/2944) @flarna

### :rocket: (Enhancement)

* feat(ConsoleSpanExporter): export span links [#2917](https://github.com/open-telemetry/opentelemetry-js/pull/2917) @trentm
* feat: warn when hooked module is already loaded [#2926](https://github.com/open-telemetry/opentelemetry-js/pull/2926) @nozik
* feat: implement OSDetector [#2927](https://github.com/open-telemetry/opentelemetry-js/pull/2927) @rauno56
* feat: implement HostDetector [#2921](https://github.com/open-telemetry/opentelemetry-js/pull/2921) @rauno56
* feat(opentelemetry-core): add InstrumentationScope [#2959](https://github.com/open-telemetry/opentelemetry-js/pull/2959) @pichlermarc

### :bug: (Bug Fix)

* fix(sdk-web): parse url with relative url string [#2972](https://github.com/open-telemetry/opentelemetry-js/pull/2972) @legendecas

### :books: (Refine Doc)

### :house: (Internal)

## 1.2.0

### :boom: Breaking Change

### :rocket: (Enhancement)

### :bug: (Bug Fix)

* fix: sanitize attributes inputs [#2881](https://github.com/open-telemetry/opentelemetry-js/pull/2881) @legendecas
* fix: support earlier API versions [#2892](https://github.com/open-telemetry/opentelemetry-js/pull/2892) @dyladan
* fix: support extract one digit '0' in jaeger traceFlag [#2905](https://github.com/open-telemetry/opentelemetry-js/issues/2905) @shmilyoo
* fix(resources): extend ResourceAttributes interface to comply with spec [#2924](https://github.com/open-telemetry/opentelemetry-js/pull/2924) @blumamir

### :books: (Refine Doc)

* docs(sdk): update earliest support node version [#2860](https://github.com/open-telemetry/opentelemetry-js/pull/2860) @svetlanabrennan

### :house: (Internal)

* chore: require changelog entry to merge PR [#2847](https://github.com/open-telemetry/opentelemetry-js/pull/2847) @dyladan
* chore: remove peer API check [#2892](https://github.com/open-telemetry/opentelemetry-js/pull/2892) @dyladan
* chore: merge lerna subdirectories into a single monorepo [#2892](https://github.com/open-telemetry/opentelemetry-js/pull/2892) @dyladan
* chore: indent the code with eslint [#2923](https://github.com/open-telemetry/opentelemetry-js/pull/2923) @blumamir
* `opentelemetry-propagator-jaeger`
  * [#2906](https://github.com/open-telemetry/opentelemetry-js/pull/2906) fix: support extract one digit '0' in jaeger traceFlag ([@shmilyoo](https://github.com/shmilyoo))

## 1.1.1

* [#2849](https://github.com/open-telemetry/opentelemetry-js/pull/2849) fix: correct changelog and compat matrix for 1.1 release ([@Flarna](https://github.com/Flarna))
* [#2823](https://github.com/open-telemetry/opentelemetry-js/pull/2823) fix: enable downlevelIteration for es5 targets ([@legendecas](https://github.com/legendecas))
* [#2844](https://github.com/open-telemetry/opentelemetry-js/pull/2844) chore: add prepublishOnly to ensure a full build ([@legendecas](https://github.com/legendecas))

## 1.1.0

### :rocket: (Enhancement)

* `opentelemetry-resources`
  * [#2727](https://github.com/open-telemetry/opentelemetry-js/pull/2727) feat(opentelemetry-resources): add runtime version information ([@cuichenli](https://github.com/cuichenli))
* `exporter-trace-otlp-http`, `opentelemetry-core`
  * [#2796](https://github.com/open-telemetry/opentelemetry-js/pull/2796) feat(trace-otlp-http-exporter): add compression env vars ([@svetlanabrennan](https://github.com/svetlanabrennan))
* `instrumentation-http`
  * [#2704](https://github.com/open-telemetry/opentelemetry-js/pull/2704) feat(instrumentation-http): add options to ignore requests ([@legendecas](https://github.com/legendecas))
* `opentelemetry-core`, `opentelemetry-exporter-jaeger`
  * [#2754](https://github.com/open-telemetry/opentelemetry-js/pull/2754) fix(exporter-jaeger): add env variable for agent port ([@blumamir](https://github.com/blumamir))
* `exporter-trace-otlp-grpc`, `exporter-trace-otlp-http`, `exporter-trace-otlp-proto`, `opentelemetry-context-async-hooks`, `opentelemetry-context-zone-peer-dep`, `opentelemetry-core`, `opentelemetry-exporter-jaeger`, `opentelemetry-exporter-zipkin`, `opentelemetry-propagator-b3`, `opentelemetry-propagator-jaeger`, `opentelemetry-resources`, `opentelemetry-sdk-trace-base`, `opentelemetry-sdk-trace-node`, `opentelemetry-sdk-trace-web`, `opentelemetry-shim-opentracing`
  * [#2737](https://github.com/open-telemetry/opentelemetry-js/pull/2737) feat: add support for API 1.1.x ([@dyladan](https://github.com/dyladan))
* `opentelemetry-sdk-trace-web`
  * [#2719](https://github.com/open-telemetry/opentelemetry-js/pull/2719) feat(sdk-trace-web): web worker support ([@legendecas](https://github.com/legendecas))
* `exporter-trace-otlp-http`, `exporter-trace-otlp-proto`
  * [#2557](https://github.com/open-telemetry/opentelemetry-js/pull/2557) feat(otlp-exporter-http): change otlp-http port to canonical 4318 ([@secustor](https://github.com/secustor))
* `exporter-trace-otlp-grpc`, `exporter-trace-otlp-http`, `exporter-trace-otlp-proto`, `opentelemetry-core`, `opentelemetry-exporter-jaeger`, `opentelemetry-sdk-trace-base`
  * [#2695](https://github.com/open-telemetry/opentelemetry-js/pull/2695) refactor: unifying shutdown once with BindOnceFuture ([@legendecas](https://github.com/legendecas))
* `opentelemetry-propagator-jaeger`
  * [#2673](https://github.com/open-telemetry/opentelemetry-js/pull/2673) feat(@opentelemetry/propagator-jaeger): support custom baggage prefix ([@sschegolev](https://github.com/sschegolev))
* `exporter-trace-otlp-grpc`, `exporter-trace-otlp-http`, `exporter-trace-otlp-proto`
  * [#2626](https://github.com/open-telemetry/opentelemetry-js/pull/2626) chore: bump otlp trace exporters to v1 ([@Rauno56](https://github.com/Rauno56))
* `opentelemetry-context-zone-peer-dep`, `opentelemetry-context-zone`, `opentelemetry-core`, `opentelemetry-exporter-zipkin`, `opentelemetry-propagator-b3`, `opentelemetry-resources`, `opentelemetry-sdk-trace-base`, `opentelemetry-sdk-trace-web`, `opentelemetry-semantic-conventions`
  * [#2556](https://github.com/open-telemetry/opentelemetry-js/pull/2556) chore: add esm2015 entry for web apps aiming at modern browsers ([@echoontheway](https://github.com/echoontheway))

### :bug: (Bug Fix)

* `exporter-trace-otlp-grpc`, `exporter-trace-otlp-http`, `exporter-trace-otlp-proto`
  * [#2788](https://github.com/open-telemetry/opentelemetry-js/pull/2788) fix(deps): use 1.x trace otlp http exporter ([@dyladan](https://github.com/dyladan))
* `opentelemetry-sdk-trace-base`
  * [#2790](https://github.com/open-telemetry/opentelemetry-js/pull/2790) fix: pass same context to Sampler and SpanProcessor in root span case ([@Flarna](https://github.com/Flarna))
  * [#2757](https://github.com/open-telemetry/opentelemetry-js/pull/2757) fix: add parentContext to onStart ([@Flarna](https://github.com/Flarna))
  * [#2678](https://github.com/open-telemetry/opentelemetry-js/pull/2678) fix: span attribute count and value limits (#2671) ([@Bataran](https://github.com/Bataran))
  * [#2679](https://github.com/open-telemetry/opentelemetry-js/pull/2679) fix: span events count limit when set to 0 ([@Bataran](https://github.com/Bataran))
* `opentelemetry-core`
  * [#2766](https://github.com/open-telemetry/opentelemetry-js/pull/2766) fix(baggage): include baggage metadata when propagating baggage entries ([@chrskrchr](https://github.com/chrskrchr))
* `opentelemetry-exporter-jaeger`
  * [#2731](https://github.com/open-telemetry/opentelemetry-js/pull/2731) fix(exporter-jaeger): transform all links to jaeger reference ([@blumamir](https://github.com/blumamir))
* `opentelemetry-resources`
  * [#2739](https://github.com/open-telemetry/opentelemetry-js/pull/2739) fix(resources): align exported names in different environments ([@legendecas](https://github.com/legendecas))
* Other
  * [#2680](https://github.com/open-telemetry/opentelemetry-js/pull/2680) fix: tracer typo in fetchxhr examples ([@MSNev](https://github.com/MSNev))
  * [#2650](https://github.com/open-telemetry/opentelemetry-js/pull/2650) fix: clientMethodTrace missing original properties ([@bgpo](https://github.com/bgpo))
* `opentelemetry-propagator-jaeger`
  * [#2694](https://github.com/open-telemetry/opentelemetry-js/pull/2694) fix(propagator-jaeger): 0-pad span-id to match 16-symbol validation ([@nikolaylagutko](https://github.com/nikolaylagutko))
* `opentelemetry-exporter-zipkin`, `opentelemetry-sdk-trace-web`
  * [#2689](https://github.com/open-telemetry/opentelemetry-js/pull/2689) fix: remove window and document dependencies in web packages ([@legendecas](https://github.com/legendecas))

### :books: (Refine Doc)

* Other
  * [#2830](https://github.com/open-telemetry/opentelemetry-js/pull/2830) Cleanup removed documentation for missing benchmarks ([@dmathieu](https://github.com/dmathieu))
  * [#2807](https://github.com/open-telemetry/opentelemetry-js/pull/2807) docs: document removal of shutdown flag in OTLPExporterBase ([@legendecas](https://github.com/legendecas))
  * [#2814](https://github.com/open-telemetry/opentelemetry-js/pull/2814) docs: simplify contrib part in readme ([@Flarna](https://github.com/Flarna))
  * [#2802](https://github.com/open-telemetry/opentelemetry-js/pull/2802) docs(prom-example): remove deprecated startServer option ([@naseemkullah](https://github.com/naseemkullah))
  * [#2728](https://github.com/open-telemetry/opentelemetry-js/pull/2728) docs: specify minimun version of npm to run command in subproject ([@cuichenli](https://github.com/cuichenli))
  * [#2720](https://github.com/open-telemetry/opentelemetry-js/pull/2720) docs: document node v10 EOL ([@YanivD](https://github.com/YanivD))
  * [#2688](https://github.com/open-telemetry/opentelemetry-js/pull/2688) docs: update typedoc config ([@dyladan](https://github.com/dyladan))
  * [#2685](https://github.com/open-telemetry/opentelemetry-js/pull/2685) docs: remove circle-ci from development guide, update link, and fix typo. ([@pichlermarc](https://github.com/pichlermarc))
  * [#2661](https://github.com/open-telemetry/opentelemetry-js/pull/2661) chore: update and fix tracer-web examples ([@MSNev](https://github.com/MSNev))
  * [#2647](https://github.com/open-telemetry/opentelemetry-js/pull/2647) chore: update opentelemetry dependencies to latest versions ([@svetlanabrennan](https://github.com/svetlanabrennan))
* `exporter-trace-otlp-grpc`
  * [#2726](https://github.com/open-telemetry/opentelemetry-js/pull/2726) docs(otlp-grpc-exporter): update default url ([@svetlanabrennan](https://github.com/svetlanabrennan))
* `opentelemetry-context-async-hooks`
  * [#2619](https://github.com/open-telemetry/opentelemetry-js/pull/2619) docs(context): Fix links, edit prose ([@spencerwilson](https://github.com/spencerwilson))
* `opentelemetry-context-async-hooks`, `opentelemetry-sdk-trace-node`
  * [#2651](https://github.com/open-telemetry/opentelemetry-js/pull/2651) docs: fix links to the context document ([@legendecas](https://github.com/legendecas))

### :house: (Internal)

* `opentelemetry-sdk-trace-base`
  * [#2768](https://github.com/open-telemetry/opentelemetry-js/pull/2768) test(sdk-trace-base): pin core.hrtime dependencies on timeOrigin ([@legendecas](https://github.com/legendecas))
* `exporter-trace-otlp-http`, `opentelemetry-context-zone-peer-dep`, `opentelemetry-context-zone`, `opentelemetry-core`, `opentelemetry-exporter-zipkin`, `opentelemetry-propagator-b3`, `opentelemetry-resources`, `opentelemetry-sdk-trace-base`, `opentelemetry-sdk-trace-web`, `opentelemetry-semantic-conventions`
  * [#2765](https://github.com/open-telemetry/opentelemetry-js/pull/2765) chore: target to es2017 in the no-polyfill target ([@legendecas](https://github.com/legendecas))
* Other
  * [#2743](https://github.com/open-telemetry/opentelemetry-js/pull/2743) test(sdk-metrics-base): test metric instrument interfaces ([@legendecas](https://github.com/legendecas))
  * [#2752](https://github.com/open-telemetry/opentelemetry-js/pull/2752) test(integration-w3c): fix inconsistent api versions loaded ([@legendecas](https://github.com/legendecas))
  * [#2715](https://github.com/open-telemetry/opentelemetry-js/pull/2715) chore: update actions/checkout to v2 ([@legendecas](https://github.com/legendecas))
  * [#2702](https://github.com/open-telemetry/opentelemetry-js/pull/2702) chore: add Chengzhong Wu as maintainer ([@dyladan](https://github.com/dyladan))
  * [#2703](https://github.com/open-telemetry/opentelemetry-js/pull/2703) chore: add Amir Blum as maintainer ([@dyladan](https://github.com/dyladan))
  * [#2701](https://github.com/open-telemetry/opentelemetry-js/pull/2701) chore: add Rauno Viskus as maintainer ([@dyladan](https://github.com/dyladan))
  * [#2693](https://github.com/open-telemetry/opentelemetry-js/pull/2693) chore: retry link checks on code 429 with 'retry-after' header ([@legendecas](https://github.com/legendecas))
  * [#2669](https://github.com/open-telemetry/opentelemetry-js/pull/2669) chore: checks links in typedoc html ([@legendecas](https://github.com/legendecas))
  * [#2683](https://github.com/open-telemetry/opentelemetry-js/pull/2683) chore: start a style guide ([@dyladan](https://github.com/dyladan))
  * [#2684](https://github.com/open-telemetry/opentelemetry-js/pull/2684) chore: remove @obecny as maintainer ([@dyladan](https://github.com/dyladan))
  * [#2663](https://github.com/open-telemetry/opentelemetry-js/pull/2663) chore: fix nojekyll in docs command ([@dyladan](https://github.com/dyladan))
  * [#2648](https://github.com/open-telemetry/opentelemetry-js/pull/2648) refactor(opentelemetry-sdk-node): remove redundant judgments for metric ([@rickyes](https://github.com/rickyes))
  * [#2638](https://github.com/open-telemetry/opentelemetry-js/pull/2638) chore: Update wip metrics references ([@dyladan](https://github.com/dyladan))
  * [#2629](https://github.com/open-telemetry/opentelemetry-js/pull/2629) chore: rename metrics packages to prevent lerna linking ([@dyladan](https://github.com/dyladan))
  * [#2623](https://github.com/open-telemetry/opentelemetry-js/pull/2623) chore: fix the compilation for typescript 4.4 ([@dyladan](https://github.com/dyladan))
  * [#2598](https://github.com/open-telemetry/opentelemetry-js/pull/2598) chore: Remove old metrics SDK ([@dyladan](https://github.com/dyladan))
* `opentelemetry-core`
  * [#2709](https://github.com/open-telemetry/opentelemetry-js/pull/2709) test(sdk-metrics): browser compatibility tests ([@legendecas](https://github.com/legendecas))
* `exporter-trace-otlp-grpc`, `exporter-trace-otlp-http`, `exporter-trace-otlp-proto`, `opentelemetry-exporter-jaeger`, `opentelemetry-exporter-zipkin`, `opentelemetry-propagator-b3`, `opentelemetry-resources`, `opentelemetry-sdk-trace-base`, `opentelemetry-sdk-trace-web`, `opentelemetry-semantic-conventions`
  * [#2710](https://github.com/open-telemetry/opentelemetry-js/pull/2710) chore: apply eslint rule semi ([@legendecas](https://github.com/legendecas))
* `exporter-trace-otlp-grpc`, `exporter-trace-otlp-http`, `exporter-trace-otlp-proto`, `opentelemetry-context-async-hooks`, `opentelemetry-context-zone-peer-dep`, `opentelemetry-context-zone`, `opentelemetry-core`, `opentelemetry-exporter-jaeger`, `opentelemetry-exporter-zipkin`, `opentelemetry-propagator-b3`, `opentelemetry-propagator-jaeger`, `opentelemetry-resources`, `opentelemetry-sdk-trace-base`, `opentelemetry-sdk-trace-node`, `opentelemetry-sdk-trace-web`, `opentelemetry-semantic-conventions`, `opentelemetry-shim-opentracing`, `template`
  * [#2699](https://github.com/open-telemetry/opentelemetry-js/pull/2699) chore: rename `--include-filtered-dependencies` ([@Rauno56](https://github.com/Rauno56))
* `opentelemetry-context-async-hooks`, `opentelemetry-context-zone-peer-dep`, `opentelemetry-context-zone`, `opentelemetry-core`, `opentelemetry-exporter-jaeger`, `opentelemetry-exporter-zipkin`, `opentelemetry-propagator-b3`, `opentelemetry-propagator-jaeger`, `opentelemetry-resources`, `opentelemetry-sdk-trace-base`, `opentelemetry-sdk-trace-node`, `opentelemetry-sdk-trace-web`, `opentelemetry-semantic-conventions`, `opentelemetry-shim-opentracing`
  * [#2657](https://github.com/open-telemetry/opentelemetry-js/pull/2657) chore: add markdown link checks ([@legendecas](https://github.com/legendecas))
* `opentelemetry-exporter-jaeger`, `opentelemetry-exporter-zipkin`, `opentelemetry-resources`, `opentelemetry-semantic-conventions`
  * [#2652](https://github.com/open-telemetry/opentelemetry-js/pull/2652) Update nock ([@dyladan](https://github.com/dyladan))
* `opentelemetry-sdk-trace-web`
  * [#2451](https://github.com/open-telemetry/opentelemetry-js/pull/2451) chore(sdk-trace-web): fix lint warnings ([@alisabzevari](https://github.com/alisabzevari))

### Committers: 24

* Ali Sabzevari ([@alisabzevari](https://github.com/alisabzevari))
* Amir Blum ([@blumamir](https://github.com/blumamir))
* Chris Karcher ([@chrskrchr](https://github.com/chrskrchr))
* Damien Mathieu ([@dmathieu](https://github.com/dmathieu))
* Daniel Dyla ([@dyladan](https://github.com/dyladan))
* Gerhard Stöbich ([@Flarna](https://github.com/Flarna))
* Marc Pichler ([@pichlermarc](https://github.com/pichlermarc))
* Mitar Milanovic ([@Bataran](https://github.com/Bataran))
* Nev ([@MSNev](https://github.com/MSNev))
* Nikolay Lagutko ([@nikolaylagutko](https://github.com/nikolaylagutko))
* Rauno Viskus ([@Rauno56](https://github.com/Rauno56))
* Ricky Zhou ([@rickyes](https://github.com/rickyes))
* Sebastian Poxhofer ([@secustor](https://github.com/secustor))
* Siim Kallas ([@seemk](https://github.com/seemk))
* Spencer Wilson ([@spencerwilson](https://github.com/spencerwilson))
* Srikanth Chekuri ([@srikanthccv](https://github.com/srikanthccv))
* Svetlana Brennan ([@svetlanabrennan](https://github.com/svetlanabrennan))
* Will Li ([@cuichenli](https://github.com/cuichenli))
* Yaniv Davidi ([@YanivD](https://github.com/YanivD))
* [@bgpo](https://github.com/bgpo)
* [@echoontheway](https://github.com/echoontheway)
* [@naseemkullah](https://github.com/naseemkullah)
* [@sschegolev](https://github.com/sschegolev)
* legendecas ([@legendecas](https://github.com/legendecas))

## 1.0.1 / Experimental 0.27.0

### :boom: Breaking Change

* Other
  * [#2566](https://github.com/open-telemetry/opentelemetry-js/pull/2566) feat!(metrics): remove batch observer ([@dyladan](https://github.com/dyladan))
  * [#2485](https://github.com/open-telemetry/opentelemetry-js/pull/2485) feat!: Split metric and trace exporters into new experimental packages ([@willarmiros](https://github.com/willarmiros))
  * [#2540](https://github.com/open-telemetry/opentelemetry-js/pull/2540) fix(sdk-metrics-base): remove metric kind BATCH_OBSERVER ([@legendecas](https://github.com/legendecas))
  * [#2496](https://github.com/open-telemetry/opentelemetry-js/pull/2496) feat(api-metrics): rename metric instruments to match feature-freeze API specification ([@legendecas](https://github.com/legendecas))
* `opentelemetry-core`
  * [#2529](https://github.com/open-telemetry/opentelemetry-js/pull/2529) feat(api-metrics): add schemaUrl to meter creations ([@legendecas](https://github.com/legendecas))

### :rocket: (Enhancement)

* Other
  * [#2523](https://github.com/open-telemetry/opentelemetry-js/pull/2523) feat: Rename Labels to Attributes ([@pirgeo](https://github.com/pirgeo))
  * [#2559](https://github.com/open-telemetry/opentelemetry-js/pull/2559) feat(api-metrics): remove bind/unbind and bound instruments ([@legendecas](https://github.com/legendecas))
  * [#2563](https://github.com/open-telemetry/opentelemetry-js/pull/2563) feat(sdk-metrics-base): remove per-meter config on MeterProvider.getMeter ([@legendecas](https://github.com/legendecas))
* `opentelemetry-core`
  * [#2465](https://github.com/open-telemetry/opentelemetry-js/pull/2465) fix: prefer globalThis instead of window to support webworkers ([@legendecas](https://github.com/legendecas))
* `opentelemetry-semantic-conventions`
  * [#2532](https://github.com/open-telemetry/opentelemetry-js/pull/2532) feat(@opentelemetry/semantic-conventions): change enum to object literals ([@echoontheway](https://github.com/echoontheway))
  * [#2528](https://github.com/open-telemetry/opentelemetry-js/pull/2528) feat: upgrade semantic-conventions to latest v1.7.0 spec ([@weyert](https://github.com/weyert))
* `opentelemetry-core`, `opentelemetry-sdk-trace-base`
  * [#2484](https://github.com/open-telemetry/opentelemetry-js/pull/2484) feat: new merge function ([@obecny](https://github.com/obecny))

### :bug: (Bug Fix)

* Other
  * [#2610](https://github.com/open-telemetry/opentelemetry-js/pull/2610) fix: preventing double enable for instrumentation that has been already enabled ([@obecny](https://github.com/obecny))
  * [#2581](https://github.com/open-telemetry/opentelemetry-js/pull/2581) feat: lazy initialization of the gzip stream ([@fungiboletus](https://github.com/fungiboletus))
  * [#2584](https://github.com/open-telemetry/opentelemetry-js/pull/2584) fix: fixing compatibility versions for detectors ([@obecny](https://github.com/obecny))
  * [#2558](https://github.com/open-telemetry/opentelemetry-js/pull/2558) fix(@opentelemetry/exporter-prometheus): unref prometheus server to prevent process running indefinitely ([@mothershipper](https://github.com/mothershipper))
  * [#2495](https://github.com/open-telemetry/opentelemetry-js/pull/2495) fix(sdk-metrics-base): metrics name should be in the max length of 63 ([@legendecas](https://github.com/legendecas))
  * [#2497](https://github.com/open-telemetry/opentelemetry-js/pull/2497) feat(@opentelemetry-instrumentation-fetch): support reading response body from the hook applyCustomAttributesOnSpan ([@echoontheway](https://github.com/echoontheway))
* `opentelemetry-core`
  * [#2560](https://github.com/open-telemetry/opentelemetry-js/pull/2560) fix(core): support regex global flag in urlMatches ([@moander](https://github.com/moander))
* `opentelemetry-exporter-zipkin`
  * [#2519](https://github.com/open-telemetry/opentelemetry-js/pull/2519) fix(exporter-zipkin): correct status tags names ([@t2t2](https://github.com/t2t2))

### :books: (Refine Doc)

* Other
  * [#2561](https://github.com/open-telemetry/opentelemetry-js/pull/2561) Use new canonical path to Getting Started ([@chalin](https://github.com/chalin))
  * [#2576](https://github.com/open-telemetry/opentelemetry-js/pull/2576) docs(instrumentation): update links in the Readme ([@OlivierAlbertini](https://github.com/OlivierAlbertini))
  * [#2600](https://github.com/open-telemetry/opentelemetry-js/pull/2600) docs: fix URLs in README post-experimental move ([@arbourd](https://github.com/arbourd))
  * [#2579](https://github.com/open-telemetry/opentelemetry-js/pull/2579) doc: Move upgrade propagator notes to correct section ([@NathanielRN](https://github.com/NathanielRN))
  * [#2568](https://github.com/open-telemetry/opentelemetry-js/pull/2568) chore(doc): update matrix with contrib version for 1.0 core ([@vmarchaud](https://github.com/vmarchaud))
  * [#2555](https://github.com/open-telemetry/opentelemetry-js/pull/2555) docs: expose existing comments ([@moander](https://github.com/moander))
  * [#2493](https://github.com/open-telemetry/opentelemetry-js/pull/2493) chore: remove getting started and link to documentation. ([@svrnm](https://github.com/svrnm))
* `opentelemetry-core`
  * [#2604](https://github.com/open-telemetry/opentelemetry-js/pull/2604) Docs: Document the HrTime format ([@JamesJHPark](https://github.com/JamesJHPark))

### :house: (Internal)

* Other
  * [#2404](https://github.com/open-telemetry/opentelemetry-js/pull/2404) chore: Fix lint warnings in instrumentation package ([@alisabzevari](https://github.com/alisabzevari))
  * [#2533](https://github.com/open-telemetry/opentelemetry-js/pull/2533) chore: regularly close stale issues ([@Rauno56](https://github.com/Rauno56))
  * [#2570](https://github.com/open-telemetry/opentelemetry-js/pull/2570) chore: adding selenium tests with browserstack ([@obecny](https://github.com/obecny))
  * [#2522](https://github.com/open-telemetry/opentelemetry-js/pull/2522) chore: cleanup setting config in instrumentations ([@Flarna](https://github.com/Flarna))
  * [#2541](https://github.com/open-telemetry/opentelemetry-js/pull/2541) chore: slim font size for section title in PR template ([@legendecas](https://github.com/legendecas))
  * [#2509](https://github.com/open-telemetry/opentelemetry-js/pull/2509) chore: expand pull request template with action items ([@pragmaticivan](https://github.com/pragmaticivan))
  * [#2488](https://github.com/open-telemetry/opentelemetry-js/pull/2488) chore: inline sources in source maps ([@dyladan](https://github.com/dyladan))
  * [#2514](https://github.com/open-telemetry/opentelemetry-js/pull/2514) chore: update stable dependencies to 1.0 ([@dyladan](https://github.com/dyladan))
* `opentelemetry-sdk-trace-base`, `opentelemetry-sdk-trace-node`, `opentelemetry-sdk-trace-web`
  * [#2607](https://github.com/open-telemetry/opentelemetry-js/pull/2607) chore: update npm badge image links ([@legendecas](https://github.com/legendecas))
* `opentelemetry-context-async-hooks`, `opentelemetry-context-zone-peer-dep`, `opentelemetry-core`, `opentelemetry-exporter-jaeger`, `opentelemetry-exporter-zipkin`, `opentelemetry-propagator-b3`, `opentelemetry-propagator-jaeger`, `opentelemetry-resources`, `opentelemetry-sdk-trace-base`, `opentelemetry-sdk-trace-node`, `opentelemetry-sdk-trace-web`, `opentelemetry-shim-opentracing`
  * [#2531](https://github.com/open-telemetry/opentelemetry-js/pull/2531) chore(deps): pin minor API version ([@Flarna](https://github.com/Flarna))
* `opentelemetry-core`
  * [#2520](https://github.com/open-telemetry/opentelemetry-js/pull/2520) chore(deps): remove unused semver  ([@mhennoch](https://github.com/mhennoch))

### Committers: 23

* (Eliseo) Nathaniel Ruiz Nowell ([@NathanielRN](https://github.com/NathanielRN))
* Ali Sabzevari ([@alisabzevari](https://github.com/alisabzevari))
* Antoine Pultier ([@fungiboletus](https://github.com/fungiboletus))
* Bartlomiej Obecny ([@obecny](https://github.com/obecny))
* Daniel Dyla ([@dyladan](https://github.com/dyladan))
* Dylan Arbour ([@arbourd](https://github.com/arbourd))
* Georg Pirklbauer ([@pirgeo](https://github.com/pirgeo))
* Gerhard Stöbich ([@Flarna](https://github.com/Flarna))
* Ivan Santos ([@pragmaticivan](https://github.com/pragmaticivan))
* Jack ([@mothershipper](https://github.com/mothershipper))
* James ([@JamesJHPark](https://github.com/JamesJHPark))
* MartenH ([@mhennoch](https://github.com/mhennoch))
* Olivier Albertini ([@OlivierAlbertini](https://github.com/OlivierAlbertini))
* Patrice Chalin ([@chalin](https://github.com/chalin))
* Rauno Viskus ([@Rauno56](https://github.com/Rauno56))
* Severin Neumann ([@svrnm](https://github.com/svrnm))
* Valentin Marchaud ([@vmarchaud](https://github.com/vmarchaud))
* Weyert de Boer ([@weyert](https://github.com/weyert))
* William Armiros ([@willarmiros](https://github.com/willarmiros))
* [@echoontheway](https://github.com/echoontheway)
* legendecas ([@legendecas](https://github.com/legendecas))
* moander ([@moander](https://github.com/moander))
* t2t2 ([@t2t2](https://github.com/t2t2))

## 1.0.0

No changes

## 0.26.0

### :boom: Breaking Change

* `opentelemetry-exporter-collector-grpc`, `opentelemetry-exporter-otlp-grpc`, `opentelemetry-exporter-otlp-http`, `opentelemetry-exporter-otlp-proto`
  * [#2476](https://github.com/open-telemetry/opentelemetry-js/pull/2476) chore!: rename collector exporters ([@dyladan](https://github.com/dyladan))
* `opentelemetry-core`, `opentelemetry-instrumentation-grpc`, `opentelemetry-sdk-trace-base`, `opentelemetry-shim-opentracing`
  * [#2429](https://github.com/open-telemetry/opentelemetry-js/pull/2429) fix!: remove 'Http' from W3C propagator names ([@aabmass](https://github.com/aabmass))

### :rocket: (Enhancement)

* `opentelemetry-core`, `opentelemetry-sdk-trace-base`
  * [#2430](https://github.com/open-telemetry/opentelemetry-js/pull/2430) feat(opentelemetry-sdk-trace-base): implemented general limits of attributes ([@banothurameshnaik](https://github.com/banothurameshnaik))
  * [#2418](https://github.com/open-telemetry/opentelemetry-js/pull/2418) feat(opentelemetry-sdk-trace-base): implemented option to limit length of values of attributes ([@banothurameshnaik](https://github.com/banothurameshnaik))
* `opentelemetry-instrumentation`
  * [#2450](https://github.com/open-telemetry/opentelemetry-js/pull/2450) fix: handle missing package.json file when checking for version ([@nozik](https://github.com/nozik))
* `opentelemetry-semantic-conventions`
  * [#2456](https://github.com/open-telemetry/opentelemetry-js/pull/2456) feat: upgrade semantic conventions to the latest 1.6.1 version ([@weyert](https://github.com/weyert))
* `opentelemetry-exporter-collector-proto`, `opentelemetry-exporter-collector`
  * [#2438](https://github.com/open-telemetry/opentelemetry-js/pull/2438) feat: OTEL_EXPORTER_OTLP_ENDPOINT append version and signal ([@longility](https://github.com/longility))

### :bug: (Bug Fix)

* Other
  * [#2494](https://github.com/open-telemetry/opentelemetry-js/pull/2494) fix: remove setting http.route in http span attributes ([@mustafain117](https://github.com/mustafain117))
* `opentelemetry-instrumentation-fetch`
  * [#2426](https://github.com/open-telemetry/opentelemetry-js/pull/2426) fix(opentelemetry-instrumentation-fetch): fixed override of headers ([@philipszalla](https://github.com/philipszalla))
* `opentelemetry-sdk-trace-base`
  * [#2434](https://github.com/open-telemetry/opentelemetry-js/pull/2434) fix: ReferenceError when OTEL_TRACES_SAMPLER used without OTEL_TRACES_SAMPLER_ARG ([@hermanbanken](https://github.com/hermanbanken))

### :books: (Refine Doc)

* [#2478](https://github.com/open-telemetry/opentelemetry-js/pull/2478) Update links to packages moved to experimental ([@jessitron](https://github.com/jessitron))
* [#2463](https://github.com/open-telemetry/opentelemetry-js/pull/2463) docs(README): Fix links in README.md ([@JamesJHPark](https://github.com/JamesJHPark))
* [#2437](https://github.com/open-telemetry/opentelemetry-js/pull/2437) docs(examples): updated examples readme links ([@banothurameshnaik](https://github.com/banothurameshnaik))
* [#2421](https://github.com/open-telemetry/opentelemetry-js/pull/2421) docs(website): support GH page links to canonical src ([@chalin](https://github.com/chalin))
* [#2408](https://github.com/open-telemetry/opentelemetry-js/pull/2408) docs: make link to exporters filter only exporters ([@Rauno56](https://github.com/Rauno56))
* [#2297](https://github.com/open-telemetry/opentelemetry-js/pull/2297) eslint configuration for getting-started examples ([@alisabzevari](https://github.com/alisabzevari))

### :house: (Internal)

* `opentelemetry-exporter-otlp-http`
  * [#2490](https://github.com/open-telemetry/opentelemetry-js/pull/2490) chore: mark otlp exporters experimental ([@dyladan](https://github.com/dyladan))
  * [#2491](https://github.com/open-telemetry/opentelemetry-js/pull/2491) fix: remove usage of serviceName property in tests for otel collector ([@mustafain117](https://github.com/mustafain117))
* `opentelemetry-sdk-node`
  * [#2473](https://github.com/open-telemetry/opentelemetry-js/pull/2473) chore: move sdk-node to experimental ([@dyladan](https://github.com/dyladan))
  * [#2453](https://github.com/open-telemetry/opentelemetry-js/pull/2453) chore(sdk-node): fix lint warnings ([@alisabzevari](https://github.com/alisabzevari))
* Other
  * [#2469](https://github.com/open-telemetry/opentelemetry-js/pull/2469) Drop website_docs folder ([@chalin](https://github.com/chalin))
  * [#2474](https://github.com/open-telemetry/opentelemetry-js/pull/2474) chore: move missed test file to its package ([@dyladan](https://github.com/dyladan))
  * [#2435](https://github.com/open-telemetry/opentelemetry-js/pull/2435) chore: simplify unit test cache ([@dyladan](https://github.com/dyladan))
* `opentelemetry-context-zone`, `opentelemetry-core`, `opentelemetry-exporter-collector-grpc`, `opentelemetry-exporter-collector-proto`, `opentelemetry-exporter-collector`, `opentelemetry-exporter-prometheus`, `opentelemetry-exporter-zipkin`, `opentelemetry-instrumentation-fetch`, `opentelemetry-instrumentation-grpc`, `opentelemetry-instrumentation-http`, `opentelemetry-instrumentation-xml-http-request`, `opentelemetry-propagator-b3`, `opentelemetry-propagator-jaeger`, `opentelemetry-resources`, `opentelemetry-sdk-metrics-base`, `opentelemetry-sdk-node`, `opentelemetry-sdk-trace-base`, `opentelemetry-sdk-trace-web`
  * [#2462](https://github.com/open-telemetry/opentelemetry-js/pull/2462) chore: split stable and experimental packages into groups using directories ([@dyladan](https://github.com/dyladan))
* `opentelemetry-instrumentation-http`
  * [#2126](https://github.com/open-telemetry/opentelemetry-js/pull/2126) feat(instrumentation-http): add diag debug on http request events ([@Asafb26](https://github.com/Asafb26))
  * [#2455](https://github.com/open-telemetry/opentelemetry-js/pull/2455) chore(instrumentation-http): fix lint warnings ([@alisabzevari](https://github.com/alisabzevari))
* `opentelemetry-instrumentation-fetch`
  * [#2454](https://github.com/open-telemetry/opentelemetry-js/pull/2454) chore(instrumentation-fetch): fix lint warnings ([@alisabzevari](https://github.com/alisabzevari))
* `opentelemetry-exporter-collector`
  * [#2452](https://github.com/open-telemetry/opentelemetry-js/pull/2452) chore(exporter-collector): fix lint warnings ([@alisabzevari](https://github.com/alisabzevari))
* `opentelemetry-sdk-trace-base`, `opentelemetry-sdk-trace-node`
  * [#2446](https://github.com/open-telemetry/opentelemetry-js/pull/2446) chore(sdk-trace): fix lint warnings ([@alisabzevari](https://github.com/alisabzevari))
* `opentelemetry-exporter-prometheus`, `opentelemetry-exporter-zipkin`, `opentelemetry-shim-opentracing`
  * [#2447](https://github.com/open-telemetry/opentelemetry-js/pull/2447) chore(exporter): fix lint warnings ([@alisabzevari](https://github.com/alisabzevari))

### Committers: 18

* Aaron Abbott ([@aabmass](https://github.com/aabmass))
* Ali Sabzevari ([@alisabzevari](https://github.com/alisabzevari))
* Asaf Ben Aharon ([@Asafb26](https://github.com/Asafb26))
* Banothu Ramesh Naik ([@banothurameshnaik](https://github.com/banothurameshnaik))
* Daniel Dyla ([@dyladan](https://github.com/dyladan))
* Gerhard Stöbich ([@Flarna](https://github.com/Flarna))
* Herman ([@hermanbanken](https://github.com/hermanbanken))
* James ([@JamesJHPark](https://github.com/JamesJHPark))
* Jessica Kerr ([@jessitron](https://github.com/jessitron))
* Long Mai ([@longility](https://github.com/longility))
* Mustafain Ali Khan ([@mustafain117](https://github.com/mustafain117))
* Patrice Chalin ([@chalin](https://github.com/chalin))
* Philip Szalla ([@philipszalla](https://github.com/philipszalla))
* Ran Nozik ([@nozik](https://github.com/nozik))
* Rauno Viskus ([@Rauno56](https://github.com/Rauno56))
* Siim Kallas ([@seemk](https://github.com/seemk))
* Weyert de Boer ([@weyert](https://github.com/weyert))
* legendecas ([@legendecas](https://github.com/legendecas))

## 0.25.0

### :boom: Breaking Change

* `opentelemetry-api-metrics`, `opentelemetry-context-zone-peer-dep`, `opentelemetry-context-zone`, `opentelemetry-core`, `opentelemetry-exporter-collector-grpc`, `opentelemetry-exporter-collector-proto`, `opentelemetry-exporter-collector`, `opentelemetry-exporter-jaeger`, `opentelemetry-exporter-prometheus`, `opentelemetry-exporter-zipkin`, `opentelemetry-instrumentation-fetch`, `opentelemetry-instrumentation-grpc`, `opentelemetry-instrumentation-http`, `opentelemetry-instrumentation-xml-http-request`, `opentelemetry-instrumentation`, `opentelemetry-propagator-jaeger`, `opentelemetry-sdk-metrics-base`, `opentelemetry-sdk-node`, `opentelemetry-sdk-trace-base`, `opentelemetry-sdk-trace-node`, `opentelemetry-sdk-trace-web`, `opentelemetry-shim-opentracing`
  * [#2340](https://github.com/open-telemetry/opentelemetry-js/pull/2340) chore: rename sdks to better represent what they are [#2146] ([@vmarchaud](https://github.com/vmarchaud))

### :rocket: (Enhancement)

* `opentelemetry-exporter-collector-grpc`, `opentelemetry-exporter-collector-proto`, `opentelemetry-exporter-collector`, `opentelemetry-exporter-zipkin`
  * [#1775](https://github.com/open-telemetry/opentelemetry-js/pull/1775) fix(@opentelemetry/exporter-collector): remove fulfilled promises cor… ([@aabmass](https://github.com/aabmass))
* `opentelemetry-exporter-collector`
  * [#2336](https://github.com/open-telemetry/opentelemetry-js/pull/2336) feat: use Blob in sendBeacon to add application/json type ([@jufab](https://github.com/jufab))

### :bug: (Bug Fix)

* `opentelemetry-instrumentation-grpc`, `opentelemetry-instrumentation-http`, `opentelemetry-instrumentation-jaeger`, `opentelemetry-exporter-zipkin`, `opentelemetry-sdk-trace-base`
  * [#2499](https://github.com/open-telemetry/opentelemetry-js/pull/2499) fix: 2389- replaced logger unformatted strings with template literals ([@PaurushGarg](https://github.com/PaurushGarg))
* `opentelemetry-instrumentation-fetch`
  * [#2411](https://github.com/open-telemetry/opentelemetry-js/pull/2411) fix(instrumentation-fetch): `fetch(string, Request)` silently drops request body ([@t2t2](https://github.com/t2t2))
* `opentelemetry-sdk-trace-base`
  * [#2396](https://github.com/open-telemetry/opentelemetry-js/pull/2396) fix: respect sampled flag in Span Processors, fix associated tests ([@quickgiant](https://github.com/quickgiant))

### :books: (Refine Doc)

* Other
  * [#2412](https://github.com/open-telemetry/opentelemetry-js/pull/2412) docs: fix examples in website_docs/instrumentation.md ([@svrnm](https://github.com/svrnm))
  * [#2400](https://github.com/open-telemetry/opentelemetry-js/pull/2400) Website docs update 0821 ([@svrnm](https://github.com/svrnm))
* `opentelemetry-resources`, `opentelemetry-semantic-conventions`
  * [#2399](https://github.com/open-telemetry/opentelemetry-js/pull/2399) chore: update doc identifier names in readme ([@lonewolf3739](https://github.com/lonewolf3739))

### :house: (Internal)

* `opentelemetry-core`, `opentelemetry-exporter-collector-grpc`, `opentelemetry-exporter-collector-proto`, `opentelemetry-instrumentation-http`, `opentelemetry-sdk-trace-node`
  * [#2416](https://github.com/open-telemetry/opentelemetry-js/pull/2416) chore: hoist dependencies to speed up ci ([@dyladan](https://github.com/dyladan))
* `opentelemetry-propagator-b3`, `opentelemetry-propagator-jaeger`, `opentelemetry-resources`, `opentelemetry-sdk-metrics-base`
  * [#2406](https://github.com/open-telemetry/opentelemetry-js/pull/2406) chore: Fix lint warnings in propagator-jaeger, propagator-b3, resources, and sdk-metrics-base packages ([@alisabzevari](https://github.com/alisabzevari))
* `opentelemetry-core`
  * [#2405](https://github.com/open-telemetry/opentelemetry-js/pull/2405) chore: Fix lint warnings in core package ([@alisabzevari](https://github.com/alisabzevari))
* `opentelemetry-resource-detector-aws`, `opentelemetry-resource-detector-gcp`, `opentelemetry-sdk-node`
  * [#2392](https://github.com/open-telemetry/opentelemetry-js/pull/2392) refactor: move detectors to opentelemetry-js-contrib repo ([@legendecas](https://github.com/legendecas))
* `opentelemetry-exporter-collector-grpc`, `opentelemetry-exporter-collector-proto`, `opentelemetry-exporter-collector`, `opentelemetry-exporter-jaeger`, `opentelemetry-exporter-zipkin`, `opentelemetry-instrumentation-fetch`, `opentelemetry-instrumentation-grpc`, `opentelemetry-instrumentation-http`, `opentelemetry-instrumentation-xml-http-request`, `opentelemetry-sdk-node`, `opentelemetry-sdk-trace-node`, `opentelemetry-sdk-trace-web`, `opentelemetry-shim-opentracing`
  * [#2402](https://github.com/open-telemetry/opentelemetry-js/pull/2402) chore: sort entries in tsconfig ([@Flarna](https://github.com/Flarna))
* `opentelemetry-api-metrics`, `opentelemetry-context-zone-peer-dep`
  * [#2390](https://github.com/open-telemetry/opentelemetry-js/pull/2390) chore: fix Lint warnings in api-metrics and context-zone-peer-dep ([@alisabzevari](https://github.com/alisabzevari))
* Other
  * [#2397](https://github.com/open-telemetry/opentelemetry-js/pull/2397) chore: change codeowners to point to team ([@dyladan](https://github.com/dyladan))
  * [#2385](https://github.com/open-telemetry/opentelemetry-js/pull/2385) chore: move api into dependencies in integration tests ([@Flarna](https://github.com/Flarna))

### Committers: 11

* Aaron Abbott ([@aabmass](https://github.com/aabmass))
* Ali Sabzevari ([@alisabzevari](https://github.com/alisabzevari))
* Clark Jacobsohn ([@quickgiant](https://github.com/quickgiant))
* Daniel Dyla ([@dyladan](https://github.com/dyladan))
* Gerhard Stöbich ([@Flarna](https://github.com/Flarna))
* Julien Fabre ([@jufab](https://github.com/jufab))
* Severin Neumann ([@svrnm](https://github.com/svrnm))
* Srikanth Chekuri ([@lonewolf3739](https://github.com/lonewolf3739))
* Valentin Marchaud ([@vmarchaud](https://github.com/vmarchaud))
* legendecas ([@legendecas](https://github.com/legendecas))
* t2t2 ([@t2t2](https://github.com/t2t2))

## 0.24.0

### :boom: Breaking Change

* `opentelemetry-core`, `opentelemetry-exporter-jaeger`, `opentelemetry-exporter-zipkin`, `opentelemetry-node`, `opentelemetry-resource-detector-aws`, `opentelemetry-resource-detector-gcp`, `opentelemetry-resources`, `opentelemetry-semantic-conventions`, `opentelemetry-web`
  * [#2345](https://github.com/open-telemetry/opentelemetry-js/pull/2345) feat: updated spec to v1.5.0 and renamed resource class ([@weyert](https://github.com/weyert))

### :rocket: (Enhancement)

* `opentelemetry-exporter-collector-proto`, `opentelemetry-exporter-collector`
  * [#2337](https://github.com/open-telemetry/opentelemetry-js/pull/2337) Support gzip compression for node exporter collector ([@alisabzevari](https://github.com/alisabzevari))
* `opentelemetry-instrumentation-http`
  * [#2332](https://github.com/open-telemetry/opentelemetry-js/pull/2332) feat(@opentelemetry-instrumentation-http): support adding custom attributes before a span is started ([@echoontheway](https://github.com/echoontheway))
  * [#2349](https://github.com/open-telemetry/opentelemetry-js/pull/2349) fix(instrumentation-http): set outgoing request attributes on start span ([@blumamir](https://github.com/blumamir))
* `opentelemetry-web`
  * [#2343](https://github.com/open-telemetry/opentelemetry-js/pull/2343) feat(opentelemetry-web): capture decodedBodySize / http.response_content_length_uncompressed ([@t2t2](https://github.com/t2t2))
* `opentelemetry-instrumentation`
  * [#2309](https://github.com/open-telemetry/opentelemetry-js/pull/2309) chore: add includePrerelease option to instrumentation config ([@dyladan](https://github.com/dyladan))

### :bug: (Bug Fix)

* `opentelemetry-exporter-collector`
  * [#2357](https://github.com/open-telemetry/opentelemetry-js/pull/2357) fix: headers are appended to existing one (open-telemetry#2335) ([@niko-achilles](https://github.com/niko-achilles))
* `opentelemetry-exporter-collector-grpc`
  * [#2322](https://github.com/open-telemetry/opentelemetry-js/pull/2322) fix(@opentelemetry/exporter-collector-grpc) regression from #2130 when host specified without protocol ([@lizthegrey](https://github.com/lizthegrey))
* `opentelemetry-exporter-collector-proto`
  * [#2331](https://github.com/open-telemetry/opentelemetry-js/pull/2331) Change default HTTP exporter port to 55681 ([@NathanielRN](https://github.com/NathanielRN))

### :books: (Refine Doc)

* Other
  * [#2344](https://github.com/open-telemetry/opentelemetry-js/pull/2344) Additional website docs updates ([@svrnm](https://github.com/svrnm))
  * [#2365](https://github.com/open-telemetry/opentelemetry-js/pull/2365) docs: add quickstart code example ([@vreynolds](https://github.com/vreynolds))
  * [#2358](https://github.com/open-telemetry/opentelemetry-js/pull/2358) examples opentelemetry-api version fix ([@CptSchnitz](https://github.com/CptSchnitz))
  * [#2308](https://github.com/open-telemetry/opentelemetry-js/pull/2308) chore: use typedoc to build sdk reference ([@dyladan](https://github.com/dyladan))
  * [#2324](https://github.com/open-telemetry/opentelemetry-js/pull/2324) fix: update and make website docs work ([@svrnm](https://github.com/svrnm))
  * [#2328](https://github.com/open-telemetry/opentelemetry-js/pull/2328) chore: updating compatibility matrix ([@obecny](https://github.com/obecny))
  * [#2326](https://github.com/open-telemetry/opentelemetry-js/pull/2326) chore: fix tracer-web example webpack config ([@jonchurch](https://github.com/jonchurch))
* `opentelemetry-resource-detector-aws`
  * [#2379](https://github.com/open-telemetry/opentelemetry-js/pull/2379) fix: fixup aws detector readme ([@legendecas](https://github.com/legendecas))
* `opentelemetry-propagator-b3`
  * [#2342](https://github.com/open-telemetry/opentelemetry-js/pull/2342) docs: updates README.md for @opentelemetry/propagator-b3 ([@OmkarKirpan](https://github.com/OmkarKirpan))
* `opentelemetry-exporter-collector-grpc`
  * [#2266](https://github.com/open-telemetry/opentelemetry-js/pull/2266) fix(exporter-collector-grpc): incorrect URL format on docs after 0.20.0 update ([@brunoluiz](https://github.com/brunoluiz))

### :house: (Internal)

* Other
  * [#2366](https://github.com/open-telemetry/opentelemetry-js/pull/2366) chore: adding Rauno56 to js approvers ([@obecny](https://github.com/obecny))
  * [#2350](https://github.com/open-telemetry/opentelemetry-js/pull/2350) chore: ignore backcompat in renovate ([@dyladan](https://github.com/dyladan))
  * [#2352](https://github.com/open-telemetry/opentelemetry-js/pull/2352) replaced word plugin with instrumentation ([@niko-achilles](https://github.com/niko-achilles))
  * [#2311](https://github.com/open-telemetry/opentelemetry-js/pull/2311) chore: ignore @types/node in backcompat ([@dyladan](https://github.com/dyladan))
* `opentelemetry-exporter-collector-grpc`, `opentelemetry-exporter-jaeger`, `opentelemetry-instrumentation`, `opentelemetry-node`, `opentelemetry-sdk-node`, `opentelemetry-shim-opentracing`, `opentelemetry-tracing`, `opentelemetry-web`
  * [#2351](https://github.com/open-telemetry/opentelemetry-js/pull/2351) style: use single quotes everywhere and add a rule to eslint ([@blumamir](https://github.com/blumamir))
* `template`
  * [#2319](https://github.com/open-telemetry/opentelemetry-js/pull/2319) chore: update package template engines version ([@jonchurch](https://github.com/jonchurch))

### Committers: 18

* (Eliseo) Nathaniel Ruiz Nowell ([@NathanielRN](https://github.com/NathanielRN))
* Ali Sabzevari ([@alisabzevari](https://github.com/alisabzevari))
* Amir Blum ([@blumamir](https://github.com/blumamir))
* Bartlomiej Obecny ([@obecny](https://github.com/obecny))
* Bruno Luiz Silva ([@brunoluiz](https://github.com/brunoluiz))
* Daniel Dyla ([@dyladan](https://github.com/dyladan))
* Gerhard Stöbich ([@Flarna](https://github.com/Flarna))
* Jonathan Church ([@jonchurch](https://github.com/jonchurch))
* Liz Fong-Jones ([@lizthegrey](https://github.com/lizthegrey))
* Niko Achilles Kokkinos ([@niko-achilles](https://github.com/niko-achilles))
* Ofer Adelstein ([@CptSchnitz](https://github.com/CptSchnitz))
* Omkar Kirpan ([@OmkarKirpan](https://github.com/OmkarKirpan))
* Severin Neumann ([@svrnm](https://github.com/svrnm))
* Vera Reynolds ([@vreynolds](https://github.com/vreynolds))
* Weyert de Boer ([@weyert](https://github.com/weyert))
* [@echoontheway](https://github.com/echoontheway)
* legendecas ([@legendecas](https://github.com/legendecas))
* t2t2 ([@t2t2](https://github.com/t2t2))

## 0.23.0

### :rocket: (Enhancement)

* `opentelemetry-shim-opentracing`
  * [#2282](https://github.com/open-telemetry/opentelemetry-js/pull/2282) feat(shim-opentracing): update logging based on new spec ([@vreynolds](https://github.com/vreynolds))
* `opentelemetry-exporter-collector-grpc`
  * [#2304](https://github.com/open-telemetry/opentelemetry-js/pull/2304) feat: otlp-grpc exporter uses headers environment variables ([@vreynolds](https://github.com/vreynolds))
* `opentelemetry-propagator-b3`
  * [#2285](https://github.com/open-telemetry/opentelemetry-js/pull/2285) fix(propagator-b3): update extract to check for array ([@jordanworner](https://github.com/jordanworner))
* `opentelemetry-core`, `opentelemetry-instrumentation-fetch`, `opentelemetry-instrumentation-xml-http-request`, `opentelemetry-web`
  * [#2226](https://github.com/open-telemetry/opentelemetry-js/pull/2226) fix(xhr): make performance observer work with relative urls ([@mhennoch](https://github.com/mhennoch))

### :books: (Refine Doc)

* Other
  * [#2306](https://github.com/open-telemetry/opentelemetry-js/pull/2306) chore: update the website getting started docs ([@dyladan](https://github.com/dyladan))
  * [#2283](https://github.com/open-telemetry/opentelemetry-js/pull/2283) Module opentelemetry/instrumentation-grpc required ([@pramodsreek](https://github.com/pramodsreek))
* `opentelemetry-sdk-node`
  * [#2300](https://github.com/open-telemetry/opentelemetry-js/pull/2300) chore(README): update link to BatchSpanProcessor in sdk node ([@pragmaticivan](https://github.com/pragmaticivan))
* `opentelemetry-exporter-jaeger`, `opentelemetry-exporter-zipkin`, `opentelemetry-sdk-node`
  * [#2290](https://github.com/open-telemetry/opentelemetry-js/pull/2290) fix: service.name resource attribute ([@OmkarKirpan](https://github.com/OmkarKirpan))
* `opentelemetry-resources`
  * [#2289](https://github.com/open-telemetry/opentelemetry-js/pull/2289) docs(opentelemetry-resources): fix wrong sample code in readme ([@alisabzevari](https://github.com/alisabzevari))

### :house: (Internal)

* `opentelemetry-context-async-hooks`, `opentelemetry-context-zone-peer-dep`, `opentelemetry-web`
  * [#2247](https://github.com/open-telemetry/opentelemetry-js/pull/2247) feat: unify the signatures of bind and with ([@Rauno56](https://github.com/Rauno56))
* Other
  * [#2296](https://github.com/open-telemetry/opentelemetry-js/pull/2296) chore: do not upgrade backwards compatibility ([@dyladan](https://github.com/dyladan))
  * [#2302](https://github.com/open-telemetry/opentelemetry-js/pull/2302) chore: use setup-node ([@dyladan](https://github.com/dyladan))

### Committers: 9

* Ali Sabzevari ([@alisabzevari](https://github.com/alisabzevari))
* Daniel Dyla ([@dyladan](https://github.com/dyladan))
* Ivan Santos ([@pragmaticivan](https://github.com/pragmaticivan))
* Jordan Worner ([@jordanworner](https://github.com/jordanworner))
* MartenH ([@mhennoch](https://github.com/mhennoch))
* Omkar Kirpan ([@OmkarKirpan](https://github.com/OmkarKirpan))
* Pramod ([@pramodsreek](https://github.com/pramodsreek))
* Rauno Viskus ([@Rauno56](https://github.com/Rauno56))
* Vera Reynolds ([@vreynolds](https://github.com/vreynolds))

## 0.22.0

### :rocket: (Enhancement)

* `opentelemetry-tracing`
  * [#2243](https://github.com/open-telemetry/opentelemetry-js/pull/2243) feat(tracing): auto flush BatchSpanProcessor on browser ([@kkruk-sumo](https://github.com/kkruk-sumo))
* `opentelemetry-resource-detector-aws`, `opentelemetry-semantic-conventions`
  * [#2268](https://github.com/open-telemetry/opentelemetry-js/pull/2268) feat(semantic-conventions): upgrade semantic conventions to version 1… ([@weyert](https://github.com/weyert))
* `opentelemetry-api-metrics`, `opentelemetry-context-async-hooks`, `opentelemetry-context-zone-peer-dep`, `opentelemetry-core`, `opentelemetry-exporter-collector-grpc`, `opentelemetry-exporter-collector-proto`, `opentelemetry-exporter-collector`, `opentelemetry-exporter-jaeger`, `opentelemetry-exporter-prometheus`, `opentelemetry-exporter-zipkin`, `opentelemetry-instrumentation-fetch`, `opentelemetry-instrumentation-grpc`, `opentelemetry-instrumentation-http`, `opentelemetry-instrumentation-xml-http-request`, `opentelemetry-instrumentation`, `opentelemetry-metrics`, `opentelemetry-node`, `opentelemetry-propagator-b3`, `opentelemetry-propagator-jaeger`, `opentelemetry-resource-detector-aws`, `opentelemetry-resource-detector-gcp`, `opentelemetry-resources`, `opentelemetry-sdk-node`, `opentelemetry-shim-opentracing`, `opentelemetry-tracing`, `opentelemetry-web`
  * [#2276](https://github.com/open-telemetry/opentelemetry-js/pull/2276) chore(deps): update dependency @opentelemetry/api to v1 ([@renovate-bot](https://github.com/renovate-bot))

### :books: (Refine Doc)

* [#2287](https://github.com/open-telemetry/opentelemetry-js/pull/2287) chore(doc): update compatibility matrix ([@vmarchaud](https://github.com/vmarchaud))

### Committers: 3

* Krystian Kruk ([@kkruk-sumo](https://github.com/kkruk-sumo))
* Valentin Marchaud ([@vmarchaud](https://github.com/vmarchaud))
* Weyert de Boer ([@weyert](https://github.com/weyert))

## 0.21.0

### :rocket: (Enhancement)

* `opentelemetry-instrumentation-fetch`, `opentelemetry-instrumentation-grpc`, `opentelemetry-instrumentation-http`, `opentelemetry-instrumentation-xml-http-request`, `opentelemetry-instrumentation`
  * [#2261](https://github.com/open-telemetry/opentelemetry-js/pull/2261) Adding ComponentLogger into instrumentations ([@obecny](https://github.com/obecny))
* `opentelemetry-api-metrics`, `opentelemetry-context-async-hooks`, `opentelemetry-context-zone-peer-dep`, `opentelemetry-core`, `opentelemetry-exporter-collector-grpc`, `opentelemetry-exporter-collector-proto`, `opentelemetry-exporter-collector`, `opentelemetry-exporter-jaeger`, `opentelemetry-exporter-prometheus`, `opentelemetry-exporter-zipkin`, `opentelemetry-instrumentation-fetch`, `opentelemetry-instrumentation-grpc`, `opentelemetry-instrumentation-http`, `opentelemetry-instrumentation-xml-http-request`, `opentelemetry-instrumentation`, `opentelemetry-metrics`, `opentelemetry-node`, `opentelemetry-propagator-b3`, `opentelemetry-propagator-jaeger`, `opentelemetry-resource-detector-aws`, `opentelemetry-resource-detector-gcp`, `opentelemetry-resources`, `opentelemetry-sdk-node`, `opentelemetry-shim-opentracing`, `opentelemetry-tracing`, `opentelemetry-web`
  * [#2255](https://github.com/open-telemetry/opentelemetry-js/pull/2255) chore: update API to 0.21.0 ([@dyladan](https://github.com/dyladan))

### :books: (Refine Doc)

* [#2263](https://github.com/open-telemetry/opentelemetry-js/pull/2263) docs(README): update link to @opentelemetry/api package ([@nvenegas](https://github.com/nvenegas))
* [#2254](https://github.com/open-telemetry/opentelemetry-js/pull/2254) chore: update compatibility matrix ([@dyladan](https://github.com/dyladan))
* [#2253](https://github.com/open-telemetry/opentelemetry-js/pull/2253) chore: add missing changelog entry ([@dyladan](https://github.com/dyladan))

### :house: (Internal)

* `opentelemetry-api-metrics`, `opentelemetry-context-async-hooks`, `opentelemetry-context-zone-peer-dep`, `opentelemetry-context-zone`, `opentelemetry-core`, `opentelemetry-exporter-collector-grpc`, `opentelemetry-exporter-collector-proto`, `opentelemetry-exporter-collector`, `opentelemetry-exporter-jaeger`, `opentelemetry-exporter-prometheus`, `opentelemetry-exporter-zipkin`, `opentelemetry-instrumentation-fetch`, `opentelemetry-instrumentation-grpc`, `opentelemetry-instrumentation-http`, `opentelemetry-instrumentation-xml-http-request`, `opentelemetry-instrumentation`, `opentelemetry-metrics`, `opentelemetry-node`, `opentelemetry-propagator-b3`, `opentelemetry-propagator-jaeger`, `opentelemetry-resource-detector-aws`, `opentelemetry-resource-detector-gcp`, `opentelemetry-resources`, `opentelemetry-sdk-node`, `opentelemetry-semantic-conventions`, `opentelemetry-shim-opentracing`, `opentelemetry-tracing`, `opentelemetry-web`, `template`
  * [#2244](https://github.com/open-telemetry/opentelemetry-js/pull/2244) chore: add node:16 to the test matrix ([@Rauno56](https://github.com/Rauno56))

### Committers: 4

* Bartlomiej Obecny ([@obecny](https://github.com/obecny))
* Daniel Dyla ([@dyladan](https://github.com/dyladan))
* Nicolas Venegas ([@nvenegas](https://github.com/nvenegas))
* Rauno Viskus ([@Rauno56](https://github.com/Rauno56))

## 0.20.0

### :boom: Breaking Change

* `opentelemetry-sdk-node`, `opentelemetry-tracing`
  * [#2190](https://github.com/open-telemetry/opentelemetry-js/pull/2190) feat: apply spec changes for `TraceParams` ([@weyert](https://github.com/weyert))
* `opentelemetry-node`, `opentelemetry-propagator-jaeger`, `opentelemetry-shim-opentracing`
  * [#2148](https://github.com/open-telemetry/opentelemetry-js/pull/2148) chore: renaming jaeger http trace propagator to jaeger propagator ([@obecny](https://github.com/obecny))
* `opentelemetry-core`, `opentelemetry-instrumentation-grpc`, `opentelemetry-shim-opentracing`, `opentelemetry-tracing`
  * [#2149](https://github.com/open-telemetry/opentelemetry-js/pull/2149) chore: adding sufix propagator to http baggage and http trace context ([@obecny](https://github.com/obecny))

### :rocket: (Enhancement)

* `opentelemetry-shim-opentracing`
  * [#2194](https://github.com/open-telemetry/opentelemetry-js/pull/2194) feat(shim-opentracing): update setTag based on new spec ([@vreynolds](https://github.com/vreynolds))
* `opentelemetry-tracing`
  * [#2221](https://github.com/open-telemetry/opentelemetry-js/pull/2221) feat: add startActiveSpan method to Tracer ([@naseemkullah](https://github.com/naseemkullah))
* `opentelemetry-core`, `opentelemetry-exporter-collector-grpc`, `opentelemetry-exporter-collector-proto`, `opentelemetry-exporter-collector`, `opentelemetry-exporter-jaeger`, `opentelemetry-exporter-zipkin`, `opentelemetry-metrics`, `opentelemetry-resources`, `opentelemetry-sdk-node`, `opentelemetry-tracing`
  * [#2227](https://github.com/open-telemetry/opentelemetry-js/pull/2227) chore: set default service name ([@dyladan](https://github.com/dyladan))
* `opentelemetry-api-metrics`, `opentelemetry-context-async-hooks`, `opentelemetry-context-zone-peer-dep`, `opentelemetry-context-zone`, `opentelemetry-core`, `opentelemetry-exporter-collector-grpc`, `opentelemetry-exporter-collector-proto`, `opentelemetry-exporter-collector`, `opentelemetry-exporter-jaeger`, `opentelemetry-exporter-prometheus`, `opentelemetry-exporter-zipkin`, `opentelemetry-instrumentation-fetch`, `opentelemetry-instrumentation-grpc`, `opentelemetry-instrumentation-http`, `opentelemetry-instrumentation-xml-http-request`, `opentelemetry-instrumentation`, `opentelemetry-metrics`, `opentelemetry-node`, `opentelemetry-propagator-b3`, `opentelemetry-propagator-jaeger`, `opentelemetry-resource-detector-aws`, `opentelemetry-resource-detector-gcp`, `opentelemetry-resources`, `opentelemetry-sdk-node`, `opentelemetry-shim-opentracing`, `opentelemetry-tracing`, `opentelemetry-web`
  * [#2225](https://github.com/open-telemetry/opentelemetry-js/pull/2225) chore: upgrading to api ver. 0.20.0 ([@obecny](https://github.com/obecny))
* `opentelemetry-instrumentation`
  * [#2224](https://github.com/open-telemetry/opentelemetry-js/pull/2224) feat(opentelemetry-instrumentation): getConfig and setConfig ([@mottibec](https://github.com/mottibec))
* `opentelemetry-core`, `opentelemetry-instrumentation-http`, `opentelemetry-propagator-b3`, `opentelemetry-propagator-jaeger`, `opentelemetry-tracing`
  * [#2202](https://github.com/open-telemetry/opentelemetry-js/pull/2202) Move suppress tracing context key to SDK ([@dyladan](https://github.com/dyladan))
* `opentelemetry-core`, `opentelemetry-tracing`
  * [#2100](https://github.com/open-telemetry/opentelemetry-js/pull/2100) feat(tracing): allow to configure exporter by environment #1676 ([@vmarchaud](https://github.com/vmarchaud))
* `opentelemetry-core`, `opentelemetry-exporter-collector-grpc`, `opentelemetry-exporter-collector-proto`, `opentelemetry-exporter-collector`
  * [#2117](https://github.com/open-telemetry/opentelemetry-js/pull/2117) feat(exporter-collector): support config from env #2099 ([@vmarchaud](https://github.com/vmarchaud))
* `opentelemetry-exporter-collector`, `opentelemetry-exporter-zipkin`, `opentelemetry-tracing`
  * [#2183](https://github.com/open-telemetry/opentelemetry-js/pull/2183) chore: removing usage of timed event from api ([@obecny](https://github.com/obecny))
* Other
  * [#2195](https://github.com/open-telemetry/opentelemetry-js/pull/2195) fix: remove redundant try-catch from http/https server examples ([@legendecas](https://github.com/legendecas))
* `opentelemetry-exporter-collector-grpc`
  * [#2130](https://github.com/open-telemetry/opentelemetry-js/pull/2130) chore: url validation & README to prevent gRPC footguns. ([@lizthegrey](https://github.com/lizthegrey))
* `opentelemetry-semantic-conventions`
  * [#2167](https://github.com/open-telemetry/opentelemetry-js/pull/2167) semantic-conventions: include built esm files in package ([@t2t2](https://github.com/t2t2))
* `opentelemetry-instrumentation-xml-http-request`
  * [#2134](https://github.com/open-telemetry/opentelemetry-js/pull/2134) feat(instrumentation-xhr): add applyCustomAttributesOnSpan hook ([@mhennoch](https://github.com/mhennoch))
* `opentelemetry-exporter-prometheus`
  * [#2122](https://github.com/open-telemetry/opentelemetry-js/pull/2122) feat: add diag warning when metric name is invalid ([@weyert](https://github.com/weyert))
* `opentelemetry-api-metrics`, `opentelemetry-exporter-collector-grpc`, `opentelemetry-exporter-collector-proto`, `opentelemetry-exporter-collector`, `opentelemetry-metrics`
  * [#2118](https://github.com/open-telemetry/opentelemetry-js/pull/2118) chore(deps): support cumulative, delta, and pass-through exporters ([@sergeylanzman](https://github.com/sergeylanzman))

### :bug: (Bug Fix)

* `opentelemetry-exporter-collector-grpc`
  * [#2214](https://github.com/open-telemetry/opentelemetry-js/pull/2214) chore: fixes after last changes to url ([@obecny](https://github.com/obecny))
* `opentelemetry-tracing`
  * [#2185](https://github.com/open-telemetry/opentelemetry-js/pull/2185) fix: use invalid parent for sampler when options.root ([@dyladan](https://github.com/dyladan))
  * [#2171](https://github.com/open-telemetry/opentelemetry-js/pull/2171) fix: move initialization of const above first use #2170 ([@dyladan](https://github.com/dyladan))
* `opentelemetry-instrumentation-grpc`
  * [#2179](https://github.com/open-telemetry/opentelemetry-js/pull/2179) chore(grpc-instrumentation): fix grpc example #2160 ([@vmarchaud](https://github.com/vmarchaud))
* `opentelemetry-core`
  * [#2165](https://github.com/open-telemetry/opentelemetry-js/pull/2165) [sampler] treat invalid SpanContext as no SpanContext ([@thisthat](https://github.com/thisthat))

### :books: (Refine Doc)

* `opentelemetry-node`
  * [#2180](https://github.com/open-telemetry/opentelemetry-js/pull/2180) fix docs typo ([@sbrichardson](https://github.com/sbrichardson))
* Other
  * [#2168](https://github.com/open-telemetry/opentelemetry-js/pull/2168) chore: update feature status in readme ([@dyladan](https://github.com/dyladan))
* `opentelemetry-instrumentation-fetch`, `opentelemetry-instrumentation-grpc`, `opentelemetry-instrumentation-http`, `opentelemetry-instrumentation-xml-http-request`, `opentelemetry-instrumentation`, `opentelemetry-node`, `opentelemetry-sdk-node`, `opentelemetry-web`
  * [#2127](https://github.com/open-telemetry/opentelemetry-js/pull/2127) chore: prefer use of global TracerProvider/MeterProvider ([@Flarna](https://github.com/Flarna))

### :house: (Internal)

* `opentelemetry-api-metrics`, `opentelemetry-context-async-hooks`, `opentelemetry-context-zone-peer-dep`, `opentelemetry-context-zone`, `opentelemetry-core`, `opentelemetry-exporter-collector-grpc`, `opentelemetry-exporter-collector-proto`, `opentelemetry-exporter-collector`, `opentelemetry-exporter-jaeger`, `opentelemetry-exporter-prometheus`, `opentelemetry-exporter-zipkin`, `opentelemetry-instrumentation-fetch`, `opentelemetry-instrumentation-grpc`, `opentelemetry-instrumentation-http`, `opentelemetry-instrumentation-xml-http-request`, `opentelemetry-instrumentation`, `opentelemetry-metrics`, `opentelemetry-node`, `opentelemetry-propagator-b3`, `opentelemetry-propagator-jaeger`, `opentelemetry-resource-detector-aws`, `opentelemetry-resource-detector-gcp`, `opentelemetry-resources`, `opentelemetry-sdk-node`, `opentelemetry-semantic-conventions`, `opentelemetry-shim-opentracing`, `opentelemetry-tracing`, `opentelemetry-web`, `template`
  * [#2241](https://github.com/open-telemetry/opentelemetry-js/pull/2241) chore: update typescript to 4.3 and enable noImplicitOverride ([@Flarna](https://github.com/Flarna))
  * [#2204](https://github.com/open-telemetry/opentelemetry-js/pull/2204) Remove GTS and prettier ([@dyladan](https://github.com/dyladan))
* `opentelemetry-instrumentation-http`, `opentelemetry-instrumentation`, `opentelemetry-tracing`
  * [#2229](https://github.com/open-telemetry/opentelemetry-js/pull/2229) chore: remove references to NOOP singletons ([@dyladan](https://github.com/dyladan))
* `opentelemetry-node`, `opentelemetry-sdk-node`, `opentelemetry-web`
  * [#2230](https://github.com/open-telemetry/opentelemetry-js/pull/2230) chore: remove references to Noop classes from API ([@dyladan](https://github.com/dyladan))
* `opentelemetry-api-metrics`, `opentelemetry-context-zone-peer-dep`, `opentelemetry-context-zone`, `opentelemetry-core`, `opentelemetry-exporter-collector`, `opentelemetry-exporter-zipkin`, `opentelemetry-instrumentation-fetch`, `opentelemetry-instrumentation-xml-http-request`, `opentelemetry-instrumentation`, `opentelemetry-propagator-jaeger`, `opentelemetry-tracing`, `opentelemetry-web`
  * [#2234](https://github.com/open-telemetry/opentelemetry-js/pull/2234) chore: downgrade karma-webpack ([@dyladan](https://github.com/dyladan))
* `opentelemetry-sdk-node`
  * [#2219](https://github.com/open-telemetry/opentelemetry-js/pull/2219) fix(opentelemetry-sdk-node): move nock to dev dependencies ([@nflaig](https://github.com/nflaig))
* `opentelemetry-core`
  * [#2155](https://github.com/open-telemetry/opentelemetry-js/pull/2155) chore: move tracecontext propagator into trace ([@dyladan](https://github.com/dyladan))
* `opentelemetry-api-metrics`, `opentelemetry-context-zone-peer-dep`, `opentelemetry-context-zone`, `opentelemetry-core`, `opentelemetry-exporter-collector`, `opentelemetry-exporter-zipkin`, `opentelemetry-instrumentation-fetch`, `opentelemetry-instrumentation-xml-http-request`, `opentelemetry-instrumentation`, `opentelemetry-metrics`, `opentelemetry-propagator-b3`, `opentelemetry-propagator-jaeger`, `opentelemetry-resources`, `opentelemetry-semantic-conventions`, `opentelemetry-tracing`, `opentelemetry-web`, `template`
  * [#2112](https://github.com/open-telemetry/opentelemetry-js/pull/2112) feat: add ESM builds for packages used in browser ([@t2t2](https://github.com/t2t2))

### Committers: 18

* Bartlomiej Obecny ([@obecny](https://github.com/obecny))
* Daniel Dyla ([@dyladan](https://github.com/dyladan))
* Gerhard Stöbich ([@Flarna](https://github.com/Flarna))
* Giovanni Liva ([@thisthat](https://github.com/thisthat))
* Liz Fong-Jones ([@lizthegrey](https://github.com/lizthegrey))
* MartenH ([@mhennoch](https://github.com/mhennoch))
* Motti Bechhofer ([@mottibec](https://github.com/mottibec))
* Naseem ([@naseemkullah](https://github.com/naseemkullah))
* Nico Flaig ([@nflaig](https://github.com/nflaig))
* Sergey Lanzman ([@sergeylanzman](https://github.com/sergeylanzman))
* Severin Neumann ([@svrnm](https://github.com/svrnm))
* Stephen Richardson  ([@sbrichardson](https://github.com/sbrichardson))
* Valentin Marchaud ([@vmarchaud](https://github.com/vmarchaud))
* Vera Reynolds ([@vreynolds](https://github.com/vreynolds))
* Weyert de Boer ([@weyert](https://github.com/weyert))
* andrew quartey ([@drexler](https://github.com/drexler))
* legendecas ([@legendecas](https://github.com/legendecas))
* t2t2 ([@t2t2](https://github.com/t2t2))

## 0.19.0

### :boom: Breaking Change

* `opentelemetry-core`, `opentelemetry-tracing`
  * [#2111](https://github.com/open-telemetry/opentelemetry-js/pull/2111) feat: handle OTEL_TRACES_SAMPLER env var ([@jtmalinowski](https://github.com/jtmalinowski))
  * [#2098](https://github.com/open-telemetry/opentelemetry-js/pull/2098) chore(env): update default value for span's attributes/links/events count #1675 ([@vmarchaud](https://github.com/vmarchaud))
* `opentelemetry-instrumentation-fetch`, `opentelemetry-instrumentation-grpc`, `opentelemetry-instrumentation-http`, `opentelemetry-instrumentation-xml-http-request`, `opentelemetry-semantic-conventions`, `opentelemetry-tracing`, `opentelemetry-web`
  * [#2083](https://github.com/open-telemetry/opentelemetry-js/pull/2083) feat: add semconv generator for `semantic-conventions`-package ([@weyert](https://github.com/weyert))
* `opentelemetry-core`, `opentelemetry-grpc-utils`, `opentelemetry-instrumentation-fetch`, `opentelemetry-instrumentation-grpc`, `opentelemetry-instrumentation-http`, `opentelemetry-instrumentation-xml-http-request`, `opentelemetry-instrumentation`, `opentelemetry-node`, `opentelemetry-plugin-grpc-js`, `opentelemetry-plugin-grpc`, `opentelemetry-plugin-http`, `opentelemetry-plugin-https`, `opentelemetry-sdk-node`, `opentelemetry-web`
  * [#2081](https://github.com/open-telemetry/opentelemetry-js/pull/2081) remove plugins ([@obecny](https://github.com/obecny))
* `opentelemetry-api-metrics`, `opentelemetry-context-async-hooks`, `opentelemetry-context-zone-peer-dep`, `opentelemetry-core`, `opentelemetry-exporter-collector-grpc`, `opentelemetry-exporter-collector-proto`, `opentelemetry-exporter-collector`, `opentelemetry-exporter-jaeger`, `opentelemetry-exporter-prometheus`, `opentelemetry-exporter-zipkin`, `opentelemetry-grpc-utils`, `opentelemetry-instrumentation-fetch`, `opentelemetry-instrumentation-grpc`, `opentelemetry-instrumentation-http`, `opentelemetry-instrumentation-xml-http-request`, `opentelemetry-instrumentation`, `opentelemetry-metrics`, `opentelemetry-node`, `opentelemetry-plugin-grpc-js`, `opentelemetry-plugin-grpc`, `opentelemetry-plugin-http`, `opentelemetry-plugin-https`, `opentelemetry-propagator-b3`, `opentelemetry-propagator-jaeger`, `opentelemetry-resource-detector-aws`, `opentelemetry-resource-detector-gcp`, `opentelemetry-resources`, `opentelemetry-sdk-node`, `opentelemetry-shim-opentracing`, `opentelemetry-tracing`, `opentelemetry-web`
  * [#2074](https://github.com/open-telemetry/opentelemetry-js/pull/2074) chore: peer depend on API ([@dyladan](https://github.com/dyladan))
  * [#2063](https://github.com/open-telemetry/opentelemetry-js/pull/2063) chore: update API dependency to 1.0.0-rc.0 ([@dyladan](https://github.com/dyladan))
* `opentelemetry-core`, `opentelemetry-propagator-b3`
  * [#2054](https://github.com/open-telemetry/opentelemetry-js/pull/2054) refactor: simplify b3 options ([@mwear](https://github.com/mwear))

### :rocket: (Enhancement)

* `opentelemetry-instrumentation`
  * [#2135](https://github.com/open-telemetry/opentelemetry-js/pull/2135) fix: add isEnabled to InstrumentationBase ([@seemk](https://github.com/seemk))
* `opentelemetry-semantic-conventions`
  * [#2115](https://github.com/open-telemetry/opentelemetry-js/pull/2115) feat: upgrade semantic conventions to v1.2.0 of spec ([@weyert](https://github.com/weyert))
* `opentelemetry-core`, `opentelemetry-exporter-zipkin`
  * [#2097](https://github.com/open-telemetry/opentelemetry-js/pull/2097) feat(zipkin): allow to configure url via environment #1675 ([@vmarchaud](https://github.com/vmarchaud))
* `opentelemetry-exporter-zipkin`
  * [#2050](https://github.com/open-telemetry/opentelemetry-js/pull/2050) chore: adding interceptor for getting headers before each request ([@obecny](https://github.com/obecny))
* `opentelemetry-exporter-collector-grpc`
  * [#2092](https://github.com/open-telemetry/opentelemetry-js/pull/2092) Migrate exporter-collector-grpc to grpc-js ([@obecny](https://github.com/obecny))
* `opentelemetry-instrumentation-http`
  * [#2043](https://github.com/open-telemetry/opentelemetry-js/pull/2043) chore: avoid unneeded context.with in http instrumentation ([@Flarna](https://github.com/Flarna))
* `opentelemetry-instrumentation-fetch`, `opentelemetry-instrumentation-xml-http-request`
  * [#2061](https://github.com/open-telemetry/opentelemetry-js/pull/2061) chore: adding info to debug whenever headers are being skipped due to cors policy ([@obecny](https://github.com/obecny))

### :bug: (Bug Fix)

* `opentelemetry-exporter-prometheus`
  * [#2121](https://github.com/open-telemetry/opentelemetry-js/pull/2121) fix: ensure the label names are sanitised ([@weyert](https://github.com/weyert))
* `opentelemetry-instrumentation`
  * [#2120](https://github.com/open-telemetry/opentelemetry-js/pull/2120) fix(instrumentation): support multiple module definitions with different versions ([@seemk](https://github.com/seemk))
* `opentelemetry-instrumentation-http`, `opentelemetry-tracing`
  * [#2105](https://github.com/open-telemetry/opentelemetry-js/pull/2105) fix: don't use spanId from invalid parent ([@Flarna](https://github.com/Flarna))
* `opentelemetry-context-async-hooks`
  * [#2088](https://github.com/open-telemetry/opentelemetry-js/pull/2088) fix: correct removeAllListeners in case no event is passed ([@Flarna](https://github.com/Flarna))
* `opentelemetry-resource-detector-aws`
  * [#2076](https://github.com/open-telemetry/opentelemetry-js/pull/2076) fix: await http response in AWS EKS detector ([@vreynolds](https://github.com/vreynolds))
* `opentelemetry-core`, `opentelemetry-propagator-b3`, `opentelemetry-propagator-jaeger`
  * [#2082](https://github.com/open-telemetry/opentelemetry-js/pull/2082) chore: do not inject span context when instrumentation is suppressed ([@dyladan](https://github.com/dyladan))
* `opentelemetry-core`
  * [#2080](https://github.com/open-telemetry/opentelemetry-js/pull/2080) fix: do not inject invalid span context ([@dyladan](https://github.com/dyladan))
* `opentelemetry-tracing`
  * [#2086](https://github.com/open-telemetry/opentelemetry-js/pull/2086) fix: exception.type should always be a string ([@YanivD](https://github.com/YanivD))
* `opentelemetry-propagator-jaeger`
  * [#1986](https://github.com/open-telemetry/opentelemetry-js/pull/1986) fix(propagator-jaeger): zero pad extracted trace id to 32 characters ([@sid-maddy](https://github.com/sid-maddy))

### :books: (Refine Doc)

* [#2094](https://github.com/open-telemetry/opentelemetry-js/pull/2094) chore: fixing readme info ([@obecny](https://github.com/obecny))
* [#2051](https://github.com/open-telemetry/opentelemetry-js/pull/2051) Add opentelemetry.io docs ([@austinlparker](https://github.com/austinlparker))

### :house: (Internal)

* `opentelemetry-exporter-collector-grpc`, `opentelemetry-metrics`, `opentelemetry-tracing`
  * [#1780](https://github.com/open-telemetry/opentelemetry-js/pull/1780) chore: no-floating-promises ([@naseemkullah](https://github.com/naseemkullah))
* `opentelemetry-context-zone`, `opentelemetry-core`, `opentelemetry-exporter-collector-grpc`, `opentelemetry-exporter-collector-proto`, `opentelemetry-exporter-collector`, `opentelemetry-exporter-jaeger`, `opentelemetry-exporter-prometheus`, `opentelemetry-exporter-zipkin`, `opentelemetry-instrumentation-fetch`, `opentelemetry-instrumentation-grpc`, `opentelemetry-instrumentation-http`, `opentelemetry-instrumentation-xml-http-request`, `opentelemetry-instrumentation`, `opentelemetry-metrics`, `opentelemetry-node`, `opentelemetry-propagator-jaeger`, `opentelemetry-resource-detector-aws`, `opentelemetry-resource-detector-gcp`, `opentelemetry-resources`, `opentelemetry-sdk-node`, `opentelemetry-shim-opentracing`, `opentelemetry-tracing`, `opentelemetry-web`
  * [#2073](https://github.com/open-telemetry/opentelemetry-js/pull/2073) chore: pin own deps ([@dyladan](https://github.com/dyladan))

### Committers: 15

* Anuraag Agrawal ([@anuraaga](https://github.com/anuraaga))
* Austin Parker ([@austinlparker](https://github.com/austinlparker))
* Bartlomiej Obecny ([@obecny](https://github.com/obecny))
* Daniel Dyla ([@dyladan](https://github.com/dyladan))
* Gerhard Stöbich ([@Flarna](https://github.com/Flarna))
* Jakub Malinowski ([@jtmalinowski](https://github.com/jtmalinowski))
* Matthew Wear ([@mwear](https://github.com/mwear))
* Naseem ([@naseemkullah](https://github.com/naseemkullah))
* Niek Kruse ([@niekert](https://github.com/niekert))
* Siddhesh Mhadnak ([@sid-maddy](https://github.com/sid-maddy))
* Siim Kallas ([@seemk](https://github.com/seemk))
* Valentin Marchaud ([@vmarchaud](https://github.com/vmarchaud))
* Vera Reynolds ([@vreynolds](https://github.com/vreynolds))
* Weyert de Boer ([@weyert](https://github.com/weyert))
* Yaniv Davidi ([@YanivD](https://github.com/YanivD))

## 0.18.2

### :bug: (Bug Fix)

* `opentelemetry-api-metrics`, `opentelemetry-context-async-hooks`, `opentelemetry-context-zone-peer-dep`, `opentelemetry-core`, `opentelemetry-exporter-collector-grpc`, `opentelemetry-exporter-collector-proto`, `opentelemetry-exporter-collector`, `opentelemetry-exporter-jaeger`, `opentelemetry-exporter-prometheus`, `opentelemetry-exporter-zipkin`, `opentelemetry-grpc-utils`, `opentelemetry-instrumentation-fetch`, `opentelemetry-instrumentation-grpc`, `opentelemetry-instrumentation-http`, `opentelemetry-instrumentation-xml-http-request`, `opentelemetry-instrumentation`, `opentelemetry-metrics`, `opentelemetry-node`, `opentelemetry-plugin-grpc-js`, `opentelemetry-plugin-grpc`, `opentelemetry-plugin-http`, `opentelemetry-plugin-https`, `opentelemetry-propagator-b3`, `opentelemetry-propagator-jaeger`, `opentelemetry-resource-detector-aws`, `opentelemetry-resource-detector-gcp`, `opentelemetry-resources`, `opentelemetry-sdk-node`, `opentelemetry-shim-opentracing`, `opentelemetry-tracing`, `opentelemetry-web`
  * [#2056](https://github.com/open-telemetry/opentelemetry-js/pull/2056) chore: downgrade API for patch release ([@dyladan](https://github.com/dyladan))

### Committers: 1

* Daniel Dyla ([@dyladan](https://github.com/dyladan))

## 0.18.1

### :rocket: (Enhancement)

* `opentelemetry-instrumentation-fetch`, `opentelemetry-web`
  * [#2010](https://github.com/open-telemetry/opentelemetry-js/pull/2010) Server side rendering support ([@ryhinchey](https://github.com/ryhinchey))
* `opentelemetry-semantic-conventions`
  * [#2026](https://github.com/open-telemetry/opentelemetry-js/pull/2026) feat: add NET_TRANSPORT IPC attributes ([@seemk](https://github.com/seemk))
* `opentelemetry-instrumentation`
  * [#1999](https://github.com/open-telemetry/opentelemetry-js/pull/1999) chore: fixing path of instrumentation file for different systems ([@obecny](https://github.com/obecny))
* `opentelemetry-instrumentation-grpc`
  * [#2005](https://github.com/open-telemetry/opentelemetry-js/pull/2005) chore: exporting grpc instrumentation config ([@obecny](https://github.com/obecny))

### :bug: (Bug Fix)

* `opentelemetry-sdk-node`
  * [#2006](https://github.com/open-telemetry/opentelemetry-js/pull/2006) chore: replacing console with diag ([@obecny](https://github.com/obecny))

### :books: (Refine Doc)

* `opentelemetry-resource-detector-gcp`
  * [#2002](https://github.com/open-telemetry/opentelemetry-js/pull/2002) doc: add usage to README.md of gcp detector ([@weyert](https://github.com/weyert))
* `opentelemetry-api-metrics`, `opentelemetry-context-async-hooks`, `opentelemetry-context-zone-peer-dep`, `opentelemetry-context-zone`, `opentelemetry-core`, `opentelemetry-exporter-collector-grpc`, `opentelemetry-exporter-collector-proto`, `opentelemetry-exporter-collector`, `opentelemetry-exporter-jaeger`, `opentelemetry-exporter-prometheus`, `opentelemetry-exporter-zipkin`, `opentelemetry-grpc-utils`, `opentelemetry-instrumentation-fetch`, `opentelemetry-instrumentation-grpc`, `opentelemetry-instrumentation-http`, `opentelemetry-instrumentation-xml-http-request`, `opentelemetry-instrumentation`, `opentelemetry-metrics`, `opentelemetry-node`, `opentelemetry-plugin-grpc-js`, `opentelemetry-plugin-grpc`, `opentelemetry-plugin-http`, `opentelemetry-plugin-https`, `opentelemetry-propagator-b3`, `opentelemetry-resource-detector-aws`, `opentelemetry-resource-detector-gcp`, `opentelemetry-resources`, `opentelemetry-sdk-node`, `opentelemetry-semantic-conventions`, `opentelemetry-shim-opentracing`, `opentelemetry-tracing`, `opentelemetry-web`
  * [#2040](https://github.com/open-telemetry/opentelemetry-js/pull/2040) chore: fixing broken links, updating to correct base url ([@obecny](https://github.com/obecny))
* `opentelemetry-resources`
  * [#2031](https://github.com/open-telemetry/opentelemetry-js/pull/2031) chore: add resource example ([@vknelluri](https://github.com/vknelluri))
* Other
  * [#2021](https://github.com/open-telemetry/opentelemetry-js/pull/2021) chore: updating compatibility matrix ([@obecny](https://github.com/obecny))
* `opentelemetry-core`
  * [#2011](https://github.com/open-telemetry/opentelemetry-js/pull/2011) docs: fix links & headings about built-in samplers ([@pokutuna](https://github.com/pokutuna))

### :house: (Internal)

* Other
  * [#2028](https://github.com/open-telemetry/opentelemetry-js/pull/2028) chore: removing examples of packages that are part of contrib repo ([@obecny](https://github.com/obecny))
  * [#2033](https://github.com/open-telemetry/opentelemetry-js/pull/2033) chore: add husky to renovate ignore ([@dyladan](https://github.com/dyladan))
  * [#1985](https://github.com/open-telemetry/opentelemetry-js/pull/1985) chore: fix renovate config ([@dyladan](https://github.com/dyladan))
  * [#1992](https://github.com/open-telemetry/opentelemetry-js/pull/1992) chore: update eslint ([@Flarna](https://github.com/Flarna))
  * [#1981](https://github.com/open-telemetry/opentelemetry-js/pull/1981) chore: do not pin the api package ([@dyladan](https://github.com/dyladan))
* `opentelemetry-api-metrics`, `opentelemetry-context-async-hooks`, `opentelemetry-context-zone-peer-dep`, `opentelemetry-core`, `opentelemetry-exporter-collector-grpc`, `opentelemetry-exporter-collector-proto`, `opentelemetry-exporter-collector`, `opentelemetry-exporter-jaeger`, `opentelemetry-exporter-prometheus`, `opentelemetry-exporter-zipkin`, `opentelemetry-grpc-utils`, `opentelemetry-instrumentation-fetch`, `opentelemetry-instrumentation-grpc`, `opentelemetry-instrumentation-http`, `opentelemetry-instrumentation-xml-http-request`, `opentelemetry-instrumentation`, `opentelemetry-metrics`, `opentelemetry-node`, `opentelemetry-plugin-grpc-js`, `opentelemetry-plugin-grpc`, `opentelemetry-plugin-http`, `opentelemetry-plugin-https`, `opentelemetry-propagator-b3`, `opentelemetry-resource-detector-aws`, `opentelemetry-resource-detector-gcp`, `opentelemetry-resources`, `opentelemetry-sdk-node`, `opentelemetry-shim-opentracing`, `opentelemetry-tracing`, `opentelemetry-web`
  * [#2038](https://github.com/open-telemetry/opentelemetry-js/pull/2038) chore: use api release candidate ([@dyladan](https://github.com/dyladan))
* `opentelemetry-exporter-zipkin`
  * [#2039](https://github.com/open-telemetry/opentelemetry-js/pull/2039) Check type of navigator.sendBeacon ([@dyladan](https://github.com/dyladan))
* `opentelemetry-core`, `opentelemetry-exporter-collector`, `opentelemetry-instrumentation-fetch`, `opentelemetry-metrics`, `opentelemetry-propagator-b3`
  * [#1978](https://github.com/open-telemetry/opentelemetry-js/pull/1978) chore: don't disable rule eqeqeq ([@Flarna](https://github.com/Flarna))
* `opentelemetry-propagator-jaeger`
  * [#1931](https://github.com/open-telemetry/opentelemetry-js/pull/1931) adopt opentelemetry-propagator-jaeger ([@jtmalinowski](https://github.com/jtmalinowski))

### Committers: 12

* Bartlomiej Obecny ([@obecny](https://github.com/obecny))
* Daniel Dyla ([@dyladan](https://github.com/dyladan))
* Gerhard Stöbich ([@Flarna](https://github.com/Flarna))
* Jakub Malinowski ([@jtmalinowski](https://github.com/jtmalinowski))
* Neil Fordyce ([@neilfordyce](https://github.com/neilfordyce))
* Nir Hadassi ([@nirsky](https://github.com/nirsky))
* Ryan Hinchey ([@ryhinchey](https://github.com/ryhinchey))
* SJ ([@skjindal93](https://github.com/skjindal93))
* Siim Kallas ([@seemk](https://github.com/seemk))
* Weyert de Boer ([@weyert](https://github.com/weyert))
* [@vknelluri](https://github.com/vknelluri)
* pokutuna ([@pokutuna](https://github.com/pokutuna))

## 0.18.0

### :boom: Breaking Change

* `opentelemetry-resources`
  * [#1975](https://github.com/open-telemetry/opentelemetry-js/pull/1975) fix: specification compliant resource collision precedence ([@lonewolf3739](https://github.com/lonewolf3739))

### :rocket: (Enhancement)

* `opentelemetry-semantic-conventions`
  * [#1976](https://github.com/open-telemetry/opentelemetry-js/pull/1976) feat(semantic-conventions): add missing RpcAttributes from spec ([@blumamir](https://github.com/blumamir))

### :bug: (Bug Fix)

* `opentelemetry-exporter-collector-grpc`, `opentelemetry-exporter-collector`
  * [#1938](https://github.com/open-telemetry/opentelemetry-js/pull/1938) fix(exporter-collector): wrong data type for numbers ([@kudlatyamroth](https://github.com/kudlatyamroth))
* `opentelemetry-instrumentation-http`, `opentelemetry-plugin-http`
  * [#1939](https://github.com/open-telemetry/opentelemetry-js/pull/1939) fix: use socket from the request ([@mzahor](https://github.com/mzahor))
* `opentelemetry-context-async-hooks`
  * [#1937](https://github.com/open-telemetry/opentelemetry-js/pull/1937) fix: isolate binding EventEmitter ([@Flarna](https://github.com/Flarna))

### :books: (Refine Doc)

* [#1973](https://github.com/open-telemetry/opentelemetry-js/pull/1973) docs(readme): fix @opentelemetry/instrumentation-http link ([@Hongbo-Miao](https://github.com/Hongbo-Miao))
* [#1941](https://github.com/open-telemetry/opentelemetry-js/pull/1941) fix: update readme upgrade guidelines version setting ([@MSNev](https://github.com/MSNev))

### :house: (Internal)

* `opentelemetry-api-metrics`, `opentelemetry-context-async-hooks`, `opentelemetry-context-zone-peer-dep`, `opentelemetry-core`, `opentelemetry-exporter-collector-grpc`, `opentelemetry-exporter-collector-proto`, `opentelemetry-exporter-collector`, `opentelemetry-exporter-jaeger`, `opentelemetry-exporter-prometheus`, `opentelemetry-exporter-zipkin`, `opentelemetry-grpc-utils`, `opentelemetry-instrumentation-fetch`, `opentelemetry-instrumentation-grpc`, `opentelemetry-instrumentation-http`, `opentelemetry-instrumentation-xml-http-request`, `opentelemetry-instrumentation`, `opentelemetry-metrics`, `opentelemetry-node`, `opentelemetry-plugin-grpc-js`, `opentelemetry-plugin-grpc`, `opentelemetry-plugin-http`, `opentelemetry-plugin-https`, `opentelemetry-propagator-b3`, `opentelemetry-resource-detector-aws`, `opentelemetry-resource-detector-gcp`, `opentelemetry-resources`, `opentelemetry-sdk-node`, `opentelemetry-shim-opentracing`, `opentelemetry-tracing`, `opentelemetry-web`
  * [#1977](https://github.com/open-telemetry/opentelemetry-js/pull/1977) chore: update API to 0.18.0 ([@Flarna](https://github.com/Flarna))
* Other
  * [#1960](https://github.com/open-telemetry/opentelemetry-js/pull/1960) chore: updating current state of compatibility matrix ([@obecny](https://github.com/obecny))
* `opentelemetry-api-metrics`, `opentelemetry-api`, `opentelemetry-context-async-hooks`, `opentelemetry-context-base`, `opentelemetry-context-zone-peer-dep`, `opentelemetry-core`, `opentelemetry-exporter-collector-grpc`, `opentelemetry-exporter-collector-proto`, `opentelemetry-exporter-collector`, `opentelemetry-exporter-jaeger`, `opentelemetry-exporter-prometheus`, `opentelemetry-exporter-zipkin`, `opentelemetry-grpc-utils`, `opentelemetry-instrumentation-fetch`, `opentelemetry-instrumentation-grpc`, `opentelemetry-instrumentation-http`, `opentelemetry-instrumentation-xml-http-request`, `opentelemetry-instrumentation`, `opentelemetry-metrics`, `opentelemetry-node`, `opentelemetry-plugin-grpc-js`, `opentelemetry-plugin-grpc`, `opentelemetry-plugin-http`, `opentelemetry-plugin-https`, `opentelemetry-propagator-b3`, `opentelemetry-resource-detector-aws`, `opentelemetry-resource-detector-gcp`, `opentelemetry-resources`, `opentelemetry-sdk-node`, `opentelemetry-shim-opentracing`, `opentelemetry-tracing`, `opentelemetry-web`
  * [#1942](https://github.com/open-telemetry/opentelemetry-js/pull/1942) chore: remove API and context-base ([@dyladan](https://github.com/dyladan))
* `opentelemetry-core`, `opentelemetry-exporter-collector`, `opentelemetry-instrumentation-http`, `opentelemetry-metrics`, `opentelemetry-plugin-http`
  * [#1922](https://github.com/open-telemetry/opentelemetry-js/pull/1922) chore: lint on shadowing in non-test sources, fix a few of them ([@johnbley](https://github.com/johnbley))

### Committers: 10

* Amir Blum ([@blumamir](https://github.com/blumamir))
* Bartlomiej Obecny ([@obecny](https://github.com/obecny))
* Daniel Dyla ([@dyladan](https://github.com/dyladan))
* Gerhard Stöbich ([@Flarna](https://github.com/Flarna))
* Hongbo Miao ([@Hongbo-Miao](https://github.com/Hongbo-Miao))
* John Bley ([@johnbley](https://github.com/johnbley))
* Karol Fuksiewicz ([@kudlatyamroth](https://github.com/kudlatyamroth))
* Marian Zagoruiko ([@mzahor](https://github.com/mzahor))
* Nev ([@MSNev](https://github.com/MSNev))
* Srikanth Chekuri ([@lonewolf3739](https://github.com/lonewolf3739))

## 0.17.0

### :boom: Breaking Change

* `opentelemetry-api-metrics`, `opentelemetry-api`, `opentelemetry-core`, `opentelemetry-exporter-collector-grpc`, `opentelemetry-exporter-collector-proto`, `opentelemetry-exporter-collector`, `opentelemetry-exporter-jaeger`, `opentelemetry-exporter-prometheus`, `opentelemetry-exporter-zipkin`, `opentelemetry-grpc-utils`, `opentelemetry-instrumentation-fetch`, `opentelemetry-instrumentation-grpc`, `opentelemetry-instrumentation-http`, `opentelemetry-instrumentation-xml-http-request`, `opentelemetry-instrumentation`, `opentelemetry-metrics`, `opentelemetry-node`, `opentelemetry-plugin-grpc-js`, `opentelemetry-plugin-grpc`, `opentelemetry-plugin-http`, `opentelemetry-plugin-https`, `opentelemetry-resource-detector-aws`, `opentelemetry-resource-detector-gcp`, `opentelemetry-resources`, `opentelemetry-sdk-node`, `opentelemetry-shim-opentracing`, `opentelemetry-tracing`, `opentelemetry-web`
  * [#1925](https://github.com/open-telemetry/opentelemetry-js/pull/1925) feat(diag-logger): replace logger with diag logger ([@MSNev](https://github.com/MSNev))
* `opentelemetry-api`, `opentelemetry-instrumentation-http`, `opentelemetry-node`, `opentelemetry-plugin-http`, `opentelemetry-tracing`
  * [#1899](https://github.com/open-telemetry/opentelemetry-js/pull/1899) chore: create NoopSpan instead reusing NOOP_SPAN ([@Flarna](https://github.com/Flarna))
* `opentelemetry-tracing`
  * [#1908](https://github.com/open-telemetry/opentelemetry-js/pull/1908) chore: remove config from BasicTracerProvider#getTracer ([@Flarna](https://github.com/Flarna))
* `opentelemetry-core`, `opentelemetry-instrumentation-http`, `opentelemetry-node`, `opentelemetry-plugin-http`, `opentelemetry-tracing`
  * [#1900](https://github.com/open-telemetry/opentelemetry-js/pull/1900) chore: remove NoRecordingSpan ([@Flarna](https://github.com/Flarna))
* `opentelemetry-instrumentation-fetch`, `opentelemetry-instrumentation-xml-http-request`, `opentelemetry-instrumentation`, `opentelemetry-node`, `opentelemetry-sdk-node`, `opentelemetry-web`
  * [#1855](https://github.com/open-telemetry/opentelemetry-js/pull/1855) Use instrumentation loader to load plugins and instrumentations ([@obecny](https://github.com/obecny))
* `opentelemetry-api`, `opentelemetry-core`, `opentelemetry-shim-opentracing`
  * [#1876](https://github.com/open-telemetry/opentelemetry-js/pull/1876) refactor!: specification compliant baggage ([@dyladan](https://github.com/dyladan))
* `opentelemetry-api-metrics`, `opentelemetry-api`, `opentelemetry-context-async-hooks`, `opentelemetry-context-base`, `opentelemetry-context-zone-peer-dep`, `opentelemetry-context-zone`, `opentelemetry-core`, `opentelemetry-exporter-collector-grpc`, `opentelemetry-exporter-collector-proto`, `opentelemetry-exporter-collector`, `opentelemetry-exporter-jaeger`, `opentelemetry-exporter-prometheus`, `opentelemetry-exporter-zipkin`, `opentelemetry-grpc-utils`, `opentelemetry-instrumentation-fetch`, `opentelemetry-instrumentation-grpc`, `opentelemetry-instrumentation-http`, `opentelemetry-instrumentation-xml-http-request`, `opentelemetry-instrumentation`, `opentelemetry-metrics`, `opentelemetry-node`, `opentelemetry-plugin-grpc-js`, `opentelemetry-plugin-grpc`, `opentelemetry-plugin-http`, `opentelemetry-plugin-https`, `opentelemetry-propagator-b3`, `opentelemetry-resource-detector-aws`, `opentelemetry-resource-detector-gcp`, `opentelemetry-resources`, `opentelemetry-sdk-node`, `opentelemetry-semantic-conventions`, `opentelemetry-shim-opentracing`, `opentelemetry-tracing`, `opentelemetry-web`
  * [#1874](https://github.com/open-telemetry/opentelemetry-js/pull/1874) More specific api type names ([@dyladan](https://github.com/dyladan))

### :rocket: (Enhancement)

* `opentelemetry-exporter-prometheus`
  * [#1857](https://github.com/open-telemetry/opentelemetry-js/pull/1857) feat: add prometheus exporter host and port env vars ([@naseemkullah](https://github.com/naseemkullah))
  * [#1879](https://github.com/open-telemetry/opentelemetry-js/pull/1879) feat(prometheus): add `getMetricsRequestHandler`-method to Prometheus ([@weyert](https://github.com/weyert))
* `opentelemetry-core`, `opentelemetry-tracing`
  * [#1918](https://github.com/open-telemetry/opentelemetry-js/pull/1918) chore: batch processor, aligning with latest spec changes for environments variables ([@obecny](https://github.com/obecny))
* `opentelemetry-instrumentation-grpc`
  * [#1806](https://github.com/open-telemetry/opentelemetry-js/pull/1806) feat: merge grpc-js into grpc instrumentation #1657 ([@vmarchaud](https://github.com/vmarchaud))
* `opentelemetry-api`, `opentelemetry-core`
  * [#1880](https://github.com/open-telemetry/opentelemetry-js/pull/1880) feat(diag-logger): introduce a new global level api.diag for internal diagnostic logging ([@MSNev](https://github.com/MSNev))
* Other
  * [#1920](https://github.com/open-telemetry/opentelemetry-js/pull/1920) chore: adding compatibility matrix for core and contrib versions ([@obecny](https://github.com/obecny))
* `opentelemetry-api`, `opentelemetry-context-async-hooks`, `opentelemetry-context-base`, `opentelemetry-context-zone-peer-dep`, `opentelemetry-tracing`, `opentelemetry-web`
  * [#1883](https://github.com/open-telemetry/opentelemetry-js/pull/1883) feat: add support to forward args in context.with ([@Flarna](https://github.com/Flarna))
* `opentelemetry-api`, `opentelemetry-core`, `opentelemetry-shim-opentracing`
  * [#1876](https://github.com/open-telemetry/opentelemetry-js/pull/1876) refactor!: specification compliant baggage ([@dyladan](https://github.com/dyladan))

### :books: (Refine Doc)

* Other
  * [#1904](https://github.com/open-telemetry/opentelemetry-js/pull/1904) chore: fix upgrade guideline ([@dyladan](https://github.com/dyladan))
* `opentelemetry-api`
  * [#1901](https://github.com/open-telemetry/opentelemetry-js/pull/1901) doc: correct tracer docs ([@Flarna](https://github.com/Flarna))

### Committers: 8

* Bartlomiej Obecny ([@obecny](https://github.com/obecny))
* Daniel Dyla ([@dyladan](https://github.com/dyladan))
* Gerhard Stöbich ([@Flarna](https://github.com/Flarna))
* Naseem ([@naseemkullah](https://github.com/naseemkullah))
* Nev ([@MSNev](https://github.com/MSNev))
* Srikanth Chekuri ([@lonewolf3739](https://github.com/lonewolf3739))
* Valentin Marchaud ([@vmarchaud](https://github.com/vmarchaud))
* Weyert de Boer ([@weyert](https://github.com/weyert))

## 0.16.0

### :boom: Breaking Change

* `opentelemetry-exporter-collector`
  * [#1863](https://github.com/open-telemetry/opentelemetry-js/pull/1863) fix(exporter-collector): all http export requests should share same a… ([@blumamir](https://github.com/blumamir))
* `opentelemetry-api`, `opentelemetry-exporter-collector`, `opentelemetry-exporter-jaeger`
  * [#1860](https://github.com/open-telemetry/opentelemetry-js/pull/1860) chore: fixing status code aligning it with proto ([@obecny](https://github.com/obecny))

### :rocket: (Enhancement)

* `opentelemetry-core`
  * [#1837](https://github.com/open-telemetry/opentelemetry-js/pull/1837) chore(http-propagation): reduce complexity of traceparent parsing ([@marcbachmann](https://github.com/marcbachmann))
* `opentelemetry-api`, `opentelemetry-exporter-collector`, `opentelemetry-exporter-jaeger`
  * [#1860](https://github.com/open-telemetry/opentelemetry-js/pull/1860) chore: fixing status code aligning it with proto ([@obecny](https://github.com/obecny))

### :bug: (Bug Fix)

* `opentelemetry-exporter-collector`
  * [#1863](https://github.com/open-telemetry/opentelemetry-js/pull/1863) fix(exporter-collector): all http export requests should share same a… ([@blumamir](https://github.com/blumamir))

### :books: (Refine Doc)

* `opentelemetry-api`
  * [#1864](https://github.com/open-telemetry/opentelemetry-js/pull/1864) chore: export API singleton types ([@dyladan](https://github.com/dyladan))
* `opentelemetry-api-metrics`, `opentelemetry-api`, `opentelemetry-context-async-hooks`, `opentelemetry-context-base`, `opentelemetry-context-zone-peer-dep`, `opentelemetry-context-zone`, `opentelemetry-core`, `opentelemetry-exporter-collector-grpc`, `opentelemetry-exporter-collector-proto`, `opentelemetry-exporter-collector`, `opentelemetry-exporter-jaeger`, `opentelemetry-exporter-prometheus`, `opentelemetry-exporter-zipkin`, `opentelemetry-grpc-utils`, `opentelemetry-instrumentation-fetch`, `opentelemetry-instrumentation-grpc`, `opentelemetry-instrumentation-http`, `opentelemetry-instrumentation-xml-http-request`, `opentelemetry-instrumentation`, `opentelemetry-metrics`, `opentelemetry-node`, `opentelemetry-plugin-grpc-js`, `opentelemetry-plugin-grpc`, `opentelemetry-plugin-http`, `opentelemetry-plugin-https`, `opentelemetry-propagator-b3`, `opentelemetry-resource-detector-aws`, `opentelemetry-resource-detector-gcp`, `opentelemetry-resources`, `opentelemetry-sdk-node`, `opentelemetry-semantic-conventions`, `opentelemetry-shim-opentracing`, `opentelemetry-tracing`, `opentelemetry-web`
  * [#1866](https://github.com/open-telemetry/opentelemetry-js/pull/1866) chore: remove all gitter links and replace with dicussions ([@dyladan](https://github.com/dyladan))
* `opentelemetry-exporter-jaeger`
  * [#1869](https://github.com/open-telemetry/opentelemetry-js/pull/1869) Add info that the project only works with Node.js ([@JapuDCret](https://github.com/JapuDCret))
* `opentelemetry-api-metrics`, `opentelemetry-api`, `opentelemetry-context-async-hooks`, `opentelemetry-context-base`, `opentelemetry-context-zone-peer-dep`, `opentelemetry-context-zone`, `opentelemetry-core`, `opentelemetry-exporter-collector-grpc`, `opentelemetry-exporter-collector-proto`, `opentelemetry-exporter-collector`, `opentelemetry-exporter-jaeger`, `opentelemetry-exporter-prometheus`, `opentelemetry-exporter-zipkin`, `opentelemetry-grpc-utils`, `opentelemetry-instrumentation-fetch`, `opentelemetry-instrumentation-grpc`, `opentelemetry-instrumentation-http`, `opentelemetry-instrumentation-xml-http-request`, `opentelemetry-instrumentation`, `opentelemetry-metrics`, `opentelemetry-node`, `opentelemetry-plugin-grpc-js`, `opentelemetry-plugin-grpc`, `opentelemetry-plugin-http`, `opentelemetry-plugin-https`, `opentelemetry-resource-detector-aws`, `opentelemetry-resource-detector-gcp`, `opentelemetry-resources`, `opentelemetry-sdk-node`, `opentelemetry-semantic-conventions`, `opentelemetry-shim-opentracing`, `opentelemetry-tracing`, `opentelemetry-web`
  * [#1865](https://github.com/open-telemetry/opentelemetry-js/pull/1865) Fix all links to point to main ([@dyladan](https://github.com/dyladan))
* Other
  * [#1858](https://github.com/open-telemetry/opentelemetry-js/pull/1858) docs: update contribution documentation ([@drexler](https://github.com/drexler))

### Committers: 6

* Amir Blum ([@blumamir](https://github.com/blumamir))
* Bartlomiej Obecny ([@obecny](https://github.com/obecny))
* Daniel Dyla ([@dyladan](https://github.com/dyladan))
* Marc Bachmann ([@marcbachmann](https://github.com/marcbachmann))
* [@JapuDCret](https://github.com/JapuDCret)
* andrew quartey ([@drexler](https://github.com/drexler))

## 0.15.0

### :boom: Breaking Change

* `opentelemetry-api-metrics`, `opentelemetry-api`, `opentelemetry-exporter-collector-grpc`, `opentelemetry-exporter-collector-proto`, `opentelemetry-exporter-collector`, `opentelemetry-exporter-prometheus`, `opentelemetry-instrumentation`, `opentelemetry-metrics`, `opentelemetry-sdk-node`
  * [#1797](https://github.com/open-telemetry/opentelemetry-js/pull/1797) chore!: split metrics into its own api package ([@dyladan](https://github.com/dyladan))
* `opentelemetry-api`, `opentelemetry-context-zone-peer-dep`, `opentelemetry-context-zone`, `opentelemetry-grpc-utils`, `opentelemetry-instrumentation-http`, `opentelemetry-instrumentation-xml-http-request`, `opentelemetry-node`, `opentelemetry-plugin-fetch`, `opentelemetry-plugin-grpc-js`, `opentelemetry-plugin-grpc`, `opentelemetry-plugin-http`, `opentelemetry-plugin-https`, `opentelemetry-tracing`, `opentelemetry-web`
  * [#1764](https://github.com/open-telemetry/opentelemetry-js/pull/1764) chore: remove tracer apis not part of spec ([@Flarna](https://github.com/Flarna))
* `opentelemetry-exporter-collector-grpc`, `opentelemetry-exporter-collector-proto`
  * [#1725](https://github.com/open-telemetry/opentelemetry-js/pull/1725) Use new gRPC default port ([@jufab](https://github.com/jufab))
* `opentelemetry-api`, `opentelemetry-core`, `opentelemetry-instrumentation-http`, `opentelemetry-node`, `opentelemetry-plugin-fetch`, `opentelemetry-plugin-http`, `opentelemetry-plugin-https`, `opentelemetry-propagator-b3`, `opentelemetry-shim-opentracing`, `opentelemetry-tracing`
  * [#1749](https://github.com/open-telemetry/opentelemetry-js/pull/1749) chore: improve naming of span related context APIs ([@Flarna](https://github.com/Flarna))

### :rocket: (Enhancement)

* `opentelemetry-instrumentation-http`, `opentelemetry-plugin-http`, `opentelemetry-plugin-https`
  * [#1838](https://github.com/open-telemetry/opentelemetry-js/pull/1838) improv(instrumentation-http): supressInstrumentation when we get a request on ignoredPath [#1831] ([@vmarchaud](https://github.com/vmarchaud))
* `opentelemetry-web`
  * [#1769](https://github.com/open-telemetry/opentelemetry-js/pull/1769) Allow zero/negative performance timings ([@johnbley](https://github.com/johnbley))
* `opentelemetry-instrumentation-fetch`
  * [#1662](https://github.com/open-telemetry/opentelemetry-js/pull/1662) fix(plugin-fetch): check if PerformanceObserver exists ([@mhennoch](https://github.com/mhennoch))
  * [#1796](https://github.com/open-telemetry/opentelemetry-js/pull/1796) Convert fetch plugin to instrumentation ([@obecny](https://github.com/obecny))
* `opentelemetry-exporter-zipkin`
  * [#1789](https://github.com/open-telemetry/opentelemetry-js/pull/1789) feat(exporter-zipkin): per-span service name ([@sfishel-splunk](https://github.com/sfishel-splunk))
* `opentelemetry-api-metrics`, `opentelemetry-api`, `opentelemetry-exporter-collector-grpc`, `opentelemetry-exporter-collector-proto`, `opentelemetry-exporter-collector`, `opentelemetry-exporter-prometheus`, `opentelemetry-instrumentation`, `opentelemetry-metrics`, `opentelemetry-sdk-node`
  * [#1797](https://github.com/open-telemetry/opentelemetry-js/pull/1797) chore!: split metrics into its own api package ([@dyladan](https://github.com/dyladan))
* `opentelemetry-exporter-collector`
  * [#1822](https://github.com/open-telemetry/opentelemetry-js/pull/1822) chore: remove unused dependency ([@dyladan](https://github.com/dyladan))
* `opentelemetry-api`
  * [#1815](https://github.com/open-telemetry/opentelemetry-js/pull/1815) chore: change SpanOptions startTime to TimeInput ([@dyladan](https://github.com/dyladan))
  * [#1813](https://github.com/open-telemetry/opentelemetry-js/pull/1813) fix(api): add public 'fields' function to api.propagator ([@blumamir](https://github.com/blumamir))
* `opentelemetry-instrumentation`
  * [#1803](https://github.com/open-telemetry/opentelemetry-js/pull/1803) chore: adding async function for safe execute in instrumentation ([@obecny](https://github.com/obecny))
  * [#1731](https://github.com/open-telemetry/opentelemetry-js/pull/1731) feat: creating one auto loader for instrumentation and old plugins ([@obecny](https://github.com/obecny))
* `opentelemetry-instrumentation`, `opentelemetry-node`
  * [#1807](https://github.com/open-telemetry/opentelemetry-js/pull/1807) perf(opentelemetry-node): plugin loader search required cache ([@blumamir](https://github.com/blumamir))
* Other
  * [#1785](https://github.com/open-telemetry/opentelemetry-js/pull/1785) Add CodeQL security scans ([@amanbrar1999](https://github.com/amanbrar1999))
* `opentelemetry-instrumentation-grpc`, `opentelemetry-instrumentation`
  * [#1744](https://github.com/open-telemetry/opentelemetry-js/pull/1744) feat(grpc-instrumentation): migrate grpc to instrumentation #1656 ([@vmarchaud](https://github.com/vmarchaud))
* `opentelemetry-core`, `opentelemetry-tracing`
  * [#1755](https://github.com/open-telemetry/opentelemetry-js/pull/1755) feat: batch span processor environment config ([@mwear](https://github.com/mwear))
* `opentelemetry-instrumentation-http`
  * [#1771](https://github.com/open-telemetry/opentelemetry-js/pull/1771) feat(http-instrumentation): add content size attributes to spans ([@vmarchaud](https://github.com/vmarchaud))
* `opentelemetry-core`, `opentelemetry-exporter-collector-proto`, `opentelemetry-exporter-collector`, `opentelemetry-exporter-jaeger`, `opentelemetry-exporter-prometheus`, `opentelemetry-exporter-zipkin`, `opentelemetry-grpc-utils`, `opentelemetry-instrumentation-http`, `opentelemetry-metrics`, `opentelemetry-node`, `opentelemetry-plugin-http`, `opentelemetry-plugin-https`, `opentelemetry-resource-detector-aws`, `opentelemetry-resource-detector-gcp`, `opentelemetry-resources`, `opentelemetry-shim-opentracing`, `opentelemetry-tracing`, `opentelemetry-web`
  * [#1746](https://github.com/open-telemetry/opentelemetry-js/pull/1746) chore: remove NoopLogger from sdk and use from api ([@lonewolf3739](https://github.com/lonewolf3739))

### :bug: (Bug Fix)

* `opentelemetry-core`
  * [#1784](https://github.com/open-telemetry/opentelemetry-js/pull/1784) fix(opentelemetry-core): fixed timeInputToHrTime when time is Date type ([@zoomchan-cxj](https://github.com/zoomchan-cxj))
* `opentelemetry-exporter-collector-grpc`, `opentelemetry-exporter-collector-proto`
  * [#1725](https://github.com/open-telemetry/opentelemetry-js/pull/1725) Use new gRPC default port ([@jufab](https://github.com/jufab))

### :books: (Refine Doc)

* `opentelemetry-exporter-collector`
  * [#1791](https://github.com/open-telemetry/opentelemetry-js/pull/1791) docs: fix readme MetricProvider -> MeterProvider ([@aabmass](https://github.com/aabmass))

### Committers: 17

* Aaron Abbott ([@aabmass](https://github.com/aabmass))
* Aman Brar ([@amanbrar1999](https://github.com/amanbrar1999))
* Amir Blum ([@blumamir](https://github.com/blumamir))
* Bartlomiej Obecny ([@obecny](https://github.com/obecny))
* Daniel Dyla ([@dyladan](https://github.com/dyladan))
* Gerhard Stöbich ([@Flarna](https://github.com/Flarna))
* Jakub Malinowski ([@jtmalinowski](https://github.com/jtmalinowski))
* John Bley ([@johnbley](https://github.com/johnbley))
* Julien Fabre ([@jufab](https://github.com/jufab))
* MartenH ([@mhennoch](https://github.com/mhennoch))
* Matthew Wear ([@mwear](https://github.com/mwear))
* Naseem ([@naseemkullah](https://github.com/naseemkullah))
* Paul Draper ([@pauldraper](https://github.com/pauldraper))
* Simon Fishel ([@sfishel-splunk](https://github.com/sfishel-splunk))
* Srikanth Chekuri ([@lonewolf3739](https://github.com/lonewolf3739))
* Valentin Marchaud ([@vmarchaud](https://github.com/vmarchaud))
* Zoom Chan ([@zoomchan-cxj](https://github.com/zoomchan-cxj))

## 0.14.0

### :boom: Breaking Change

* `opentelemetry-api`, `opentelemetry-metrics`
  * [#1709](https://github.com/open-telemetry/opentelemetry-js/pull/1709) refactor: batch observer to be independent from metric types ([@legendecas](https://github.com/legendecas))
* `opentelemetry-api`, `opentelemetry-instrumentation-http`, `opentelemetry-instrumentation-xml-http-request`, `opentelemetry-plugin-fetch`, `opentelemetry-plugin-grpc-js`, `opentelemetry-plugin-grpc`, `opentelemetry-plugin-http`, `opentelemetry-shim-opentracing`
  * [#1734](https://github.com/open-telemetry/opentelemetry-js/pull/1734) chore: requires user to pass context to propagation APIs ([@Flarna](https://github.com/Flarna))
* `opentelemetry-api`, `opentelemetry-core`, `opentelemetry-grpc-utils`, `opentelemetry-node`, `opentelemetry-plugin-fetch`, `opentelemetry-plugin-grpc-js`, `opentelemetry-plugin-grpc`, `opentelemetry-plugin-http`
  * [#1715](https://github.com/open-telemetry/opentelemetry-js/pull/1715) chore: moving plugin from api to core ([@obecny](https://github.com/obecny))

### :rocket: (Enhancement)

* `opentelemetry-semantic-conventions`
  * [#1684](https://github.com/open-telemetry/opentelemetry-js/pull/1684) feat(semantic-conventions): messaging specifications ([@nirsky](https://github.com/nirsky))
* `opentelemetry-tracing`
  * [#1685](https://github.com/open-telemetry/opentelemetry-js/pull/1685) chore: remove ordered attribute dropping ([@dyladan](https://github.com/dyladan))
* `opentelemetry-api`, `opentelemetry-core`, `opentelemetry-sdk-node`, `opentelemetry-shim-opentracing`, `opentelemetry-tracing`
  * [#1687](https://github.com/open-telemetry/opentelemetry-js/pull/1687) chore: rename CorrelationContext to Baggage ([@dyladan](https://github.com/dyladan))
* `opentelemetry-exporter-prometheus`
  * [#1697](https://github.com/open-telemetry/opentelemetry-js/pull/1697) fix(exporter-prometheus): add appendTimestamp option to ExporterConfig ([@antoniomrfranco](https://github.com/antoniomrfranco))
* `opentelemetry-exporter-collector-proto`, `opentelemetry-exporter-collector`
  * [#1661](https://github.com/open-telemetry/opentelemetry-js/pull/1661) Use http keep-alive in collector exporter ([@lonewolf3739](https://github.com/lonewolf3739))
* `opentelemetry-plugin-http`, `opentelemetry-semantic-conventions`
  * [#1625](https://github.com/open-telemetry/opentelemetry-js/pull/1625)  feat(opentelemetry-js): add content size attributes to HTTP spans  ([@nijotz](https://github.com/nijotz))
* `opentelemetry-exporter-collector`
  * [#1708](https://github.com/open-telemetry/opentelemetry-js/pull/1708) feat(exporter-collector): implement concurrencyLimit option ([@dobesv](https://github.com/dobesv))
* `opentelemetry-api`, `opentelemetry-core`, `opentelemetry-grpc-utils`, `opentelemetry-node`, `opentelemetry-plugin-fetch`, `opentelemetry-plugin-grpc-js`, `opentelemetry-plugin-grpc`, `opentelemetry-plugin-http`
  * [#1715](https://github.com/open-telemetry/opentelemetry-js/pull/1715) chore: moving plugin from api to core ([@obecny](https://github.com/obecny))

### :bug: (Bug Fix)

* `opentelemetry-exporter-jaeger`
  * [#1758](https://github.com/open-telemetry/opentelemetry-js/pull/1758) fix(@opentelemetry/exporter-jaeger): fixed issue #1757 ([@debagger](https://github.com/debagger))
* `opentelemetry-exporter-collector-grpc`, `opentelemetry-exporter-collector-proto`, `opentelemetry-exporter-collector`
  * [#1751](https://github.com/open-telemetry/opentelemetry-js/pull/1751) Fixing Span status when exporting span ([@obecny](https://github.com/obecny))
* `opentelemetry-instrumentation-http`, `opentelemetry-plugin-http`
  * [#1747](https://github.com/open-telemetry/opentelemetry-js/pull/1747) feat: fixing failing test ([@obecny](https://github.com/obecny))
* `opentelemetry-instrumentation-xml-http-request`
  * [#1720](https://github.com/open-telemetry/opentelemetry-js/pull/1720) fix(xhr): check for resource timing support ([@bradfrosty](https://github.com/bradfrosty))

### Committers: 13

* Antônio Franco ([@antoniomrfranco](https://github.com/antoniomrfranco))
* Bartlomiej Obecny ([@obecny](https://github.com/obecny))
* Brad Frost ([@bradfrosty](https://github.com/bradfrosty))
* Daniel Dyla ([@dyladan](https://github.com/dyladan))
* Dobes Vandermeer ([@dobesv](https://github.com/dobesv))
* Gerhard Stöbich ([@Flarna](https://github.com/Flarna))
* Mikhail Sokolov ([@debagger](https://github.com/debagger))
* Nik Zap ([@nijotz](https://github.com/nijotz))
* Nir Hadassi ([@nirsky](https://github.com/nirsky))
* Shovnik Bhattacharya ([@shovnik](https://github.com/shovnik))
* Srikanth Chekuri ([@lonewolf3739](https://github.com/lonewolf3739))
* Valentin Marchaud ([@vmarchaud](https://github.com/vmarchaud))
* legendecas ([@legendecas](https://github.com/legendecas))

## 0.13.0

### :boom: Breaking Change

* `opentelemetry-api`, `opentelemetry-exporter-collector-grpc`, `opentelemetry-exporter-collector-proto`, `opentelemetry-exporter-collector`, `opentelemetry-exporter-prometheus`, `opentelemetry-metrics`, `opentelemetry-sdk-node`
  * [#1700](https://github.com/open-telemetry/opentelemetry-js/pull/1700) Metrics updates ([@obecny](https://github.com/obecny))
* `opentelemetry-api`, `opentelemetry-exporter-collector-grpc`, `opentelemetry-exporter-collector-proto`, `opentelemetry-exporter-collector`, `opentelemetry-exporter-jaeger`, `opentelemetry-exporter-zipkin`, `opentelemetry-grpc-utils`, `opentelemetry-plugin-grpc-js`, `opentelemetry-plugin-grpc`, `opentelemetry-plugin-http`, `opentelemetry-plugin-https`, `opentelemetry-shim-opentracing`, `opentelemetry-tracing`
  * [#1644](https://github.com/open-telemetry/opentelemetry-js/pull/1644) fix!: change status codes from grpc status codes ([@lonewolf3739](https://github.com/lonewolf3739))
* `opentelemetry-core`, `opentelemetry-exporter-collector-proto`, `opentelemetry-exporter-collector`, `opentelemetry-exporter-jaeger`, `opentelemetry-exporter-prometheus`, `opentelemetry-exporter-zipkin`, `opentelemetry-metrics`, `opentelemetry-tracing`
  * [#1643](https://github.com/open-telemetry/opentelemetry-js/pull/1643) refactor: new interface for ExportResult #1569 ([@vmarchaud](https://github.com/vmarchaud))
* `opentelemetry-api`, `opentelemetry-core`, `opentelemetry-plugin-fetch`, `opentelemetry-plugin-xml-http-request`, `opentelemetry-propagator-b3`, `opentelemetry-web`
  * [#1595](https://github.com/open-telemetry/opentelemetry-js/pull/1595) chore!: move b3 into its own package ([@mwear](https://github.com/mwear))
* `opentelemetry-api`, `opentelemetry-core`, `opentelemetry-plugin-fetch`, `opentelemetry-plugin-grpc-js`, `opentelemetry-plugin-grpc`, `opentelemetry-shim-opentracing`
  * [#1576](https://github.com/open-telemetry/opentelemetry-js/pull/1576) feat: add keys operation to getter ([@dyladan](https://github.com/dyladan))

### :rocket: (Enhancement)

* `opentelemetry-resource-detector-aws`
  * [#1669](https://github.com/open-telemetry/opentelemetry-js/pull/1669) Feat: Added Amazon EKS Resource Detector ([@KKelvinLo](https://github.com/KKelvinLo))
* `opentelemetry-api`, `opentelemetry-exporter-collector-grpc`, `opentelemetry-exporter-collector-proto`, `opentelemetry-exporter-collector`, `opentelemetry-exporter-prometheus`, `opentelemetry-metrics`, `opentelemetry-sdk-node`
  * [#1700](https://github.com/open-telemetry/opentelemetry-js/pull/1700) Metrics updates ([@obecny](https://github.com/obecny))
* `opentelemetry-tracing`
  * [#1692](https://github.com/open-telemetry/opentelemetry-js/pull/1692) chore: remove unused tracer config gracefulShutdown ([@Flarna](https://github.com/Flarna))
  * [#1622](https://github.com/open-telemetry/opentelemetry-js/pull/1622) fix(tracing): use globalErrorHandler when flushing fails ([@johanneswuerbach](https://github.com/johanneswuerbach))
* `opentelemetry-semantic-conventions`
  * [#1670](https://github.com/open-telemetry/opentelemetry-js/pull/1670) feat(semantic-conventions): FaaS specifications ([@nirsky](https://github.com/nirsky))
* `opentelemetry-exporter-collector-grpc`, `opentelemetry-exporter-collector-proto`, `opentelemetry-exporter-collector`, `opentelemetry-exporter-prometheus`, `opentelemetry-metrics`
  * [#1628](https://github.com/open-telemetry/opentelemetry-js/pull/1628) fix: boundaries option propagation in ValueRecorder Metric ([@AndrewGrachov](https://github.com/AndrewGrachov))
* `opentelemetry-exporter-collector-proto`, `opentelemetry-exporter-collector`
  * [#1607](https://github.com/open-telemetry/opentelemetry-js/pull/1607) feat(exporter-collector): log upstream error #1459 ([@vmarchaud](https://github.com/vmarchaud))
* `opentelemetry-instrumentation-xml-http-request`
  * [#1651](https://github.com/open-telemetry/opentelemetry-js/pull/1651) chore: use performance directly in xhr plugin ([@dyladan](https://github.com/dyladan))
* `opentelemetry-instrumentation-xml-http-request`, `opentelemetry-instrumentation`, `opentelemetry-web`
  * [#1659](https://github.com/open-telemetry/opentelemetry-js/pull/1659) feat: replacing base plugin with instrumentation for xml-http-request ([@obecny](https://github.com/obecny))
* `opentelemetry-core`, `opentelemetry-tracing`
  * [#1653](https://github.com/open-telemetry/opentelemetry-js/pull/1653) chore: env vars for span limit as per specification ([@jtmalinowski](https://github.com/jtmalinowski))
* `opentelemetry-exporter-zipkin`
  * [#1474](https://github.com/open-telemetry/opentelemetry-js/pull/1474) chore(zipkin): export ExporterConfig ([@shivkanya9146](https://github.com/shivkanya9146))
* `opentelemetry-api`, `opentelemetry-node`, `opentelemetry-plugin-fetch`, `opentelemetry-tracing`
  * [#1612](https://github.com/open-telemetry/opentelemetry-js/pull/1612) chore: remove explicit parent option ([@dyladan](https://github.com/dyladan))
* `opentelemetry-exporter-zipkin`, `opentelemetry-plugin-http`, `opentelemetry-tracing`
  * [#1632](https://github.com/open-telemetry/opentelemetry-js/pull/1632) feat: span processor onstart recieves context ([@dyladan](https://github.com/dyladan))
* `opentelemetry-api`, `opentelemetry-core`, `opentelemetry-tracing`
  * [#1631](https://github.com/open-telemetry/opentelemetry-js/pull/1631) chore: sampler gets a full context ([@dyladan](https://github.com/dyladan))
* `opentelemetry-api`, `opentelemetry-core`, `opentelemetry-plugin-http`, `opentelemetry-plugin-https`, `opentelemetry-propagator-b3`
  * [#1615](https://github.com/open-telemetry/opentelemetry-js/pull/1615) chore: add fields operation to TextMapPropagator ([@dyladan](https://github.com/dyladan))
* `opentelemetry-plugin-xml-http-request`, `opentelemetry-tracing`
  * [#1621](https://github.com/open-telemetry/opentelemetry-js/pull/1621) chore: ensure onStart is called with a writeable span ([@dyladan](https://github.com/dyladan))
* `opentelemetry-api`, `opentelemetry-core`
  * [#1597](https://github.com/open-telemetry/opentelemetry-js/pull/1597) fix: make TraceState immutable ([@Flarna](https://github.com/Flarna))

### :bug: (Bug Fix)

* `opentelemetry-tracing`
  * [#1666](https://github.com/open-telemetry/opentelemetry-js/pull/1666) fix: clear BatchSpanProcessor internal spans buffer before exporting ([@TsvetanMilanov](https://github.com/TsvetanMilanov))
* `opentelemetry-exporter-collector-grpc`, `opentelemetry-exporter-collector-proto`, `opentelemetry-exporter-collector`
  * [#1641](https://github.com/open-telemetry/opentelemetry-js/pull/1641) fix: do not access promise before resolve ([@obecny](https://github.com/obecny))
  * [#1627](https://github.com/open-telemetry/opentelemetry-js/pull/1627) chore: fixing conversion of id to hex and base64 ([@obecny](https://github.com/obecny))

### :books: (Refine Doc)

* `opentelemetry-context-zone-peer-dep`, `opentelemetry-context-zone`, `opentelemetry-instrumentation-xml-http-request`
  * [#1696](https://github.com/open-telemetry/opentelemetry-js/pull/1696) chore: use WebTracerProvider instead of WebTracer in docs ([@bradfrosty](https://github.com/bradfrosty))
* `opentelemetry-api`
  * [#1650](https://github.com/open-telemetry/opentelemetry-js/pull/1650) docs: document null and undefined attribute values undefined behavior ([@dyladan](https://github.com/dyladan))
* `opentelemetry-context-zone-peer-dep`, `opentelemetry-web`
  * [#1616](https://github.com/open-telemetry/opentelemetry-js/pull/1616) docs: zone ctx manager can only be used with es2015 ([@dyladan](https://github.com/dyladan))

### Committers: 16

* Andrew ([@AndrewGrachov](https://github.com/AndrewGrachov))
* Bartlomiej Obecny ([@obecny](https://github.com/obecny))
* Brad Frost ([@bradfrosty](https://github.com/bradfrosty))
* Daniel Dyla ([@dyladan](https://github.com/dyladan))
* Gerhard Stöbich ([@Flarna](https://github.com/Flarna))
* Jakub Malinowski ([@jtmalinowski](https://github.com/jtmalinowski))
* Johannes Würbach ([@johanneswuerbach](https://github.com/johanneswuerbach))
* Kelvin Lo ([@KKelvinLo](https://github.com/KKelvinLo))
* Matthew Wear ([@mwear](https://github.com/mwear))
* Naga ([@tannaga](https://github.com/tannaga))
* Nir Hadassi ([@nirsky](https://github.com/nirsky))
* Shivkanya Andhare ([@shivkanya9146](https://github.com/shivkanya9146))
* Srikanth Chekuri ([@lonewolf3739](https://github.com/lonewolf3739))
* Tsvetan Milanov ([@TsvetanMilanov](https://github.com/TsvetanMilanov))
* Valentin Marchaud ([@vmarchaud](https://github.com/vmarchaud))
* [@snyder114](https://github.com/snyder114)

## 0.12.0

### :boom: Breaking Change

* `opentelemetry-api`, `opentelemetry-exporter-collector-grpc`, `opentelemetry-exporter-collector-proto`, `opentelemetry-exporter-collector`, `opentelemetry-exporter-prometheus`, `opentelemetry-metrics`
  * [#1588](https://github.com/open-telemetry/opentelemetry-js/pull/1588) Update to Proto v0.5.0 ([@obecny](https://github.com/obecny))
* `opentelemetry-api`, `opentelemetry-core`, `opentelemetry-plugin-http`, `opentelemetry-plugin-https`, `opentelemetry-shim-opentracing`
  * [#1589](https://github.com/open-telemetry/opentelemetry-js/pull/1589) feat: simplify active span logic ([@mwear](https://github.com/mwear))
* `opentelemetry-resource-detector-aws`, `opentelemetry-resources`
  * [#1581](https://github.com/open-telemetry/opentelemetry-js/pull/1581) chore: remove duplicate hostname resource attribute ([@mwear](https://github.com/mwear))
* `opentelemetry-api`, `opentelemetry-core`, `opentelemetry-plugin-fetch`, `opentelemetry-plugin-xml-http-request`
  * [#1560](https://github.com/open-telemetry/opentelemetry-js/pull/1560) feat: b3 single header support ([@mwear](https://github.com/mwear))
* `opentelemetry-core`, `opentelemetry-tracing`
  * [#1562](https://github.com/open-telemetry/opentelemetry-js/pull/1562) feat(core): rename ProbabilitySampler to TraceIdRatioBasedSampler ([@legendecas](https://github.com/legendecas))
* `opentelemetry-exporter-prometheus`
  * [#1375](https://github.com/open-telemetry/opentelemetry-js/pull/1375) feat: make prometheus config preventServerStart optional ([@legendecas](https://github.com/legendecas))
* `opentelemetry-core`, `opentelemetry-exporter-prometheus`, `opentelemetry-metrics`, `opentelemetry-sdk-node`, `opentelemetry-tracing`
  * [#1522](https://github.com/open-telemetry/opentelemetry-js/pull/1522) Remove process listener ([@dyladan](https://github.com/dyladan))

### :rocket: (Enhancement)

* `opentelemetry-api`, `opentelemetry-exporter-collector-grpc`, `opentelemetry-exporter-collector-proto`, `opentelemetry-exporter-collector`, `opentelemetry-exporter-prometheus`, `opentelemetry-metrics`
  * [#1588](https://github.com/open-telemetry/opentelemetry-js/pull/1588) Update to Proto v0.5.0 ([@obecny](https://github.com/obecny))
* `opentelemetry-core`, `opentelemetry-tracing`
  * [#1577](https://github.com/open-telemetry/opentelemetry-js/pull/1577) feat: implement parent based sampler ([@dyladan](https://github.com/dyladan))
* `opentelemetry-instrumentation`
  * [#1572](https://github.com/open-telemetry/opentelemetry-js/pull/1572) feat: adding function for checking wrapped into instrumentation ([@obecny](https://github.com/obecny))
* `opentelemetry-core`
  * [#1579](https://github.com/open-telemetry/opentelemetry-js/pull/1579) fix: correlation-context header ([@Asafb26](https://github.com/Asafb26))
  * [#1503](https://github.com/open-telemetry/opentelemetry-js/pull/1503) feat: add deep-merge util ([@naseemkullah](https://github.com/naseemkullah))
* `opentelemetry-exporter-prometheus`
  * [#1570](https://github.com/open-telemetry/opentelemetry-js/pull/1570) fix: make prometheus histogram export  cumulative ([@AndrewGrachov](https://github.com/AndrewGrachov))
* `opentelemetry-api`, `opentelemetry-core`, `opentelemetry-exporter-collector-proto`, `opentelemetry-exporter-collector`, `opentelemetry-exporter-jaeger`, `opentelemetry-exporter-prometheus`, `opentelemetry-exporter-zipkin`, `opentelemetry-metrics`, `opentelemetry-tracing`
  * [#1514](https://github.com/open-telemetry/opentelemetry-js/pull/1514) feat: add global error handler ([@mwear](https://github.com/mwear))
* `opentelemetry-api`, `opentelemetry-core`, `opentelemetry-node`, `opentelemetry-plugin-http`, `opentelemetry-plugin-https`, `opentelemetry-shim-opentracing`, `opentelemetry-tracing`
  * [#1527](https://github.com/open-telemetry/opentelemetry-js/pull/1527) feat(api): propagate spanContext only using API #1456 ([@vmarchaud](https://github.com/vmarchaud))
* `opentelemetry-node`, `opentelemetry-sdk-node`
  * [#1525](https://github.com/open-telemetry/opentelemetry-js/pull/1525) feat(node-tracer): use AsyncLocalStorageContextManager by default starting Node 14.8 #1511 ([@vmarchaud](https://github.com/vmarchaud))
* `opentelemetry-exporter-collector`, `opentelemetry-exporter-jaeger`, `opentelemetry-exporter-zipkin`, `opentelemetry-grpc-utils`, `opentelemetry-plugin-grpc-js`, `opentelemetry-plugin-grpc`, `opentelemetry-plugin-http`, `opentelemetry-plugin-https`
  * [#1548](https://github.com/open-telemetry/opentelemetry-js/pull/1548) chore(http): remove `x-opentelemetry-outgoing-request` header #1547 ([@vmarchaud](https://github.com/vmarchaud))
* Other
  * [#1553](https://github.com/open-telemetry/opentelemetry-js/pull/1553) docs: fix and update getting-started ([@svrnm](https://github.com/svrnm))
  * [#1550](https://github.com/open-telemetry/opentelemetry-js/pull/1550) EOL semantics by adding .gitattributes and changing tsconfig.json ([@MarkSeufert](https://github.com/MarkSeufert))
* `opentelemetry-api`, `opentelemetry-instrumentation`, `opentelemetry-node`
  * [#1540](https://github.com/open-telemetry/opentelemetry-js/pull/1540) Plugins refactoring - new instrumentation package for plugins ([@obecny](https://github.com/obecny))
* `opentelemetry-api`, `opentelemetry-tracing`
  * [#1555](https://github.com/open-telemetry/opentelemetry-js/pull/1555) chore: disallow null attribute values ([@dyladan](https://github.com/dyladan))
* `opentelemetry-resource-detector-aws`, `opentelemetry-resources`
  * [#1404](https://github.com/open-telemetry/opentelemetry-js/pull/1404) Feat: Added AWS ECS Plugins Resource Detector ([@EdZou](https://github.com/EdZou))
* `opentelemetry-node`
  * [#1543](https://github.com/open-telemetry/opentelemetry-js/pull/1543) feat: enable dns instrumentation by default ([@naseemkullah](https://github.com/naseemkullah))
  * [#1532](https://github.com/open-telemetry/opentelemetry-js/pull/1532) fix: decrease level of unsupported-version logs to warn ([@naseemkullah](https://github.com/naseemkullah))
* `opentelemetry-resources`, `opentelemetry-sdk-node`
  * [#1531](https://github.com/open-telemetry/opentelemetry-js/pull/1531) feat: process resource detector ([@mihirsoni](https://github.com/mihirsoni))
* `opentelemetry-api`, `opentelemetry-context-async-hooks`, `opentelemetry-context-base`, `opentelemetry-context-zone-peer-dep`, `opentelemetry-core`, `opentelemetry-shim-opentracing`, `opentelemetry-tracing`, `opentelemetry-web`
  * [#1515](https://github.com/open-telemetry/opentelemetry-js/pull/1515) chore: use interface for context types ([@dyladan](https://github.com/dyladan))
* `opentelemetry-exporter-zipkin`
  * [#1399](https://github.com/open-telemetry/opentelemetry-js/pull/1399) chore: refactoring zipkin to be able to use it in web ([@obecny](https://github.com/obecny))
* `opentelemetry-exporter-collector-grpc`, `opentelemetry-exporter-collector-proto`, `opentelemetry-exporter-collector`, `opentelemetry-exporter-jaeger`, `opentelemetry-exporter-prometheus`, `opentelemetry-exporter-zipkin`, `opentelemetry-metrics`, `opentelemetry-plugin-fetch`, `opentelemetry-plugin-xml-http-request`, `opentelemetry-tracing`
  * [#1439](https://github.com/open-telemetry/opentelemetry-js/pull/1439) unifying shutdown across code base ([@obecny](https://github.com/obecny))

### :bug: (Bug Fix)

* `opentelemetry-plugin-http`
  * [#1546](https://github.com/open-telemetry/opentelemetry-js/pull/1546) fix(http): do not set outgoing http span as active in the context #1479 ([@vmarchaud](https://github.com/vmarchaud))
* `opentelemetry-metrics`
  * [#1567](https://github.com/open-telemetry/opentelemetry-js/pull/1567) fix: histogram aggregator lastUpdateTime ([@AndrewGrachov](https://github.com/AndrewGrachov))
  * [#1470](https://github.com/open-telemetry/opentelemetry-js/pull/1470) IMPORTANT - Fixing collecting data from observers when using batch observer in first run ([@obecny](https://github.com/obecny))
* `opentelemetry-plugin-http`, `opentelemetry-plugin-https`
  * [#1551](https://github.com/open-telemetry/opentelemetry-js/pull/1551) fix: avoid circular require in plugins ([@dyladan](https://github.com/dyladan))
* `opentelemetry-context-async-hooks`
  * [#1530](https://github.com/open-telemetry/opentelemetry-js/pull/1530) fix: ignore TIMERWRAP in AsyncHooksContextManager ([@Flarna](https://github.com/Flarna))
* `opentelemetry-exporter-collector-grpc`, `opentelemetry-exporter-collector-proto`
  * [#1539](https://github.com/open-telemetry/opentelemetry-js/pull/1539) fix: include missing proto files in npm distribution ([@blumamir](https://github.com/blumamir))

### :books: (Refine Doc)

* Other
  * [#1536](https://github.com/open-telemetry/opentelemetry-js/pull/1536) chore: variable names cleanup ([@DarkPurple141](https://github.com/DarkPurple141))
* `opentelemetry-exporter-collector-proto`, `opentelemetry-exporter-collector`
  * [#1483](https://github.com/open-telemetry/opentelemetry-js/pull/1483) docs: change CollectorExporter to CollectorTraceExporter ([@Hongbo-Miao](https://github.com/Hongbo-Miao))

### :sparkles: (Feature)

* `opentelemetry-resource-detector-aws`, `opentelemetry-resources`
  * [#1404](https://github.com/open-telemetry/opentelemetry-js/pull/1404) Feat: Added AWS ECS Plugins Resource Detector ([@EdZou](https://github.com/EdZou))
* `opentelemetry-exporter-zipkin`
  * [#1399](https://github.com/open-telemetry/opentelemetry-js/pull/1399) chore: refactoring zipkin to be able to use it in web ([@obecny](https://github.com/obecny))

### Committers: 19

* Alex Hinds ([@DarkPurple141](https://github.com/DarkPurple141))
* Amir Blum ([@blumamir](https://github.com/blumamir))
* Andrew ([@AndrewGrachov](https://github.com/AndrewGrachov))
* Asaf Ben Aharon ([@Asafb26](https://github.com/Asafb26))
* Bartlomiej Obecny ([@obecny](https://github.com/obecny))
* Cong Zou ([@EdZou](https://github.com/EdZou))
* Daniel Dyla ([@dyladan](https://github.com/dyladan))
* Gerhard Stöbich ([@Flarna](https://github.com/Flarna))
* Hongbo Miao ([@Hongbo-Miao](https://github.com/Hongbo-Miao))
* Igor Morozov ([@morigs](https://github.com/morigs))
* Justin Walz ([@justinwalz](https://github.com/justinwalz))
* Mark ([@MarkSeufert](https://github.com/MarkSeufert))
* Matthew Wear ([@mwear](https://github.com/mwear))
* Mihir Soni ([@mihirsoni](https://github.com/mihirsoni))
* Naseem ([@naseemkullah](https://github.com/naseemkullah))
* Severin Neumann ([@svrnm](https://github.com/svrnm))
* Steve Flanders ([@flands](https://github.com/flands))
* Valentin Marchaud ([@vmarchaud](https://github.com/vmarchaud))
* legendecas ([@legendecas](https://github.com/legendecas))

## 0.11.0

### :boom: Breaking Change

* `opentelemetry-api`, `opentelemetry-core`, `opentelemetry-node`, `opentelemetry-plugin-http`, `opentelemetry-plugin-https`, `opentelemetry-sdk-node`, `opentelemetry-tracing`, `opentelemetry-web`
  * [#1458](https://github.com/open-telemetry/opentelemetry-js/pull/1458) refactor: rename HttpText to TextMap propagator ([@dengliming](https://github.com/dengliming))
* `opentelemetry-api`, `opentelemetry-core`, `opentelemetry-exporter-collector-grpc`, `opentelemetry-exporter-collector-proto`, `opentelemetry-exporter-collector`, `opentelemetry-metrics`
  * [#1446](https://github.com/open-telemetry/opentelemetry-js/pull/1446) Collector split ([@obecny](https://github.com/obecny))
* `opentelemetry-exporter-collector`, `opentelemetry-exporter-jaeger`, `opentelemetry-exporter-zipkin`, `opentelemetry-node`, `opentelemetry-resources`, `opentelemetry-web`
  * [#1419](https://github.com/open-telemetry/opentelemetry-js/pull/1419) chore!: refer to resource labels as attributes ([@mwear](https://github.com/mwear))

### :rocket: (Enhancement)

* `opentelemetry-api`, `opentelemetry-core`, `opentelemetry-shim-opentracing`, `opentelemetry-tracing`
  * [#1447](https://github.com/open-telemetry/opentelemetry-js/pull/1447) Move SpanContext isValid to the API ([@srjames90](https://github.com/srjames90))
* `opentelemetry-plugin-xml-http-request`
  * [#1476](https://github.com/open-telemetry/opentelemetry-js/pull/1476) Align xhr span name with spec ([@johnbley](https://github.com/johnbley))
* `opentelemetry-resource-detector-gcp`, `opentelemetry-sdk-node`
  * [#1469](https://github.com/open-telemetry/opentelemetry-js/pull/1469) chore: bump gcp-metadata ([@dyladan](https://github.com/dyladan))
* `opentelemetry-exporter-prometheus`
  * [#1310](https://github.com/open-telemetry/opentelemetry-js/pull/1310) feat: prometheus serializer ([@legendecas](https://github.com/legendecas))
  * [#1428](https://github.com/open-telemetry/opentelemetry-js/pull/1428) feat: Add missing prometheus exports for ValueRecorder, SumObserver & UpDownSumObserver ([@paulfairless](https://github.com/paulfairless))
* `opentelemetry-core`, `opentelemetry-tracing`
  * [#1344](https://github.com/open-telemetry/opentelemetry-js/pull/1344) feat: introduces ability to suppress tracing via context ([@michaelgoin](https://github.com/michaelgoin))
* `opentelemetry-api`, `opentelemetry-exporter-collector-proto`, `opentelemetry-plugin-http`, `opentelemetry-semantic-conventions`, `opentelemetry-tracing`
  * [#1372](https://github.com/open-telemetry/opentelemetry-js/pull/1372) feat: adding possibility of recording exception ([@obecny](https://github.com/obecny))
* `opentelemetry-api`, `opentelemetry-core`, `opentelemetry-exporter-collector-grpc`, `opentelemetry-exporter-collector-proto`, `opentelemetry-exporter-collector`, `opentelemetry-metrics`
  * [#1446](https://github.com/open-telemetry/opentelemetry-js/pull/1446) Collector split ([@obecny](https://github.com/obecny))
* `opentelemetry-metrics`
  * [#1366](https://github.com/open-telemetry/opentelemetry-js/pull/1366) fix: ignore non-number value on BaseBoundInstrument.update ([@legendecas](https://github.com/legendecas))
* `opentelemetry-node`
  * [#1440](https://github.com/open-telemetry/opentelemetry-js/pull/1440) fix: add Hapi and Koa to default supported plugins ([@carolinee21](https://github.com/carolinee21))
* `opentelemetry-resources`
  * [#1408](https://github.com/open-telemetry/opentelemetry-js/pull/1408) Feat: Migrate EC2 Plugin Resource Detector from IMDSv1 to IMDSv2 ([@EdZou](https://github.com/EdZou))
* `opentelemetry-core`
  * [#1349](https://github.com/open-telemetry/opentelemetry-js/pull/1349) feat: faster span and trace id generation ([@dyladan](https://github.com/dyladan))
* `opentelemetry-context-async-hooks`
  * [#1356](https://github.com/open-telemetry/opentelemetry-js/pull/1356) feat: use a symbol to store patched listeners ([@Flarna](https://github.com/Flarna))
* `opentelemetry-semantic-conventions`
  * [#1407](https://github.com/open-telemetry/opentelemetry-js/pull/1407) semantic conventions for operating system ([@obecny](https://github.com/obecny))
  * [#1409](https://github.com/open-telemetry/opentelemetry-js/pull/1409) removing semantic conventions from code coverage ([@obecny](https://github.com/obecny))
  * [#1388](https://github.com/open-telemetry/opentelemetry-js/pull/1388) chore: transpile semantic conventions to es5 ([@dyladan](https://github.com/dyladan))

### :bug: (Bug Fix)

* `opentelemetry-api`, `opentelemetry-metrics`
  * [#1373](https://github.com/open-telemetry/opentelemetry-js/pull/1373) fix: updates ValueRecorder to allow negative values ([@michaelgoin](https://github.com/michaelgoin))
* `opentelemetry-metrics`
  * [#1475](https://github.com/open-telemetry/opentelemetry-js/pull/1475) fix: proper histogram boundaries sort ([@AndrewGrachov](https://github.com/AndrewGrachov))
* `opentelemetry-core`
  * [#1336](https://github.com/open-telemetry/opentelemetry-js/pull/1336) fix: correlation context propagation extract for a single entry ([@rubenvp8510](https://github.com/rubenvp8510))
  * [#1406](https://github.com/open-telemetry/opentelemetry-js/pull/1406) Pass W3C Trace Context test suite at strictness 1 ([@michaelgoin](https://github.com/michaelgoin))
* `opentelemetry-context-base`
  * [#1387](https://github.com/open-telemetry/opentelemetry-js/pull/1387) fix: allow multiple instances of core to interact with context ([@dyladan](https://github.com/dyladan))

### :books: (Refine Doc)

* `opentelemetry-exporter-collector`
  * [#1432](https://github.com/open-telemetry/opentelemetry-js/pull/1432) docs(exporter-collector): CollectorTransportNode should be CollectorProtocolNode ([@Hongbo-Miao](https://github.com/Hongbo-Miao))
  * [#1361](https://github.com/open-telemetry/opentelemetry-js/pull/1361) chore: adding info about collector compatible version, removing duplicated doc after merge ([@obecny](https://github.com/obecny))
* `opentelemetry-metrics`
  * [#1427](https://github.com/open-telemetry/opentelemetry-js/pull/1427) chore: fix histogram type documentation ([@TigerHe7](https://github.com/TigerHe7))
* Other
  * [#1431](https://github.com/open-telemetry/opentelemetry-js/pull/1431) Fix typo in document. ([@dengliming](https://github.com/dengliming))

### Committers: 21

* Andrew ([@AndrewGrachov](https://github.com/AndrewGrachov))
* Bartlomiej Obecny ([@obecny](https://github.com/obecny))
* Cong Zou ([@EdZou](https://github.com/EdZou))
* Daniel Dyla ([@dyladan](https://github.com/dyladan))
* Gerhard Stöbich ([@Flarna](https://github.com/Flarna))
* Hongbo Miao ([@Hongbo-Miao](https://github.com/Hongbo-Miao))
* Igor Konforti ([@confiq](https://github.com/confiq))
* John Bley ([@johnbley](https://github.com/johnbley))
* Jonah Rosenblum ([@jonahrosenblum](https://github.com/jonahrosenblum))
* Mark Wolff ([@markwolff](https://github.com/markwolff))
* Matthew Wear ([@mwear](https://github.com/mwear))
* Michael Goin ([@michaelgoin](https://github.com/michaelgoin))
* Paul Fairless ([@paulfairless](https://github.com/paulfairless))
* Reginald McDonald ([@reggiemcdonald](https://github.com/reggiemcdonald))
* Ruben Vargas Palma ([@rubenvp8510](https://github.com/rubenvp8510))
* Sergio Regueira ([@sergioregueira](https://github.com/sergioregueira))
* Tiger He ([@TigerHe7](https://github.com/TigerHe7))
* [@carolinee21](https://github.com/carolinee21)
* [@dengliming](https://github.com/dengliming)
* [@srjames90](https://github.com/srjames90)
* legendecas ([@legendecas](https://github.com/legendecas))

## 0.10.2

### :rocket: (Enhancement)

* `opentelemetry-core`, `opentelemetry-tracing`
  * [#1331](https://github.com/open-telemetry/opentelemetry-js/pull/1331) Feat: Make ID generator configurable ([@EdZou](https://github.com/EdZou))
* `opentelemetry-api`, `opentelemetry-context-base`
  * [#1368](https://github.com/open-telemetry/opentelemetry-js/pull/1368) feat(api/context-base): change compile target to es5 ([@markwolff](https://github.com/markwolff))

### Committers: 3

* Cong Zou ([@EdZou](https://github.com/EdZou))
* Mark Wolff ([@markwolff](https://github.com/markwolff))
* Reginald McDonald ([@reggiemcdonald](https://github.com/reggiemcdonald))

## 0.10.1

### :bug: (Bug Fix)

* `opentelemetry-plugin-grpc-js`
  * [#1358](https://github.com/open-telemetry/opentelemetry-js/pull/1358) fix: add missing grpc-js index ([@dyladan](https://github.com/dyladan))

### Committers: 1

* Daniel Dyla ([@dyladan](https://github.com/dyladan))

## 0.10.0

### :boom: Breaking Change

* `opentelemetry-exporter-collector`, `opentelemetry-metrics`
  * [#1292](https://github.com/open-telemetry/opentelemetry-js/pull/1292) feat: remove HistogramAggregator.reset ([@legendecas](https://github.com/legendecas))
* `opentelemetry-api`, `opentelemetry-exporter-prometheus`, `opentelemetry-metrics`
  * [#1137](https://github.com/open-telemetry/opentelemetry-js/pull/1137) Batch observer ([@obecny](https://github.com/obecny))
* `opentelemetry-exporter-collector`
  * [#1256](https://github.com/open-telemetry/opentelemetry-js/pull/1256) feat: [Collector Metric Exporter][1/x] Rename CollectorExporter to CollectorTraceExporter  ([@davidwitten](https://github.com/davidwitten))

### :rocket: (Enhancement)

* `opentelemetry-exporter-collector`
  * [#1339](https://github.com/open-telemetry/opentelemetry-js/pull/1339) Proto update to latest to support arrays and maps ([@obecny](https://github.com/obecny))
  * [#1302](https://github.com/open-telemetry/opentelemetry-js/pull/1302) feat: adding proto over http for collector exporter ([@obecny](https://github.com/obecny))
  * [#1247](https://github.com/open-telemetry/opentelemetry-js/pull/1247) feat: adding json over http for collector exporter ([@obecny](https://github.com/obecny))
* `opentelemetry-core`, `opentelemetry-metrics`, `opentelemetry-tracing`
  * [#974](https://github.com/open-telemetry/opentelemetry-js/pull/974) feat: add OTEL_LOG_LEVEL env var ([@naseemkullah](https://github.com/naseemkullah))
* `opentelemetry-metrics`, `opentelemetry-node`, `opentelemetry-sdk-node`
  * [#1187](https://github.com/open-telemetry/opentelemetry-js/pull/1187) Add nodejs sdk package ([@dyladan](https://github.com/dyladan))
* `opentelemetry-shim-opentracing`
  * [#918](https://github.com/open-telemetry/opentelemetry-js/pull/918) feat: add baggage support to the opentracing shim ([@rubenvp8510](https://github.com/rubenvp8510))
* `opentelemetry-tracing`
  * [#1069](https://github.com/open-telemetry/opentelemetry-js/pull/1069) feat: add OTEL_SAMPLING_PROBABILITY env var ([@naseemkullah](https://github.com/naseemkullah))
  * [#1296](https://github.com/open-telemetry/opentelemetry-js/pull/1296) feat: force flush and shutdown callback for span exporters ([@dyladan](https://github.com/dyladan))
* `opentelemetry-node`
  * [#1343](https://github.com/open-telemetry/opentelemetry-js/pull/1343) feat(grpc-js): enable autoinstrumentation by default ([@markwolff](https://github.com/markwolff))
* `opentelemetry-exporter-collector`, `opentelemetry-exporter-prometheus`, `opentelemetry-metrics`
  * [#1276](https://github.com/open-telemetry/opentelemetry-js/pull/1276) chore: updating aggregator MinMaxLastSumCount and use it for value observer and value recorder ([@obecny](https://github.com/obecny))
* `opentelemetry-plugin-fetch`, `opentelemetry-plugin-xml-http-request`, `opentelemetry-semantic-conventions`, `opentelemetry-web`
  * [#1262](https://github.com/open-telemetry/opentelemetry-js/pull/1262) feat(opentelemetry-web): capture decodedBodySize / http.response_content_length ([@johnbley](https://github.com/johnbley))
* `opentelemetry-resources`
  * [#1211](https://github.com/open-telemetry/opentelemetry-js/pull/1211) Resource auto detection logging ([@adamegyed](https://github.com/adamegyed))
* `opentelemetry-api`, `opentelemetry-exporter-prometheus`, `opentelemetry-metrics`
  * [#1137](https://github.com/open-telemetry/opentelemetry-js/pull/1137) Batch observer ([@obecny](https://github.com/obecny))
* `opentelemetry-core`
  * [#1191](https://github.com/open-telemetry/opentelemetry-js/pull/1191) Add platform agnostic way to read environment variables ([@obecny](https://github.com/obecny))
* `opentelemetry-context-async-hooks`
  * [#1210](https://github.com/open-telemetry/opentelemetry-js/pull/1210) AsyncLocalStorage based ContextManager ([@johanneswuerbach](https://github.com/johanneswuerbach))
* `opentelemetry-api`, `opentelemetry-context-async-hooks`, `opentelemetry-context-base`, `opentelemetry-context-zone-peer-dep`, `opentelemetry-context-zone`, `opentelemetry-core`, `opentelemetry-exporter-collector`, `opentelemetry-exporter-jaeger`, `opentelemetry-exporter-prometheus`, `opentelemetry-exporter-zipkin`, `opentelemetry-metrics`, `opentelemetry-node`, `opentelemetry-plugin-fetch`, `opentelemetry-plugin-grpc-js`, `opentelemetry-plugin-grpc`, `opentelemetry-plugin-http`, `opentelemetry-plugin-https`, `opentelemetry-plugin-xml-http-request`, `opentelemetry-resources`, `opentelemetry-semantic-conventions`, `opentelemetry-shim-opentracing`, `opentelemetry-tracing`, `opentelemetry-web`
  * [#1237](https://github.com/open-telemetry/opentelemetry-js/pull/1237) fix(package.json): publish source maps ([@markwolff](https://github.com/markwolff))
* `opentelemetry-core`, `opentelemetry-exporter-collector`, `opentelemetry-exporter-jaeger`, `opentelemetry-exporter-zipkin`, `opentelemetry-metrics`, `opentelemetry-tracing`
  * [#1171](https://github.com/open-telemetry/opentelemetry-js/pull/1171) feat: add instrumentation library and update collector exporter ([@mwear](https://github.com/mwear))
* `opentelemetry-plugin-xml-http-request`
  * [#1216](https://github.com/open-telemetry/opentelemetry-js/pull/1216) Increase Test Coverage for XML Http Plugin ([@thgao](https://github.com/thgao))
* `opentelemetry-core`, `opentelemetry-node`, `opentelemetry-tracing`, `opentelemetry-web`
  * [#1218](https://github.com/open-telemetry/opentelemetry-js/pull/1218) fix: change default propagator to match spec ([@jonahrosenblum](https://github.com/jonahrosenblum))

### :bug: (Bug Fix)

* `opentelemetry-plugin-grpc`
  * [#1289](https://github.com/open-telemetry/opentelemetry-js/pull/1289) fix(grpc): camelCase methods can be double patched ([@markwolff](https://github.com/markwolff))
* `opentelemetry-plugin-fetch`
  * [#1274](https://github.com/open-telemetry/opentelemetry-js/pull/1274) fix: do not crash on fetch(new Request(url)) ([@dyladan](https://github.com/dyladan))
* `opentelemetry-core`
  * [#1269](https://github.com/open-telemetry/opentelemetry-js/pull/1269) fix(opentelemetry-core): modify regex to allow future versions ([@srjames90](https://github.com/srjames90))
* `opentelemetry-exporter-collector`
  * [#1254](https://github.com/open-telemetry/opentelemetry-js/pull/1254) fix: default url for otelcol ([@jufab](https://github.com/jufab))

### :books: (Refine Doc)

* `opentelemetry-metrics`
  * [#1239](https://github.com/open-telemetry/opentelemetry-js/pull/1239) chore: update metrics example with UpDownCounter ([@mayurkale22](https://github.com/mayurkale22))
* `opentelemetry-exporter-jaeger`
  * [#1234](https://github.com/open-telemetry/opentelemetry-js/pull/1234) docs: add note about endpoint config option ([@danielmbarlow](https://github.com/danielmbarlow))
* `opentelemetry-api`
  * [#1231](https://github.com/open-telemetry/opentelemetry-js/pull/1231) fix(jsdoc): change null to undefined ([@markwolff](https://github.com/markwolff))

### :sparkles: (Feature)

* `opentelemetry-api`, `opentelemetry-metrics`
  * [#1272](https://github.com/open-telemetry/opentelemetry-js/pull/1272) feat: adding new metric: up down sum observer ([@obecny](https://github.com/obecny))

### Committers: 21

* Adam Egyed ([@adamegyed](https://github.com/adamegyed))
* Aravin ([@aravinsiva](https://github.com/aravinsiva))
* Bartlomiej Obecny ([@obecny](https://github.com/obecny))
* Bryan Clement ([@lykkin](https://github.com/lykkin))
* Connor Lindsey ([@connorlindsey](https://github.com/connorlindsey))
* Daniel Dyla ([@dyladan](https://github.com/dyladan))
* Daniel M Barlow ([@danielmbarlow](https://github.com/danielmbarlow))
* David W. ([@davidwitten](https://github.com/davidwitten))
* Johannes Würbach ([@johanneswuerbach](https://github.com/johanneswuerbach))
* John Bley ([@johnbley](https://github.com/johnbley))
* Jonah Rosenblum ([@jonahrosenblum](https://github.com/jonahrosenblum))
* Julien FABRE ([@jufab](https://github.com/jufab))
* Mark Wolff ([@markwolff](https://github.com/markwolff))
* Matthew Wear ([@mwear](https://github.com/mwear))
* Mayur Kale ([@mayurkale22](https://github.com/mayurkale22))
* Naseem ([@naseemkullah](https://github.com/naseemkullah))
* Ruben Vargas Palma ([@rubenvp8510](https://github.com/rubenvp8510))
* Shivkanya Andhare ([@shivkanya9146](https://github.com/shivkanya9146))
* Tina Gao ([@thgao](https://github.com/thgao))
* [@srjames90](https://github.com/srjames90)
* legendecas ([@legendecas](https://github.com/legendecas))

## 0.9.0

### :boom: Breaking Change

* `opentelemetry-api`, `opentelemetry-exporter-prometheus`, `opentelemetry-metrics`
  * [#1120](https://github.com/open-telemetry/opentelemetry-js/pull/1120) feat: add the UpDownCounter instrument ([@mayurkale22](https://github.com/mayurkale22))
  * [#1126](https://github.com/open-telemetry/opentelemetry-js/pull/1126) feat!: remove label keys as they are no longer part of the spec ([@naseemkullah](https://github.com/naseemkullah))
* `opentelemetry-api`, `opentelemetry-metrics`
  * [#1117](https://github.com/open-telemetry/opentelemetry-js/pull/1117) chore: rename meaure to value recorder ([@dyladan](https://github.com/dyladan))
* `opentelemetry-api`, `opentelemetry-core`, `opentelemetry-tracing`
  * [#1058](https://github.com/open-telemetry/opentelemetry-js/pull/1058) feat: spec compliant sampling result support ([@legendecas](https://github.com/legendecas))

### :rocket: (Enhancement)

* Other
  * [#1181](https://github.com/open-telemetry/opentelemetry-js/pull/1181) feat: add node-plugins-all package ([@dyladan](https://github.com/dyladan))
* `opentelemetry-plugin-fetch`, `opentelemetry-plugin-xml-http-request`, `opentelemetry-web`
  * [#1121](https://github.com/open-telemetry/opentelemetry-js/pull/1121) chore: adding plugin-fetch and example ([@obecny](https://github.com/obecny))
* `opentelemetry-node`
  * [#1153](https://github.com/open-telemetry/opentelemetry-js/pull/1153) feat: add OPENTELEMETRY_NO_PATCH_MODULES ([@markwolff](https://github.com/markwolff))
  * [#1151](https://github.com/open-telemetry/opentelemetry-js/pull/1151) chore(todo): add missing span sampling test ([@markwolff](https://github.com/markwolff))
* `opentelemetry-exporter-jaeger`
  * [#965](https://github.com/open-telemetry/opentelemetry-js/pull/965) feat(opentelemetry-exporter-jaeger): http sender ([@leonardodalcin](https://github.com/leonardodalcin))
* `opentelemetry-exporter-zipkin`
  * [#1138](https://github.com/open-telemetry/opentelemetry-js/pull/1138) feat(opentelemetry-js): infer zipkin service name from resource ([@rezakrimi](https://github.com/rezakrimi))
* `opentelemetry-plugin-xml-http-request`
  * [#1133](https://github.com/open-telemetry/opentelemetry-js/pull/1133) fix(plugin-xml-http-request): support sync requests ([@johnbley](https://github.com/johnbley))
* `opentelemetry-metrics`
  * [#1145](https://github.com/open-telemetry/opentelemetry-js/pull/1145) chore: creating new metric kind ([@obecny](https://github.com/obecny))
* `opentelemetry-exporter-collector`
  * [#1204](https://github.com/open-telemetry/opentelemetry-js/pull/1204) feat: collector exporter custom headers and metadata ([@mwear](https://github.com/mwear))
* `opentelemetry-exporter-zipkin`
  * [#1202](https://github.com/open-telemetry/opentelemetry-js/pull/1202) Adds possibility to set headers to zipkin exporter ([@obecny](https://github.com/obecny))

### :bug: (Bug Fix)

* `opentelemetry-exporter-collector`
  * [#1197](https://github.com/open-telemetry/opentelemetry-js/pull/1197) fix(exporter-collector): default endpoint for node and browser ([@davidwitten](https://github.com/davidwitten))
* `opentelemetry-context-zone-peer-dep`
  * [#1209](https://github.com/open-telemetry/opentelemetry-js/pull/1209) chore: fixing zone from which to fork a new zone ([@obecny](https://github.com/obecny))

### :sparkles: (Feature)

* `opentelemetry-semantic-conventions`
  * [#1160](https://github.com/open-telemetry/opentelemetry-js/pull/1160) refactor(attributes): move enums to @opentelemetry/semantic-conventions ([@markwolff](https://github.com/markwolff))

### :books: (Refine Doc)

* Other
  * [#1192](https://github.com/open-telemetry/opentelemetry-js/pull/1192) Fix_typo ([@shivkanya9146](https://github.com/shivkanya9146))
  * [#1147](https://github.com/open-telemetry/opentelemetry-js/pull/1147) ci: lint markdown files ([@naseemkullah](https://github.com/naseemkullah))
  * [#1142](https://github.com/open-telemetry/opentelemetry-js/pull/1142) chore: template prometheus endpoint in examples rather than hardcode ([@naseemkullah](https://github.com/naseemkullah))
  * [#1217](https://github.com/open-telemetry/opentelemetry-js/pull/1217) chore: fix markdown linting and add npm script ([@dyladan](https://github.com/dyladan))

### Committers: 13

* David W. ([@davidwitten](https://github.com/davidwitten))
* Bartlomiej Obecny ([@obecny](https://github.com/obecny))
* Daniel Dyla ([@dyladan](https://github.com/dyladan))
* Mark Wolff ([@markwolff](https://github.com/markwolff))
* Mayur Kale ([@mayurkale22](https://github.com/mayurkale22))
* Naseem ([@naseemkullah](https://github.com/naseemkullah))
* Valentin Marchaud ([@vmarchaud](https://github.com/vmarchaud))
* legendecas ([@legendecas](https://github.com/legendecas))
* Shivkanya Andhare ([@shivkanya9146](https://github.com/shivkanya9146))
* Leonardo Dalcin ([@leonardodalcin](https://github.com/leonardodalcin))
* [@rezakrimi](https://github.com/rezakrimi)
* John Bley ([@johnbley](https://github.com/johnbley))
* Matthew Wear ([@mwear](https://github.com/mwear))

## 0.8.3

### :rocket: (Enhancement)

* `opentelemetry-node`
  * [#980](https://github.com/open-telemetry/opentelemetry-js/pull/980) feat: merge user supplied and default plugin configs ([@naseemkullah](https://github.com/naseemkullah))

### :bug: (Bug Fix)

* `opentelemetry-context-async-hooks`
  * [#1099](https://github.com/open-telemetry/opentelemetry-js/pull/1099) fix(asynchooks-scope): fix context loss using .with() #1101 ([@vmarchaud](https://github.com/vmarchaud))

### :books: (Refine Doc)

* Other
  * [#1100](https://github.com/open-telemetry/opentelemetry-js/pull/1100) docs(batcher): document how to configure custom aggregators #989 ([@vmarchaud](https://github.com/vmarchaud))
* `opentelemetry-api`
  * [#1106](https://github.com/open-telemetry/opentelemetry-js/pull/1106) chore: improve API documentation ([@mayurkale22](https://github.com/mayurkale22))

### Committers: 7

* Bartlomiej Obecny ([@obecny](https://github.com/obecny))
* Daniel Dyla ([@dyladan](https://github.com/dyladan))
* Kanika Shah ([@kanikashah90](https://github.com/kanikashah90))
* Mayur Kale ([@mayurkale22](https://github.com/mayurkale22))
* Naseem ([@naseemkullah](https://github.com/naseemkullah))
* Valentin Marchaud ([@vmarchaud](https://github.com/vmarchaud))
* [@shivkanya9146](https://github.com/shivkanya9146)

## 0.8.2

### :rocket: (Enhancement)

* `opentelemetry-exporter-collector`
  * [#1063](https://github.com/open-telemetry/opentelemetry-js/pull/1063) feat: exporter collector TLS option ([@mzahor](https://github.com/mzahor))
* `opentelemetry-core`
  * [#838](https://github.com/open-telemetry/opentelemetry-js/pull/838) feat: implement W3C Correlation Context propagator ([@rubenvp8510](https://github.com/rubenvp8510))

### :bug: (Bug Fix)

* `opentelemetry-api`
  * [#1067](https://github.com/open-telemetry/opentelemetry-js/pull/1067) fix: missing `global` in browser environments ([@legendecas](https://github.com/legendecas))

### :books: (Refine Doc)

* Other
  * [#1057](https://github.com/open-telemetry/opentelemetry-js/pull/1057) chore: add examples README.md ([@mayurkale22](https://github.com/mayurkale22))
* `opentelemetry-core`
  * [#1080](https://github.com/open-telemetry/opentelemetry-js/pull/1080) docs: document CorrelationContext propagator under Built-in Implement… ([@rubenvp8510](https://github.com/rubenvp8510))

### Committers: 5

* Marian Zagoruiko ([@mzahor](https://github.com/mzahor))
* Mayur Kale ([@mayurkale22](https://github.com/mayurkale22))
* Olivier Albertini ([@OlivierAlbertini](https://github.com/OlivierAlbertini))
* Ruben Vargas Palma ([@rubenvp8510](https://github.com/rubenvp8510))
* legendecas ([@legendecas](https://github.com/legendecas))

## 0.8.1

### :rocket: (Enhancement)

* Other
  * [#1050](https://github.com/open-telemetry/opentelemetry-js/pull/1050) feat: add plugin metapackages ([@dyladan](https://github.com/dyladan))
* `opentelemetry-resources`
  * [#1055](https://github.com/open-telemetry/opentelemetry-js/pull/1055) chore(opentelemetry-resources): add instance type and az to aws detector ([@justinwalz](https://github.com/justinwalz))
* `opentelemetry-plugin-http`
  * [#963](https://github.com/open-telemetry/opentelemetry-js/pull/963) feat(plugin-http): add plugin hooks before processing req and res ([@BlumAmir](https://github.com/BlumAmir))
* `opentelemetry-metrics`
  * [#1049](https://github.com/open-telemetry/opentelemetry-js/pull/1049) chore: pipe resource through to MetricRecord ([@mwear](https://github.com/mwear))
* `opentelemetry-api`, `opentelemetry-metrics`
  * [#1032](https://github.com/open-telemetry/opentelemetry-js/pull/1032) Make Labels Optional for CounterMetric::add ([@astorm](https://github.com/astorm))

### :bug: (Bug Fix)

* `opentelemetry-plugin-http`
  * [#1060](https://github.com/open-telemetry/opentelemetry-js/pull/1060) fix(http-plugin): don't modify user's headers object in plugin ([@BlumAmir](https://github.com/BlumAmir))
* `opentelemetry-exporter-collector`
  * [#1053](https://github.com/open-telemetry/opentelemetry-js/pull/1053) fix: include proto files in deployment package ([@dyladan](https://github.com/dyladan))

### :books: (Refine Doc)

* Other
  * [#1065](https://github.com/open-telemetry/opentelemetry-js/pull/1065) style: format README ([@naseemkullah](https://github.com/naseemkullah))
  * [#1064](https://github.com/open-telemetry/opentelemetry-js/pull/1064) chore: update README ([@mayurkale22](https://github.com/mayurkale22))
  * [#1051](https://github.com/open-telemetry/opentelemetry-js/pull/1051) chore: deploy docs using github action ([@dyladan](https://github.com/dyladan))
* `opentelemetry-exporter-prometheus`
  * [#1056](https://github.com/open-telemetry/opentelemetry-js/pull/1056) fix readme: setting labelKeys when creating the counter ([@luebken](https://github.com/luebken))

### Committers: 9

* Alan Storm ([@astorm](https://github.com/astorm))
* Amir Blum ([@BlumAmir](https://github.com/BlumAmir))
* Daniel Dyla ([@dyladan](https://github.com/dyladan))
* Justin Walz ([@justinwalz](https://github.com/justinwalz))
* Matthew Wear ([@mwear](https://github.com/mwear))
* Matthias Lübken ([@luebken](https://github.com/luebken))
* Mayur Kale ([@mayurkale22](https://github.com/mayurkale22))
* Naseem ([@naseemkullah](https://github.com/naseemkullah))
* [@shivkanya9146](https://github.com/shivkanya9146)

## 0.8.0

Released 2020-05-12

### :boom: Breaking Change

* `opentelemetry-api`, `opentelemetry-metrics`
  * [#1001](https://github.com/open-telemetry/opentelemetry-js/pull/1001) fix: observers should not expose bind/unbind method ([@legendecas](https://github.com/legendecas))

### :bug: (Bug Fix)

* `opentelemetry-plugin-http`
  * [#984](https://github.com/open-telemetry/opentelemetry-js/pull/984) fix(http-plugin): strip otel custom http header #983 ([@vmarchaud](https://github.com/vmarchaud))
* `opentelemetry-core`
  * [#1021](https://github.com/open-telemetry/opentelemetry-js/pull/1021) fix: left pad short b3 trace identifiers ([@dyladan](https://github.com/dyladan))
* `opentelemetry-plugin-xml-http-reques`
  * [#1002](https://github.com/open-telemetry/opentelemetry-js/pull/1002) fix(opentelemetry-plugin-xml-http-request): define span kind as CLIENT for xmlhttprequests ([@ivansenic](https://github.com/ivansenic))
* `opentelemetry-plugin-grpc`
  * [#1005](https://github.com/open-telemetry/opentelemetry-js/pull/1005) fix: add missing error status handler ([@markwolff](https://github.com/markwolff))
* `opentelemetry-exporter-collector`
  * [#1008](https://github.com/open-telemetry/opentelemetry-js/pull/1008) fix: permission denied error when cloning submodules ([@sleighzy](https://github.com/sleighzy))

### :rocket: (Enhancement)

* `opentelemetry-exporter-zipkin`, `opentelemetry-plugin-http`, `opentelemetry-tracing`
  * [#1037](https://github.com/open-telemetry/opentelemetry-js/pull/1037) fix(tracing): span processor should receive a readable span as parameters ([@legendecas](https://github.com/legendecas))
* `opentelemetry-tracing`
  * [#1024](https://github.com/open-telemetry/opentelemetry-js/pull/1024) fix: multi span processor should flush child span processors ([@legendecas](https://github.com/legendecas))
* `opentelemetry-metrics`, `opentelemetry-tracing`
  * [#1015](https://github.com/open-telemetry/opentelemetry-js/pull/1015) fix: prevent duplicated resource creation ([@legendecas](https://github.com/legendecas))
* `opentelemetry-metrics`
  * [#1014](https://github.com/open-telemetry/opentelemetry-js/pull/1014) feat(metrics): use MetricDescriptor to determine aggregator #989 ([@vmarchaud](https://github.com/vmarchaud))
* `opentelemetry-plugin-http`
  * [#948](https://github.com/open-telemetry/opentelemetry-js/pull/948) feat(http-plugin): add options to disable new spans if no parent ([@vmarchaud](https://github.com/vmarchaud))
* `opentelemetry-api`, `opentelemetry-node`, `opentelemetry-plugin-grpc`, `opentelemetry-plugin-http`, `opentelemetry-plugin-https`, `opentelemetry-plugin-xml-http-request`, `opentelemetry-tracing`, `opentelemetry-web`
  * [#943](https://github.com/open-telemetry/opentelemetry-js/pull/943) Use global API instances ([@dyladan](https://github.com/dyladan))
* `opentelemetry-api`
  * [#1016](https://github.com/open-telemetry/opentelemetry-js/pull/1016) refactor: normalize namespace import name for @opentelemetry/api ([@legendecas](https://github.com/legendecas))
* `opentelemetry-core`, `opentelemetry-base`
  * [#991](https://github.com/open-telemetry/opentelemetry-js/pull/991) refactor: merge opentelemetry-base to opentelemetry-core ([@legendecas](https://github.com/legendecas))
* `opentelemetry-core`
  * [#981](https://github.com/open-telemetry/opentelemetry-js/pull/981) chore: splitting BasePlugin into browser and node ([@obecny](https://github.com/obecny))

### :books: (Refine Doc)

* Other
  * [#1003](https://github.com/open-telemetry/opentelemetry-js/pull/1003) chore: test on node 14 ([@dyladan](https://github.com/dyladan))
  * [#990](https://github.com/open-telemetry/opentelemetry-js/pull/990) fix(opentracing-shim): update opentracing shim example ([@sleighzy](https://github.com/sleighzy))

### Committers: 7

* legendecas ([@legendecas](https://github.com/legendecas))
* Valentin Marchaud ([@vmarchaud](https://github.com/vmarchaud))
* Daniel Dyla ([@dyladan](https://github.com/dyladan))
* Ivan Senic ([@ivansenic](https://github.com/ivansenic))
* Mark Wolff ([@markwolff](https://github.com/markwolff))
* Simon Leigh ([@sleighzy](https://github.com/sleighzy))
* Bartlomiej Obecny ([@obecny](https://github.com/obecny))

## 0.7.0

Released 2020-04-23

### :boom: Breaking Change

* `opentelemetry-exporter-collector`
  * [#901](https://github.com/open-telemetry/opentelemetry-js/pull/901) grpc for node and support for new proto format for node and browser ([@obecny](https://github.com/obecny))
* `opentelemetry-api`, `opentelemetry-metrics`
  * [#964](https://github.com/open-telemetry/opentelemetry-js/pull/964) chore: adding metric observable to be able to support async update ([@obecny](https://github.com/obecny))

### :bug: (Bug Fix)

* `opentelemetry-plugin-http`
  * [#960](https://github.com/open-telemetry/opentelemetry-js/pull/960) [http] fix: use url.URL ([@naseemkullah](https://github.com/naseemkullah))
* `opentelemetry-core`
  * [#977](https://github.com/open-telemetry/opentelemetry-js/pull/977) fix(B3Propagator): B3 sampled causing gRPC error ([@mayurkale22](https://github.com/mayurkale22))

### :rocket: (Enhancement)

* `opentelemetry-resources`
  * [#899](https://github.com/open-telemetry/opentelemetry-js/pull/899) feat: resource auto-detection ([@mwear](https://github.com/mwear))
* `opentelemetry-metrics`
  * [#930](https://github.com/open-telemetry/opentelemetry-js/pull/930) feat(aggregators): implement histogram aggregator ([@vmarchaud](https://github.com/vmarchaud))

### Committers: 5

* Naseem ([@naseemkullah](https://github.com/naseemkullah))
* Matthew Wear ([@mwear](https://github.com/mwear))
* Bartlomiej Obecny ([@obecny](https://github.com/obecny))
* Mayur Kale ([@mayurkale22](https://github.com/mayurkale22))
* Valentin Marchaud ([@vmarchaud](https://github.com/vmarchaud))

## 0.6.1

Released 2020-04-08

### :rocket: (Enhancement)

* `opentelemetry-exporter-jaeger`
  * [#924](https://github.com/open-telemetry/opentelemetry-js/pull/924) [Jaeger-Exporter] host default env var ([@naseemkullah](https://github.com/naseemkullah))
* `opentelemetry-metrics`
  * [#933](https://github.com/open-telemetry/opentelemetry-js/pull/933) feat(meter): allow custom batcher #932 ([@vmarchaud](https://github.com/vmarchaud))

### :bug: (Bug Fix)

* `opentelemetry-plugin-http`
  * [#946](https://github.com/open-telemetry/opentelemetry-js/pull/946) Remove bad null check ([@dyladan](https://github.com/dyladan))
* `opentelemetry-exporter-prometheus`, `opentelemetry-metrics`
  * [#941](https://github.com/open-telemetry/opentelemetry-js/pull/941) fix: do not clear other labelsets when updating metrics ([@dyladan](https://github.com/dyladan))

### :books: (Refine Doc)

* `opentelemetry-propagator-jaeger`
  * [#937](https://github.com/open-telemetry/opentelemetry-js/pull/937) fix: Jaeger propagator example of usage" ([@shivkanya9146](https://github.com/shivkanya9146))

### Committers: 4

* Daniel Dyla ([@dyladan](https://github.com/dyladan))
* Naseem ([@naseemkullah](https://github.com/naseemkullah))
* Valentin Marchaud ([@vmarchaud](https://github.com/vmarchaud))
* [@shivkanya9146](https://github.com/shivkanya9146)

## 0.6.0

Released 2020-04-01

### :boom: Breaking Change

* `opentelemetry-api`, `opentelemetry-metrics`
  * [#915](https://github.com/open-telemetry/opentelemetry-js/pull/915) Remove label set from metrics API ([@mayurkale22](https://github.com/mayurkale22))

### :rocket: (Enhancement)

* `opentelemetry-tracing`
  * [#913](https://github.com/open-telemetry/opentelemetry-js/pull/913) chore: remove unused default argument in Tracer ([@Flarna](https://github.com/Flarna))
* `opentelemetry-exporter-jaeger`
  * [#916](https://github.com/open-telemetry/opentelemetry-js/pull/916) chore: removing force flush ([@obecny](https://github.com/obecny))

### :books: (Refine Doc)

* `opentelemetry-node`
  * [#921](https://github.com/open-telemetry/opentelemetry-js/pull/921) chore: fix Require Path in README [@shivkanya9146](https://github.com/shivkanya9146))

### Committers: 4

* Mayur Kale ([@mayurkale22](https://github.com/mayurkale22))
* Bartlomiej Obecny ([@obecny](https://github.com/obecny))
* Gerhard Stöbich ([@Flarna](https://github.com/Flarna))
* Shivkanya Andhare ([@shivkanya9146](https://github.com/shivkanya9146))

## 0.5.2

Released 2020-03-27

### :rocket: (Enhancement)

* `opentelemetry-exporter-prometheus`, `opentelemetry-metrics`
  * [#893](https://github.com/open-telemetry/opentelemetry-js/pull/893) Metrics: Add lastUpdateTimestamp associated with point ([@mayurkale22](https://github.com/mayurkale22))
* `opentelemetry-tracing`
  * [#896](https://github.com/open-telemetry/opentelemetry-js/pull/896) Do not export empty span lists ([@dyladan](https://github.com/dyladan))
* `opentelemetry-api`, `opentelemetry-tracing`
  * [#889](https://github.com/open-telemetry/opentelemetry-js/pull/889) feat: start a root span with spanOptions.parent = null ([@dyladan](https://github.com/dyladan))

### :bug: (Bug Fix)

* `opentelemetry-core`, `opentelemetry-propagator-jaeger`
  * [#904](https://github.com/open-telemetry/opentelemetry-js/pull/904) fix: add type checking in propagators ([@dyladan](https://github.com/dyladan))
* `opentelemetry-context-base`, `opentelemetry-core`, `opentelemetry-plugin-document-load`, `opentelemetry-plugin-user-interaction`, `opentelemetry-web`
  * [#906](https://github.com/open-telemetry/opentelemetry-js/pull/906) chore: fixing documentation for web tracer provider, fixing examples … ([@obecny](https://github.com/obecny))
* Other
  * [#884](https://github.com/open-telemetry/opentelemetry-js/pull/884) chore: fixing main package.json version ([@obecny](https://github.com/obecny))

### :books: (Refine Doc)

* `opentelemetry-context-base`, `opentelemetry-core`, `opentelemetry-plugin-document-load`, `opentelemetry-plugin-user-interaction`, `opentelemetry-web`
  * [#906](https://github.com/open-telemetry/opentelemetry-js/pull/906) chore: fixing documentation for web tracer provider, fixing examples … ([@obecny](https://github.com/obecny))

### Committers: 4

* Bartlomiej Obecny ([@obecny](https://github.com/obecny))
* Daniel Dyla ([@dyladan](https://github.com/dyladan))
* Mark Robert Henderson ([@aphelionz](https://github.com/aphelionz))
* Mayur Kale ([@mayurkale22](https://github.com/mayurkale22))

## 0.5.1

Released 2020-03-19

### :bug: (Bug Fix)

* `opentelemetry-web`
  * [#873](https://github.com/open-telemetry/opentelemetry-js/pull/873) Remove unnecessary `this` overwrite in stack context manager ([@dyladan](https://github.com/dyladan))
* `opentelemetry-plugin-mysql`
  * [#880](https://github.com/open-telemetry/opentelemetry-js/pull/880) Do not multiwrap pool queries ([@dyladan](https://github.com/dyladan))
* `opentelemetry-metrics`
  * [#881](https://github.com/open-telemetry/opentelemetry-js/pull/881)  fix: @opentelemetry/metrics fails to run due to bad import ([@mayurkale22](https://github.com/mayurkale22))

### Committers: 2

* Daniel Dyla ([@dyladan](https://github.com/dyladan))
* Mayur Kale ([@mayurkale22](https://github.com/mayurkale22))

## 0.5.0

Released 2020-03-16

### This is a first official beta release, which provides almost fully complete metrics, tracing, and context propagation functionality but makes no promises around breaking changes

### :boom: Breaking Change

* [#853](https://github.com/open-telemetry/opentelemetry-js/pull/853) Rename scope to context
* [#851](https://github.com/open-telemetry/opentelemetry-js/pull/851) Rename formatter to propagator

### :rocket: (Enhancement)

* [#828](https://github.com/open-telemetry/opentelemetry-js/pull/828) feat: metric observer
* [#858](https://github.com/open-telemetry/opentelemetry-js/pull/858) chore: update out-of-date dependencies
* [#856](https://github.com/open-telemetry/opentelemetry-js/pull/856) fix: change loglevel for beta
* [#843](https://github.com/open-telemetry/opentelemetry-js/pull/843) export resource to exporters
* [#846](https://github.com/open-telemetry/opentelemetry-js/pull/846) SDK Resource
* [#625](https://github.com/open-telemetry/opentelemetry-js/pull/625) feat: introduce ended property on Span
* [#837](https://github.com/open-telemetry/opentelemetry-js/pull/837) Simplify SDK registration
* [#818](https://github.com/open-telemetry/opentelemetry-js/pull/818) fix: change SpanContext.traceFlags to mandatory
* [#827](https://github.com/open-telemetry/opentelemetry-js/pull/827) Add getter and setter arguments to propagation API
* [#821](https://github.com/open-telemetry/opentelemetry-js/pull/821) feat: add composite propagator
* [#824](https://github.com/open-telemetry/opentelemetry-js/pull/824) Faster trace id generation
* [#708](https://github.com/open-telemetry/opentelemetry-js/pull/708) Simplify and speed up trace context parsing
* [#802](https://github.com/open-telemetry/opentelemetry-js/pull/802) chore: adding force flush to span processors
* [#816](https://github.com/open-telemetry/opentelemetry-js/pull/816) feat: use context-based tracing
* [#815](https://github.com/open-telemetry/opentelemetry-js/pull/815) Resources API: package, semantic conventions, and test utils
* [#797](https://github.com/open-telemetry/opentelemetry-js/pull/797) Add propagation API
* [#792](https://github.com/open-telemetry/opentelemetry-js/pull/792) Add context API
* [#685](https://github.com/open-telemetry/opentelemetry-js/pull/685) feat: add express plugin #666
* [#769](https://github.com/open-telemetry/opentelemetry-js/pull/769) Separate context propagation (OTEP 66)
* [#653](https://github.com/open-telemetry/opentelemetry-js/pull/653) Prevent loading plugins for incorrect module #626
* [#654](https://github.com/open-telemetry/opentelemetry-js/pull/654) feat: warn user when a instrumented package was already required #636
* [#772](https://github.com/open-telemetry/opentelemetry-js/pull/772) chore: add typing to propagator carrier
* [#735](https://github.com/open-telemetry/opentelemetry-js/pull/735) feat: decode jaeger header
* [#719](https://github.com/open-telemetry/opentelemetry-js/pull/719) feat(plugin-http): sync. specs for statuscode
* [#701](https://github.com/open-telemetry/opentelemetry-js/pull/701) feat: add jaeger http trace format (#696)

### :bug: (Bug Fix)

* [#798](https://github.com/open-telemetry/opentelemetry-js/pull/798) Respect sampled bit in probability sampler
* [#743](https://github.com/open-telemetry/opentelemetry-js/pull/743) fix: left pad jaeger trace ids
* [#715](https://github.com/open-telemetry/opentelemetry-js/pull/715) fix: unref jaeger socket to prevent process running indefinitely

## 0.4.0

Released 2020-02-05

### :rocket: (Enhancement)

* `opentelemetry-api`
  * [#727](https://github.com/open-telemetry/opentelemetry-js/pull/727) Api separation (deprecate `opentelemetry-types`)
  * [#749](https://github.com/open-telemetry/opentelemetry-js/pull/749) chore: rename registry to provider

### :sparkles: (Feature)

* `opentelemetry-plugin-http`
  * [#719](https://github.com/open-telemetry/opentelemetry-js/pull/719) feat(plugin-http): sync. specs for statuscode
* `opentelemetry-exporter-jaeger`
  * [#735](https://github.com/open-telemetry/opentelemetry-js/pull/735) feat: decode jaeger header
* `opentelemetry-plugin-user-interaction`
  * [#658](https://github.com/open-telemetry/opentelemetry-js/pull/658) feat: plugin user interaction for web

### :books: (Refine Doc)

* [#689](https://github.com/open-telemetry/opentelemetry-js/pull/689) Add benchmark README and latest numbers
* [#733](https://github.com/open-telemetry/opentelemetry-js/pull/733) chore: add instruction for pg-pool plugin
* [#665](https://github.com/open-telemetry/opentelemetry-js/pull/665) docs: add ioredis example
* [#731](https://github.com/open-telemetry/opentelemetry-js/pull/731) Update Stackdriver exporter example

### :bug: (Bug Fix)

* `opentelemetry-exporter-jaeger`
  * [#715](https://github.com/open-telemetry/opentelemetry-js/pull/715) fix: unref jaeger socket to prevent process running indefinitely
* `opentelemetry-plugin-ioredis`
  * [#671](https://github.com/open-telemetry/opentelemetry-js/pull/671) [ioredis plugin] fix: change supportedVersions to >1 <5

## 0.3.3

Released 2020-01-22

### :rocket: (Enhancement)

* `opentelemetry-core`, `opentelemetry-exporter-collector`, `opentelemetry-exporter-zipkin`, `opentelemetry-node`, `opentelemetry-plugin-dns`, `opentelemetry-plugin-document-load`, `opentelemetry-plugin-grpc`, `opentelemetry-plugin-http`, `opentelemetry-plugin-https`, `opentelemetry-plugin-ioredis`, `opentelemetry-plugin-mongodb`, `opentelemetry-plugin-mysql`, `opentelemetry-plugin-postgres`, `opentelemetry-plugin-redis`, `opentelemetry-plugin-xml-http-request`, `opentelemetry-shim-opentracing`, `opentelemetry-tracing`, `opentelemetry-types`, `opentelemetry-web`
  * [#582](https://github.com/open-telemetry/opentelemetry-js/pull/582) Named Tracers / Tracer Registry
* `opentelemetry-node`, `opentelemetry-plugin-postgres`
  * [#662](https://github.com/open-telemetry/opentelemetry-js/pull/662) feat: add pg-pool to default list of instrumented plugins
  * [#708](https://github.com/open-telemetry/opentelemetry-js/pull/708) Simplify and speed up trace context parsing
* `opentelemetry-metrics`
  * [#700](https://github.com/open-telemetry/opentelemetry-js/pull/700) implement named meter

### :sparkles: (Feature)

* `opentelemetry-propagator-jaeger`
  * [#701](https://github.com/open-telemetry/opentelemetry-js/pull/701) add jaeger http trace format
* `opentelemetry-exporter-stackdriver-trace`
  * [#648](https://github.com/open-telemetry/opentelemetry-js/pull/648) Stackdriver Trace exporter

### :books: (Refine Doc)

* [#673](https://github.com/open-telemetry/opentelemetry-js/pull/673) chore(getting-started): Added a TypeScript version for Getting Started Guide

### :bug: (Bug Fix)

* `opentelemetry-plugin-ioredis`
  * [#714](https://github.com/open-telemetry/opentelemetry-js/pull/714) fix: return module exports from ioredis

## 0.3.2

Released 2020-01-03

### :rocket: (Enhancement)

* `opentelemetry-plugin-http`, `opentelemetry-plugin-https`
  * [#643](https://github.com/open-telemetry/opentelemetry-js/pull/643) feat(plugin-http): add/modify attributes
  * [#651](https://github.com/open-telemetry/opentelemetry-js/pull/651) chore: add version script to all packages
* `opentelemetry-plugin-mongodb`
  * [#652](https://github.com/open-telemetry/opentelemetry-js/pull/652) feat: port mongodb-core plugin to mongodb
* `opentelemetry-metrics`
  * [#634](https://github.com/open-telemetry/opentelemetry-js/pull/634) Rename metric handle to bound instrument
* `opentelemetry-test-utils`
  * [#644](https://github.com/open-telemetry/opentelemetry-js/pull/644) feat: test-utils

### :sparkles: (Feature)

* `opentelemetry-plugin-ioredis`
  * [#558](https://github.com/open-telemetry/opentelemetry-js/pull/558) feat(plugin): add ioredis plugin

### :books: (Refine Doc)

* `opentelemetry-node`, `opentelemetry-plugin-xml-http-request`
  * [#646](https://github.com/open-telemetry/opentelemetry-js/pull/646) chore: update default plugins list and fix npm badge
* `opentelemetry-plugin-document-load`, `opentelemetry-plugin-mysql`, `opentelemetry-plugin-redis`, `opentelemetry-plugin-xml-http-request`, `opentelemetry-shim-opentracing`
  * [#647](https://github.com/open-telemetry/opentelemetry-js/pull/647) chore: update plugin readme with example links
* `opentelemetry-plugin-postgres`
  * [#539](https://github.com/open-telemetry/opentelemetry-js/pull/539) chore(docs:postgres): add usage instructions
* Other
  * [#645](https://github.com/open-telemetry/opentelemetry-js/pull/645) chore(plugin-pg): move dev dependencies out of `dependencies` in package.json

## 0.3.1

Released 2019-12-20

### :bug: (Bug Fix)

* `opentelemetry-plugin-grpc`
  * [#631](https://github.com/open-telemetry/opentelemetry-js/pull/631) fix(grpc): patch original client methods
  * [#593](https://github.com/open-telemetry/opentelemetry-js/pull/593) fix: transpile to es2017 as esnext may result in unsupported JS code

### :books: (Refine Doc)

* Other
  * [#629](https://github.com/open-telemetry/opentelemetry-js/pull/629) ci: deploy documentation on releases
  * [#581](https://github.com/open-telemetry/opentelemetry-js/pull/581) feat: add OpenTracing example

### :rocket: (Enhancement)

* [#633](https://github.com/open-telemetry/opentelemetry-js/pull/633) chore: enable incremental builds

### :sparkles: (Feature)

* `opentelemetry-plugin-xml-http-request`
  * [#595](https://github.com/open-telemetry/opentelemetry-js/pull/595) feat: implement XMLHttpRequest plugin

## 0.3.0

Released 2019-12-13

### :rocket: (Enhancement)

* `opentelemetry-core`, `opentelemetry-node`, `opentelemetry-plugin-dns`, `opentelemetry-plugin-document-load`, `opentelemetry-plugin-grpc`, `opentelemetry-plugin-postgres`, `opentelemetry-plugin-redis`, `opentelemetry-tracing`, `opentelemetry-types`
  * [#569](https://github.com/open-telemetry/opentelemetry-js/pull/569) chore: allow parent span to be null
* `opentelemetry-plugin-document-load`
  * [#546](https://github.com/open-telemetry/opentelemetry-js/pull/546) chore: fixing issue when metric time is 0 in document-load plugin
  * [#469](https://github.com/open-telemetry/opentelemetry-js/pull/469) chore: fixing problem with load event and performance for loadend
* `opentelemetry-plugin-http`, `opentelemetry-plugin-https`
  * [#548](https://github.com/open-telemetry/opentelemetry-js/pull/548) fix(plugin-http): adapt to current @types/node
* Other
  * [#510](https://github.com/open-telemetry/opentelemetry-js/pull/510) chore(circleci): remove duplicate compile step
  * [#514](https://github.com/open-telemetry/opentelemetry-js/pull/514) ci: enumerate caching paths manually
  * [#470](https://github.com/open-telemetry/opentelemetry-js/pull/470) chore: remove examples from lerna packages
* `opentelemetry-core`, `opentelemetry-metrics`, `opentelemetry-types`
  * [#507](https://github.com/open-telemetry/opentelemetry-js/pull/507) feat: direct calling of metric instruments
  * [#517](https://github.com/open-telemetry/opentelemetry-js/pull/517) chore: update dependencies gts and codecov
  * [#497](https://github.com/open-telemetry/opentelemetry-js/pull/497) chore: bump typescript version to ^3.7.2
* `opentelemetry-metrics`
  * [#475](https://github.com/open-telemetry/opentelemetry-js/pull/475) add shutdown method on MetricExporter interface
* `opentelemetry-core`, `opentelemetry-plugin-document-load`, `opentelemetry-tracing`, `opentelemetry-web`
  * [#466](https://github.com/open-telemetry/opentelemetry-js/pull/466) chore: fixing coverage for karma using istanbul

### :bug: (Bug Fix)

* `opentelemetry-exporter-jaeger`
  * [#609](https://github.com/open-telemetry/opentelemetry-js/pull/609) Jaeger no flush interval
* `opentelemetry-plugin-dns`
  * [#613](https://github.com/open-telemetry/opentelemetry-js/pull/613) fix(plugin-dns): remove from default plugin list
* `opentelemetry-plugin-http`
  * [#589](https://github.com/open-telemetry/opentelemetry-js/pull/589) fix(plugin-http): correct handling of WHATWG urls
  * [#580](https://github.com/open-telemetry/opentelemetry-js/pull/580) fix(plugin-http): http.url attribute
* `opentelemetry-shim-opentracing`
  * [#577](https://github.com/open-telemetry/opentelemetry-js/pull/577) fix: add missing `main` in package.json
* `opentelemetry-exporter-zipkin`
  * [#526](https://github.com/open-telemetry/opentelemetry-js/pull/526) fix: zipkin-exporter: don't export after shutdown
* `opentelemetry-plugin-grpc`
  * [#487](https://github.com/open-telemetry/opentelemetry-js/pull/487) fix(grpc): use correct supportedVersions
* `opentelemetry-core`
  * [#472](https://github.com/open-telemetry/opentelemetry-js/pull/472) fix(core): add missing semver dependency

### :books: (Refine Doc)

* Other
  * [#574](https://github.com/open-telemetry/opentelemetry-js/pull/574) chore: add CHANGELOG.md
  * [#575](https://github.com/open-telemetry/opentelemetry-js/pull/575) Add exporter guide
  * [#534](https://github.com/open-telemetry/opentelemetry-js/pull/534) feat: add redis plugin example
  * [#562](https://github.com/open-telemetry/opentelemetry-js/pull/562) chore(web-example): Added a README for the existing example
  * [#537](https://github.com/open-telemetry/opentelemetry-js/pull/537) examples(tracing): add multi exporter example
  * [#484](https://github.com/open-telemetry/opentelemetry-js/pull/484) chore: update README for new milestones
* `opentelemetry-plugin-mongodb-core`
  * [#564](https://github.com/open-telemetry/opentelemetry-js/pull/564) docs: add usage for mongodb-core plugin #543)
* `opentelemetry-metrics`
  * [#490](https://github.com/open-telemetry/opentelemetry-js/pull/490) chore: update metrics README
* `opentelemetry-plugin-redis`
  * [#551](https://github.com/open-telemetry/opentelemetry-js/pull/551) chore: fix minor typo
* `opentelemetry-exporter-prometheus`
  * [#521](https://github.com/open-telemetry/opentelemetry-js/pull/521) chore: update prometheus exporter readme with usage and links
* `opentelemetry-types`
  * [#512](https://github.com/open-telemetry/opentelemetry-js/pull/512) chore: minor name change
* `opentelemetry-plugin-postgres`
  * [#473](https://github.com/open-telemetry/opentelemetry-js/pull/473) chore(plugin): postgres-pool plugin skeleton

### :sparkles: (Feature)

* `opentelemetry-core`, `opentelemetry-exporter-collector`
  * [#552](https://github.com/open-telemetry/opentelemetry-js/pull/552) Collector exporter
* `opentelemetry-node`, `opentelemetry-plugin-mysql`
  * [#525](https://github.com/open-telemetry/opentelemetry-js/pull/525) feat: mysql support
* `opentelemetry-plugin-redis`
  * [#503](https://github.com/open-telemetry/opentelemetry-js/pull/503) feat(plugin): implement redis plugin
* `opentelemetry-plugin-mongodb-core`
  * [#205](https://github.com/open-telemetry/opentelemetry-js/pull/205) feat: add mongodb plugin
* `opentelemetry-exporter-prometheus`
  * [#483](https://github.com/open-telemetry/opentelemetry-js/pull/483) feat: Add prometheus exporter
* `opentelemetry-metrics`
  * [#500](https://github.com/open-telemetry/opentelemetry-js/pull/500) feat: add ConsoleMetricExporter
  * [#468](https://github.com/open-telemetry/opentelemetry-js/pull/468) feat: validate metric names
* `opentelemetry-scope-zone-peer-dep`, `opentelemetry-scope-zone`, `opentelemetry-web`
  * [#461](https://github.com/open-telemetry/opentelemetry-js/pull/461) feat(scope-zone): new scope manager to support async operations in web
* `opentelemetry-core`, `opentelemetry-plugin-document-load`
  * [#477](https://github.com/open-telemetry/opentelemetry-js/pull/477) feat(traceparent): setting parent span from server
* `opentelemetry-core`, `opentelemetry-metrics`, `opentelemetry-types`
  * [#463](https://github.com/open-telemetry/opentelemetry-js/pull/463) feat: implement labelset
* `opentelemetry-metrics`, `opentelemetry-types`
  * [#437](https://github.com/open-telemetry/opentelemetry-js/pull/437) feat(metrics): add registerMetric and getMetrics

## 0.2.0

Released 2019-11-04

### :rocket: (Enhancement)

* `opentelemetry-shim-opentracing`, `opentelemetry-tracing`, `opentelemetry-types`
  * [#449](https://github.com/open-telemetry/opentelemetry-js/pull/449) fix: allow recording links only at Span creation time
* `opentelemetry-core`, `opentelemetry-node`, `opentelemetry-tracing`, `opentelemetry-types`
  * [#454](https://github.com/open-telemetry/opentelemetry-js/pull/454) fix(span): rename span recording flag
* `opentelemetry-metrics`
  * [#475](https://github.com/open-telemetry/opentelemetry-js/pull/475) add shutdown method on MetricExporter interface
* `opentelemetry-plugin-document-load`
  * [#469](https://github.com/open-telemetry/opentelemetry-js/pull/469) chore: fixing problem with load event and performance for loadend
* `opentelemetry-core`, `opentelemetry-plugin-document-load`, `opentelemetry-tracing`, `opentelemetry-web`
  * [#466](https://github.com/open-telemetry/opentelemetry-js/pull/466) chore: fixing coverage for karma using istanbul

### :bug: (Bug Fix)

* `opentelemetry-tracing`
  * [#444](https://github.com/open-telemetry/opentelemetry-js/pull/444) fix: batchSpanProcessor test failing intermittently
* `opentelemetry-core`
  * [#472](https://github.com/open-telemetry/opentelemetry-js/pull/472) fix(core): add missing semver dependency

### :books: (Refine Doc)

* [#462](https://github.com/open-telemetry/opentelemetry-js/pull/462) chore: update README
* [#460](https://github.com/open-telemetry/opentelemetry-js/pull/460) chore: move members list out of community repo
* [#445](https://github.com/open-telemetry/opentelemetry-js/pull/445) chore: update CONTRIBUTING.md
* [#459](https://github.com/open-telemetry/opentelemetry-js/pull/459) chore: update API docs

### :sparkles: (Feature)

* `opentelemetry-metrics`, `opentelemetry-types`
  * [#437](https://github.com/open-telemetry/opentelemetry-js/pull/437) feat(metrics): add registerMetric and getMetrics
* `opentelemetry-metrics`
  * [#468](https://github.com/open-telemetry/opentelemetry-js/pull/468) feat: validate metric names
* `opentelemetry-plugin-postgres`
  * [#417](https://github.com/open-telemetry/opentelemetry-js/pull/417) feature(plugin): implement postgres plugin
* `opentelemetry-core`, `opentelemetry-types`
  * [#451](https://github.com/open-telemetry/opentelemetry-js/pull/451) feat: add IsRemote field to SpanContext, set by propagators
* `opentelemetry-core`, `opentelemetry-plugin-document-load`, `opentelemetry-tracing`, `opentelemetry-types`, `opentelemetry-web`
  * [#433](https://github.com/open-telemetry/opentelemetry-js/pull/433) feat(plugin-document-load): new plugin for document load for web tracer

## 0.1.1

* chore: add prepare script and bump the version (#431)
* docs: fix broken links (#428)
* docs(exporter-jaeger): fix jaeger version (#430)
* fix(plugin-http): ensure no leaks (#398)
* Update readme (#421)
* refactor: cal duration once instead of each get duration call (#412)
* chore: add npm version badge (#414)

## 0.1.0

* Initial release
