# CHANGELOG

All notable changes to this project will be documented in this file.

## [1.2.0](https://www.github.com/open-telemetry/opentelemetry-js-api/compare/v1.1.0...v1.2.0) (2022-08-09)


### Features

* Add getActiveSpan to trace API ([#163](https://www.github.com/open-telemetry/opentelemetry-js-api/issues/163)) ([17ccb3a](https://www.github.com/open-telemetry/opentelemetry-js-api/commit/17ccb3a4e385bc5769ded6fc742c9782a93244a5))
* deprecate Sampler ([#166](https://www.github.com/open-telemetry/opentelemetry-js-api/issues/166)) ([313b2e2](https://www.github.com/open-telemetry/opentelemetry-js-api/commit/313b2e2225f246a6a9518ec4da6942f7d61babce))

## [1.1.0](https://www.github.com/open-telemetry/opentelemetry-js-api/compare/v1.0.4...v1.1.0) (2022-01-25)


### Features

* add tracestate implementation to api ([#147](https://www.github.com/open-telemetry/opentelemetry-js-api/issues/147)) ([82842c7](https://www.github.com/open-telemetry/opentelemetry-js-api/commit/82842c7097614e6ece99e73838ac5e94ff5460b7))
* define common attributes type ([#142](https://www.github.com/open-telemetry/opentelemetry-js-api/issues/142)) ([ae9bead](https://www.github.com/open-telemetry/opentelemetry-js-api/commit/ae9bead17750d35dec4b63cfae098087666abc85))
* **trace:** add optional schema url to TracerProvider.getTracer ([#129](https://www.github.com/open-telemetry/opentelemetry-js-api/issues/129)) ([aa65fc6](https://www.github.com/open-telemetry/opentelemetry-js-api/commit/aa65fc66809d45090d6e4951c265386d17ccc6f6))


### Bug Fixes

* export tracer options ([#154](https://www.github.com/open-telemetry/opentelemetry-js-api/issues/154)) ([b125324](https://www.github.com/open-telemetry/opentelemetry-js-api/commit/b125324438fb2f24eb80c7c6673afc8cfc99575e))

### [1.0.4](https://www.github.com/open-telemetry/opentelemetry-js-api/compare/v1.0.3...v1.0.4) (2021-12-18)


### Bug Fixes

* align globalThis fallbacks with otel-core ([#126](https://www.github.com/open-telemetry/opentelemetry-js-api/issues/126)) ([3507de7](https://www.github.com/open-telemetry/opentelemetry-js-api/commit/3507de7c3b95396696657c021953b0b24a63a029))

### [1.0.3](https://www.github.com/open-telemetry/opentelemetry-js-api/compare/v1.0.2...v1.0.3) (2021-08-30)


### Bug Fixes

* remove all circular dependencies ([#119](https://www.github.com/open-telemetry/opentelemetry-js-api/issues/119)) ([a8083e8](https://www.github.com/open-telemetry/opentelemetry-js-api/commit/a8083e84b23227828745da80fd5fe512357dd34b))

## 1.0.2

### :bug: Bug Fix

* [#105](https://github.com/open-telemetry/opentelemetry-js-api/pull/105) fix: set delegate after successful registration ([@Flarna](https://github.com/Flarna))
* [#94](https://github.com/open-telemetry/opentelemetry-js-api/pull/94) fix: enforce strict equality on prerelease versions ([@dyladan](https://github.com/dyladan))

### :memo: Documentation

* [#106](https://github.com/open-telemetry/opentelemetry-js-api/pull/106) docs: fix crash in README example ([@trentm](https://github.com/trentm))
* [#101](https://github.com/open-telemetry/opentelemetry-js-api/pull/101) docs: Format example for tracer.startActiveSpan ([@ad-m](https://github.com/ad-m))
* [#99](https://github.com/open-telemetry/opentelemetry-js-api/pull/99) chore: fix link to API docs ([@dyladan](https://github.com/dyladan))

### :house: Internal

* [#109](https://github.com/open-telemetry/opentelemetry-js-api/pull/109) internal: add missing approvers from core ([@dyladan](https://github.com/dyladan))
* [#103](https://github.com/open-telemetry/opentelemetry-js-api/pull/103) chore: reuse NoopTracer in ProxyTracer ([@Flarna](https://github.com/Flarna))

### Committers: 4

* Adam Dobrawy ([@ad-m](https://github.com/ad-m))
* Daniel Dyla ([@dyladan](https://github.com/dyladan))
* Gerhard Stöbich ([@Flarna](https://github.com/Flarna))
* Trent Mick ([@trentm](https://github.com/trentm))

## 1.0.1

### :bug: Bug Fix

* [#96](https://github.com/open-telemetry/opentelemetry-js-api/pull/96) chore: remove circular dependency ([@dyladan](https://github.com/dyladan))

### Committers: 1

* Daniel Dyla ([@dyladan](https://github.com/dyladan))

## 1.0.0

### :memo: Documentation

* [#89](https://github.com/open-telemetry/opentelemetry-js-api/pull/89) chore: update upgrade guidelines ([@dyladan](https://github.com/dyladan))

### :house: Internal

* [#90](https://github.com/open-telemetry/opentelemetry-js-api/pull/90) chore: enable typescript 4.3 noImplicitOverride option ([@Flarna](https://github.com/Flarna))

### Committers: 2

* Daniel Dyla ([@dyladan](https://github.com/dyladan))
* Gerhard Stöbich ([@Flarna](https://github.com/Flarna))

## 0.21.0

### :boom: Breaking Change

* [#78](https://github.com/open-telemetry/opentelemetry-js-api/pull/78) feat: unify signatures of `with` and `bind` ([@Rauno56](https://github.com/Rauno56))
* [#46](https://github.com/open-telemetry/opentelemetry-js-api/pull/46) chore: do not export singletons ([@dyladan](https://github.com/dyladan))

### :rocket: Enhancement

* [#81](https://github.com/open-telemetry/opentelemetry-js-api/pull/81) chore: function overloads implementation of startActiveSpan in noop t… ([@naseemkullah](https://github.com/naseemkullah))

### :house: Internal

* [#84](https://github.com/open-telemetry/opentelemetry-js-api/pull/84) chore: remove unused backwards compatibility folder ([@Flarna](https://github.com/Flarna))
* [#85](https://github.com/open-telemetry/opentelemetry-js-api/pull/85) chore: add node:16 to the test matrix ([@Rauno56](https://github.com/Rauno56))
* [#63](https://github.com/open-telemetry/opentelemetry-js-api/pull/63) feat: debug log global registrations and logger overwrites ([@Rauno56](https://github.com/Rauno56))
* [#75](https://github.com/open-telemetry/opentelemetry-js-api/pull/75) Add CodeQL Security Scan ([@xukaren](https://github.com/xukaren))
* [#79](https://github.com/open-telemetry/opentelemetry-js-api/pull/79) chore: fix eslint config ([@Rauno56](https://github.com/Rauno56))

### Committers: 5

* Daniel Dyla ([@dyladan](https://github.com/dyladan))
* Gerhard Stöbich ([@Flarna](https://github.com/Flarna))
* Karen Xu ([@xukaren](https://github.com/xukaren))
* Naseem ([@naseemkullah](https://github.com/naseemkullah))
* Rauno Viskus ([@Rauno56](https://github.com/Rauno56))

## 0.20.0

### :rocket: Enhancement

* [#69](https://github.com/open-telemetry/opentelemetry-js-api/pull/69) feat(context): add utils method to remove keys from context ([@vmarchaud](https://github.com/vmarchaud))
* [#71](https://github.com/open-telemetry/opentelemetry-js-api/pull/71) chore: export baggage ([@dyladan](https://github.com/dyladan))

### Committers: 2

* Daniel Dyla ([@dyladan](https://github.com/dyladan))
* Valentin Marchaud ([@vmarchaud](https://github.com/vmarchaud))

## 0.19.0

### :boom: Breaking Change

* [#55](https://github.com/open-telemetry/opentelemetry-js-api/pull/55) chore: move baggage methods in propagation namespace ([@vmarchaud](https://github.com/vmarchaud))
* [#65](https://github.com/open-telemetry/opentelemetry-js-api/pull/65) chore: remove suppress instrumentation ([@dyladan](https://github.com/dyladan))
* [#60](https://github.com/open-telemetry/opentelemetry-js-api/pull/60) chore: removing timed event ([@obecny](https://github.com/obecny))
* [#58](https://github.com/open-telemetry/opentelemetry-js-api/pull/58) chore: use spancontext for link ([@dyladan](https://github.com/dyladan))
* [#47](https://github.com/open-telemetry/opentelemetry-js-api/pull/47) chore: move span method for context in trace API #40 ([@vmarchaud](https://github.com/vmarchaud))
* [#45](https://github.com/open-telemetry/opentelemetry-js-api/pull/45) chore: rename `span#context()` to `span#spanContext` ([@dyladan](https://github.com/dyladan))
* [#43](https://github.com/open-telemetry/opentelemetry-js-api/pull/43) chore: renaming noop span to non recording span ([@obecny](https://github.com/obecny))
* [#32](https://github.com/open-telemetry/opentelemetry-js-api/pull/32) feat!: return boolean success value from setGlobalXXX methods ([@dyladan](https://github.com/dyladan))

### :rocket: Enhancement

* [#62](https://github.com/open-telemetry/opentelemetry-js-api/pull/62) chore: adding component logger ([@obecny](https://github.com/obecny))
* [#54](https://github.com/open-telemetry/opentelemetry-js-api/pull/54) feat: add tracer.startActiveSpan() ([@naseemkullah](https://github.com/naseemkullah))
* [#58](https://github.com/open-telemetry/opentelemetry-js-api/pull/58) chore: use spancontext for link ([@dyladan](https://github.com/dyladan))
* [#51](https://github.com/open-telemetry/opentelemetry-js-api/pull/51) feat: add function to wrap SpanContext in NonRecordingSpan #49 ([@dyladan](https://github.com/dyladan))

### :memo: Documentation

* [#64](https://github.com/open-telemetry/opentelemetry-js-api/pull/64) chore: document the reason for symbol.for ([@dyladan](https://github.com/dyladan))
* [#44](https://github.com/open-telemetry/opentelemetry-js-api/pull/44) chore: updating readme headline and fixing links ([@obecny](https://github.com/obecny))

### Committers: 6

* Bartlomiej Obecny ([@obecny](https://github.com/obecny))
* Daniel Dyla ([@dyladan](https://github.com/dyladan))
* Gerhard Stöbich ([@Flarna](https://github.com/Flarna))
* Naseem ([@naseemkullah](https://github.com/naseemkullah))
* Valentin Marchaud ([@vmarchaud](https://github.com/vmarchaud))
* t2t2 ([@t2t2](https://github.com/t2t2))

## 1.0.0-rc.0

### :memo: Documentation

* [#20](https://github.com/open-telemetry/opentelemetry-js-api/pull/20) docs: document latest manual tracing ([@dyladan](https://github.com/dyladan))
* [#18](https://github.com/open-telemetry/opentelemetry-js-api/pull/18) chore: deploy docs on a release ([@dyladan](https://github.com/dyladan))
* [#19](https://github.com/open-telemetry/opentelemetry-js-api/pull/19) docs: fix readme links ([@dyladan](https://github.com/dyladan))

### Committers: 1

* Daniel Dyla ([@dyladan](https://github.com/dyladan))

## 0.18.1

### :bug: Bug Fix

* [#16](https://github.com/open-telemetry/opentelemetry-js-api/pull/16) fix: Reverse the direction of the semver check ([@dyladan](https://github.com/dyladan))

### Committers: 1

* Daniel Dyla ([@dyladan](https://github.com/dyladan))

## v0.18.0

### :boom: Breaking Change

* [#9](https://github.com/open-telemetry/opentelemetry-js-api/pull/9) chore: refactor diag logger ([@dyladan](https://github.com/dyladan))

### :rocket: Enhancement

* [#10](https://github.com/open-telemetry/opentelemetry-js-api/pull/10) Use semver to determine API compatibility ([@dyladan](https://github.com/dyladan))

### :house: Internal

* [#12](https://github.com/open-telemetry/opentelemetry-js-api/pull/12) chore: don't disable rule eqeqeq ([@Flarna](https://github.com/Flarna))
* [#8](https://github.com/open-telemetry/opentelemetry-js-api/pull/8) chore: remove nycrc in favor of tsconfig reporting ([@dyladan](https://github.com/dyladan))
* [#3](https://github.com/open-telemetry/opentelemetry-js-api/pull/3) chore: add test workflow ([@dyladan](https://github.com/dyladan))
* [#4](https://github.com/open-telemetry/opentelemetry-js-api/pull/4) chore: remove package lock ([@dyladan](https://github.com/dyladan))
* [#2](https://github.com/open-telemetry/opentelemetry-js-api/pull/2) chore: add lint workflow ([@dyladan](https://github.com/dyladan))

### Committers: 2

* Daniel Dyla ([@dyladan](https://github.com/dyladan))
* Gerhard Stöbich ([@Flarna](https://github.com/Flarna))

## v0.17.0

Versions previous to `0.18.0` were developed in another repository.
To see previous changelog entries see the [CHANGELOG.md](https://github.com/open-telemetry/opentelemetry-js/blob/main/CHANGELOG.md).
