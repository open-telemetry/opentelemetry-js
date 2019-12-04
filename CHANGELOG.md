# CHANGELOG

All notable changes to this project will be documented in this file.

## Unreleased

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
