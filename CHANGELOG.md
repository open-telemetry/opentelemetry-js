# CHANGELOG

All notable changes to this project will be documented in this file.

## Unreleased

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
