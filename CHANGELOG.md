# CHANGELOG

All notable changes to this project will be documented in this file.

## Unreleased

## 0.8.3

#### :rocket: (Enhancement)
* `opentelemetry-node`
  * [#980](https://github.com/open-telemetry/opentelemetry-js/pull/980) feat: merge user supplied and default plugin configs ([@naseemkullah](https://github.com/naseemkullah))

#### :bug: (Bug Fix)
* `opentelemetry-context-async-hooks`
  * [#1099](https://github.com/open-telemetry/opentelemetry-js/pull/1099) fix(asynchooks-scope): fix context loss using .with() #1101 ([@vmarchaud](https://github.com/vmarchaud))

#### :books: (Refine Doc)
* Other
  * [#1100](https://github.com/open-telemetry/opentelemetry-js/pull/1100) docs(batcher): document how to configure custom aggregators #989 ([@vmarchaud](https://github.com/vmarchaud))
* `opentelemetry-api`
  * [#1106](https://github.com/open-telemetry/opentelemetry-js/pull/1106) chore: improve API documentation ([@mayurkale22](https://github.com/mayurkale22))

#### Committers: 7
- Bartlomiej Obecny ([@obecny](https://github.com/obecny))
- Daniel Dyla ([@dyladan](https://github.com/dyladan))
- Kanika Shah ([@kanikashah90](https://github.com/kanikashah90))
- Mayur Kale ([@mayurkale22](https://github.com/mayurkale22))
- Naseem ([@naseemkullah](https://github.com/naseemkullah))
- Valentin Marchaud ([@vmarchaud](https://github.com/vmarchaud))
- [@shivkanya9146](https://github.com/shivkanya9146)


## 0.8.2

#### :rocket: (Enhancement)
* `opentelemetry-exporter-collector`
  * [#1063](https://github.com/open-telemetry/opentelemetry-js/pull/1063) feat: exporter collector TLS option ([@mzahor](https://github.com/mzahor))
* `opentelemetry-core`
  * [#838](https://github.com/open-telemetry/opentelemetry-js/pull/838) feat: implement W3C Correlation Context propagator ([@rubenvp8510](https://github.com/rubenvp8510))

#### :bug: (Bug Fix)
* `opentelemetry-api`
  * [#1067](https://github.com/open-telemetry/opentelemetry-js/pull/1067) fix: missing `global` in browser environments ([@legendecas](https://github.com/legendecas))

#### :books: (Refine Doc)
* Other
  * [#1057](https://github.com/open-telemetry/opentelemetry-js/pull/1057) chore: add examples README.md ([@mayurkale22](https://github.com/mayurkale22))
* `opentelemetry-core`
  * [#1080](https://github.com/open-telemetry/opentelemetry-js/pull/1080) docs: document CorrelationContext propagator under Built-in Implement… ([@rubenvp8510](https://github.com/rubenvp8510))

#### Committers: 5
- Marian Zagoruiko ([@mzahor](https://github.com/mzahor))
- Mayur Kale ([@mayurkale22](https://github.com/mayurkale22))
- Olivier Albertini ([@OlivierAlbertini](https://github.com/OlivierAlbertini))
- Ruben Vargas Palma ([@rubenvp8510](https://github.com/rubenvp8510))
- legendecas ([@legendecas](https://github.com/legendecas))

## 0.8.1

#### :rocket: (Enhancement)
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


#### :bug: (Bug Fix)
* `opentelemetry-plugin-http`
  * [#1060](https://github.com/open-telemetry/opentelemetry-js/pull/1060) fix(http-plugin): don't modify user's headers object in plugin ([@BlumAmir](https://github.com/BlumAmir))
* `opentelemetry-exporter-collector`
  * [#1053](https://github.com/open-telemetry/opentelemetry-js/pull/1053) fix: include proto files in deployment package ([@dyladan](https://github.com/dyladan))

#### :books: (Refine Doc)
* Other
  * [#1065](https://github.com/open-telemetry/opentelemetry-js/pull/1065) style: format README ([@naseemkullah](https://github.com/naseemkullah))
  * [#1064](https://github.com/open-telemetry/opentelemetry-js/pull/1064) chore: update README ([@mayurkale22](https://github.com/mayurkale22))
  * [#1051](https://github.com/open-telemetry/opentelemetry-js/pull/1051) chore: deploy docs using github action ([@dyladan](https://github.com/dyladan))
* `opentelemetry-exporter-prometheus`
  * [#1056](https://github.com/open-telemetry/opentelemetry-js/pull/1056) fix readme: setting labelKeys when creating the counter ([@luebken](https://github.com/luebken))

#### Committers: 9
- Alan Storm ([@astorm](https://github.com/astorm))
- Amir Blum ([@BlumAmir](https://github.com/BlumAmir))
- Daniel Dyla ([@dyladan](https://github.com/dyladan))
- Justin Walz ([@justinwalz](https://github.com/justinwalz))
- Matthew Wear ([@mwear](https://github.com/mwear))
- Matthias Lübken ([@luebken](https://github.com/luebken))
- Mayur Kale ([@mayurkale22](https://github.com/mayurkale22))
- Naseem ([@naseemkullah](https://github.com/naseemkullah))
- [@shivkanya9146](https://github.com/shivkanya9146)

## 0.8.0

Released 2020-05-12

#### :boom: Breaking Change
* `opentelemetry-api`, `opentelemetry-metrics`
  * [#1001](https://github.com/open-telemetry/opentelemetry-js/pull/1001) fix: observers should not expose bind/unbind method ([@legendecas](https://github.com/legendecas))

#### :bug: (Bug Fix)
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

#### :rocket: (Enhancement)
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

#### :books: (Refine Doc)
* Other
  * [#1003](https://github.com/open-telemetry/opentelemetry-js/pull/1003) chore: test on node 14 ([@dyladan](https://github.com/dyladan))
  * [#990](https://github.com/open-telemetry/opentelemetry-js/pull/990) fix(opentracing-shim): update opentracing shim example ([@sleighzy](https://github.com/sleighzy))

#### Committers: 7
- legendecas ([@legendecas](https://github.com/legendecas))
- Valentin Marchaud ([@vmarchaud](https://github.com/vmarchaud))
- Daniel Dyla ([@dyladan](https://github.com/dyladan))
- Ivan Senic ([@ivansenic](https://github.com/ivansenic))
- Mark Wolff ([@markwolff](https://github.com/markwolff))
- Simon Leigh ([@sleighzy](https://github.com/sleighzy))
- Bartlomiej Obecny ([@obecny](https://github.com/obecny))

## 0.7.0

Released 2020-04-23

#### :boom: Breaking Change
* `opentelemetry-exporter-collector`
  * [#901](https://github.com/open-telemetry/opentelemetry-js/pull/901) grpc for node and support for new proto format for node and browser ([@obecny](https://github.com/obecny))
* `opentelemetry-api`, `opentelemetry-metrics`
  * [#964](https://github.com/open-telemetry/opentelemetry-js/pull/964) chore: adding metric observable to be able to support async update ([@obecny](https://github.com/obecny))

#### :bug: (Bug Fix)
* `opentelemetry-plugin-http`
  * [#960](https://github.com/open-telemetry/opentelemetry-js/pull/960) [http] fix: use url.URL ([@naseemkullah](https://github.com/naseemkullah))
* `opentelemetry-core`
  * [#977](https://github.com/open-telemetry/opentelemetry-js/pull/977) fix(B3Propagator): B3 sampled causing gRPC error ([@mayurkale22](https://github.com/mayurkale22))

#### :rocket: (Enhancement)
* `opentelemetry-resources`
  * [#899](https://github.com/open-telemetry/opentelemetry-js/pull/899) feat: resource auto-detection ([@mwear](https://github.com/mwear))
* `opentelemetry-metrics`
  * [#930](https://github.com/open-telemetry/opentelemetry-js/pull/930) feat(aggregators): implement histogram aggregator ([@vmarchaud](https://github.com/vmarchaud))

#### Committers: 5
- Naseem ([@naseemkullah](https://github.com/naseemkullah))
- Matthew Wear ([@mwear](https://github.com/mwear))
- Bartlomiej Obecny ([@obecny](https://github.com/obecny))
- Mayur Kale ([@mayurkale22](https://github.com/mayurkale22))
- Valentin Marchaud ([@vmarchaud](https://github.com/vmarchaud))

## 0.6.1

Released 2020-04-08

#### :rocket: (Enhancement)
* `opentelemetry-exporter-jaeger`
  * [#924](https://github.com/open-telemetry/opentelemetry-js/pull/924) [Jaeger-Exporter] host default env var ([@naseemkullah](https://github.com/naseemkullah))
* `opentelemetry-metrics`
  * [#933](https://github.com/open-telemetry/opentelemetry-js/pull/933) feat(meter): allow custom batcher #932 ([@vmarchaud](https://github.com/vmarchaud))

#### :bug: (Bug Fix)
* `opentelemetry-plugin-http`
  * [#946](https://github.com/open-telemetry/opentelemetry-js/pull/946) Remove bad null check ([@dyladan](https://github.com/dyladan))
* `opentelemetry-exporter-prometheus`, `opentelemetry-metrics`
  * [#941](https://github.com/open-telemetry/opentelemetry-js/pull/941) fix: do not clear other labelsets when updating metrics ([@dyladan](https://github.com/dyladan))

#### :books: (Refine Doc)
* `opentelemetry-propagator-jaeger`
  * [#937](https://github.com/open-telemetry/opentelemetry-js/pull/937) fix: Jaeger propagator example of usage" ([@shivkanya9146](https://github.com/shivkanya9146))

#### Committers: 4
- Daniel Dyla ([@dyladan](https://github.com/dyladan))
- Naseem ([@naseemkullah](https://github.com/naseemkullah))
- Valentin Marchaud ([@vmarchaud](https://github.com/vmarchaud))
- [@shivkanya9146](https://github.com/shivkanya9146)


## 0.6.0

Released 2020-04-01

#### :boom: Breaking Change
* `opentelemetry-api`, `opentelemetry-metrics`
  * [#915](https://github.com/open-telemetry/opentelemetry-js/pull/915) Remove label set from metrics API ([@mayurkale22](https://github.com/mayurkale22))

#### :rocket: (Enhancement)
* `opentelemetry-tracing`
  * [#913](https://github.com/open-telemetry/opentelemetry-js/pull/913) chore: remove unused default argument in Tracer ([@Flarna](https://github.com/Flarna))
* `opentelemetry-exporter-jaeger`
  * [#916](https://github.com/open-telemetry/opentelemetry-js/pull/916) chore: removing force flush ([@obecny](https://github.com/obecny))

#### :books: (Refine Doc)
* `opentelemetry-node`
  * [#921](https://github.com/open-telemetry/opentelemetry-js/pull/921) chore: fix Require Path in README [@shivkanya9146](https://github.com/shivkanya9146))

#### Committers: 4
- Mayur Kale ([@mayurkale22](https://github.com/mayurkale22))
- Bartlomiej Obecny ([@obecny](https://github.com/obecny))
- Gerhard Stöbich ([@Flarna](https://github.com/Flarna))
- Shivkanya Andhare ([@shivkanya9146](https://github.com/shivkanya9146))

## 0.5.2

Released 2020-03-27

#### :rocket: (Enhancement)
* `opentelemetry-exporter-prometheus`, `opentelemetry-metrics`
  * [#893](https://github.com/open-telemetry/opentelemetry-js/pull/893) Metrics: Add lastUpdateTimestamp associated with point ([@mayurkale22](https://github.com/mayurkale22))
* `opentelemetry-tracing`
  * [#896](https://github.com/open-telemetry/opentelemetry-js/pull/896) Do not export empty span lists ([@dyladan](https://github.com/dyladan))
* `opentelemetry-api`, `opentelemetry-tracing`
  * [#889](https://github.com/open-telemetry/opentelemetry-js/pull/889) feat: start a root span with spanOptions.parent = null ([@dyladan](https://github.com/dyladan))

#### :bug: (Bug Fix)
* `opentelemetry-core`, `opentelemetry-propagator-jaeger`
  * [#904](https://github.com/open-telemetry/opentelemetry-js/pull/904) fix: add type checking in propagators ([@dyladan](https://github.com/dyladan))
* `opentelemetry-context-base`, `opentelemetry-core`, `opentelemetry-plugin-document-load`, `opentelemetry-plugin-user-interaction`, `opentelemetry-web`
  * [#906](https://github.com/open-telemetry/opentelemetry-js/pull/906) chore: fixing documentation for web tracer provider, fixing examples … ([@obecny](https://github.com/obecny))
* Other
  * [#884](https://github.com/open-telemetry/opentelemetry-js/pull/884) chore: fixing main package.json version ([@obecny](https://github.com/obecny))

#### :books: (Refine Doc)
* `opentelemetry-context-base`, `opentelemetry-core`, `opentelemetry-plugin-document-load`, `opentelemetry-plugin-user-interaction`, `opentelemetry-web`
  * [#906](https://github.com/open-telemetry/opentelemetry-js/pull/906) chore: fixing documentation for web tracer provider, fixing examples … ([@obecny](https://github.com/obecny))

#### Committers: 4
- Bartlomiej Obecny ([@obecny](https://github.com/obecny))
- Daniel Dyla ([@dyladan](https://github.com/dyladan))
- Mark Robert Henderson ([@aphelionz](https://github.com/aphelionz))
- Mayur Kale ([@mayurkale22](https://github.com/mayurkale22))


## 0.5.1

Released 2020-03-19

#### :bug: (Bug Fix)
* `opentelemetry-web`
  * [#873](https://github.com/open-telemetry/opentelemetry-js/pull/873) Remove unnecessary `this` overwrite in stack context manager ([@dyladan](https://github.com/dyladan))
* `opentelemetry-plugin-mysql`
  * [#880](https://github.com/open-telemetry/opentelemetry-js/pull/880) Do not multiwrap pool queries ([@dyladan](https://github.com/dyladan))
* `opentelemetry-metrics`
  * [#881](https://github.com/open-telemetry/opentelemetry-js/pull/881)  fix: @opentelemetry/metrics fails to run due to bad import ([@mayurkale22](https://github.com/mayurkale22))

#### Committers: 2
- Daniel Dyla ([@dyladan](https://github.com/dyladan))
- Mayur Kale ([@mayurkale22](https://github.com/mayurkale22))

## 0.5.0

Released 2020-03-16

### This is a first official beta release, which provides almost fully complete metrics, tracing, and context propagation functionality but makes no promises around breaking changes.

#### :boom: Breaking Change
* [#853](https://github.com/open-telemetry/opentelemetry-js/pull/853) Rename scope to context
* [#851](https://github.com/open-telemetry/opentelemetry-js/pull/851) Rename formatter to propagator

#### :rocket: (Enhancement)
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

#### :bug: (Bug Fix)
* [#798](https://github.com/open-telemetry/opentelemetry-js/pull/798) Respect sampled bit in probability sampler
* [#743](https://github.com/open-telemetry/opentelemetry-js/pull/743) fix: left pad jaeger trace ids
* [#715](https://github.com/open-telemetry/opentelemetry-js/pull/715) fix: unref jaeger socket to prevent process running indefinitely

## 0.4.0

Released 2020-02-05

#### :rocket: (Enhancement)
* `opentelemetry-api`
  * [#727](https://github.com/open-telemetry/opentelemetry-js/pull/727) Api separation (deprecate `opentelemetry-types`)
  * [#749](https://github.com/open-telemetry/opentelemetry-js/pull/749) chore: rename registry to provider


#### :sparkles: (Feature)
* `opentelemetry-plugin-http`
  * [#719](https://github.com/open-telemetry/opentelemetry-js/pull/719) feat(plugin-http): sync. specs for statuscode
* `opentelemetry-exporter-jaeger`
  * [#735](https://github.com/open-telemetry/opentelemetry-js/pull/735) feat: decode jaeger header
* `opentelemetry-plugin-user-interaction`
  * [#658](https://github.com/open-telemetry/opentelemetry-js/pull/658) feat: plugin user interaction for web

#### :books: (Refine Doc)
  * [#689](https://github.com/open-telemetry/opentelemetry-js/pull/689) Add benchmark README and latest numbers
  * [#733](https://github.com/open-telemetry/opentelemetry-js/pull/733) chore: add instruction for pg-pool plugin
  * [#665](https://github.com/open-telemetry/opentelemetry-js/pull/665) docs: add ioredis example
  * [#731](https://github.com/open-telemetry/opentelemetry-js/pull/731) Update Stackdriver exporter example

#### :bug: (Bug Fix)
* `opentelemetry-exporter-jaeger`
  * [#715](https://github.com/open-telemetry/opentelemetry-js/pull/715) fix: unref jaeger socket to prevent process running indefinitely
* `opentelemetry-plugin-ioredis`
  * [#671](https://github.com/open-telemetry/opentelemetry-js/pull/671) [ioredis plugin] fix: change supportedVersions to >1 <5


## 0.3.3

Released 2020-01-22

#### :rocket: (Enhancement)
* `opentelemetry-core`, `opentelemetry-exporter-collector`, `opentelemetry-exporter-zipkin`, `opentelemetry-node`, `opentelemetry-plugin-dns`, `opentelemetry-plugin-document-load`, `opentelemetry-plugin-grpc`, `opentelemetry-plugin-http`, `opentelemetry-plugin-https`, `opentelemetry-plugin-ioredis`, `opentelemetry-plugin-mongodb`, `opentelemetry-plugin-mysql`, `opentelemetry-plugin-postgres`, `opentelemetry-plugin-redis`, `opentelemetry-plugin-xml-http-request`, `opentelemetry-shim-opentracing`, `opentelemetry-tracing`, `opentelemetry-types`, `opentelemetry-web`
  * [#582](https://github.com/open-telemetry/opentelemetry-js/pull/582) Named Tracers / Tracer Registry
* `opentelemetry-node`, `opentelemetry-plugin-postgres`
  * [#662](https://github.com/open-telemetry/opentelemetry-js/pull/662) feat: add pg-pool to default list of instrumented plugins
  * [#708](https://github.com/open-telemetry/opentelemetry-js/pull/708) Simplify and speed up trace context parsing
* `opentelemetry-metrics`
  * [#700](https://github.com/open-telemetry/opentelemetry-js/pull/700) implement named meter

#### :sparkles: (Feature)
* `opentelemetry-propagator-jaeger`
  * [#701](https://github.com/open-telemetry/opentelemetry-js/pull/701) add jaeger http trace format
* `opentelemetry-exporter-stackdriver-trace`
  * [#648](https://github.com/open-telemetry/opentelemetry-js/pull/648) Stackdriver Trace exporter

#### :books: (Refine Doc)
  * [#673](https://github.com/open-telemetry/opentelemetry-js/pull/673) chore(getting-started): Added a TypeScript version for Getting Started Guide

#### :bug: (Bug Fix)
* `opentelemetry-plugin-ioredis`
  * [#714](https://github.com/open-telemetry/opentelemetry-js/pull/714) fix: return module exports from ioredis

## 0.3.2

Released 2020-01-03

#### :rocket: (Enhancement)
* `opentelemetry-plugin-http`, `opentelemetry-plugin-https`
  * [#643](https://github.com/open-telemetry/opentelemetry-js/pull/643) feat(plugin-http): add/modify attributes
  * [#651](https://github.com/open-telemetry/opentelemetry-js/pull/651) chore: add version script to all packages
* `opentelemetry-plugin-mongodb`
  * [#652](https://github.com/open-telemetry/opentelemetry-js/pull/652) feat: port mongodb-core plugin to mongodb
* `opentelemetry-metrics`
  * [#634](https://github.com/open-telemetry/opentelemetry-js/pull/634) Rename metric handle to bound instrument
* `opentelemetry-test-utils`
  * [#644](https://github.com/open-telemetry/opentelemetry-js/pull/644) feat: test-utils

#### :sparkles: (Feature)
* `opentelemetry-plugin-ioredis`
  * [#558](https://github.com/open-telemetry/opentelemetry-js/pull/558) feat(plugin): add ioredis plugin

#### :books: (Refine Doc)
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

#### :bug: (Bug Fix)
* `opentelemetry-plugin-grpc`
  * [#631](https://github.com/open-telemetry/opentelemetry-js/pull/631) fix(grpc): patch original client methods
  * [#593](https://github.com/open-telemetry/opentelemetry-js/pull/593) fix: transpile to es2017 as esnext may result in unsupported JS code

#### :books: (Refine Doc)
* Other
  * [#629](https://github.com/open-telemetry/opentelemetry-js/pull/629) ci: deploy documentation on releases
  * [#581](https://github.com/open-telemetry/opentelemetry-js/pull/581) feat: add OpenTracing example

#### :rocket: (Enhancement)
 * [#633](https://github.com/open-telemetry/opentelemetry-js/pull/633) chore: enable incremental builds

#### :sparkles: (Feature)
* `opentelemetry-plugin-xml-http-request`
  * [#595](https://github.com/open-telemetry/opentelemetry-js/pull/595) feat: implement XMLHttpRequest plugin

## 0.3.0

Released 2019-12-13

#### :rocket: (Enhancement)
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

#### :bug: (Bug Fix)
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

#### :books: (Refine Doc)
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

#### :sparkles: (Feature)
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

#### :rocket: (Enhancement)
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

#### :bug: (Bug Fix)
* `opentelemetry-tracing`
  * [#444](https://github.com/open-telemetry/opentelemetry-js/pull/444) fix: batchSpanProcessor test failing intermittently
* `opentelemetry-core`
  * [#472](https://github.com/open-telemetry/opentelemetry-js/pull/472) fix(core): add missing semver dependency

#### :books: (Refine Doc)
  * [#462](https://github.com/open-telemetry/opentelemetry-js/pull/462) chore: update README
  * [#460](https://github.com/open-telemetry/opentelemetry-js/pull/460) chore: move members list out of community repo
  * [#445](https://github.com/open-telemetry/opentelemetry-js/pull/445) chore: update CONTRIBUTING.md
  * [#459](https://github.com/open-telemetry/opentelemetry-js/pull/459) chore: update API docs

#### :sparkles: (Feature)
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

- chore: add prepare script and bump the version (#431)
- docs: fix broken links (#428)
- docs(exporter-jaeger): fix jaeger version (#430)
- fix(plugin-http): ensure no leaks (#398)
- Update readme (#421)
- refactor: cal duration once instead of each get duration call (#412)
- chore: add npm version badge (#414)

## 0.1.0

- Initial release
