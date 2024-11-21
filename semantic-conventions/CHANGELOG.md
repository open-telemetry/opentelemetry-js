<!-- markdownlint-disable MD004 -->
# CHANGELOG

All notable changes to the semantic-conventions package will be documented in this file.

## Unreleased

### :boom: Breaking Change

### :rocket: (Enhancement)

### :bug: (Bug Fix)

### :books: (Refine Doc)

### :house: (Internal)

## 1.28.0

### :rocket: (Enhancement)

* feat: update semantic conventions to 1.28.0 [#5181](https://github.com/open-telemetry/opentelemetry-js/pull/5181) @trentm

### :books: (Refine Doc)

* chore: Improve documentation on entry-points (top-level and "incubating") and on deprecations. [#5025](https://github.com/open-telemetry/opentelemetry-js/issues/5025) @trentm

### :house: (Internal)

* chore: Update the comments of some deprecated constants to point to the currently relevant replacement constant, if any. [#5160](https://github.com/open-telemetry/opentelemetry-js/pull/5160) @trentm
* chore: Minor improvements to formatting of comments. [#5100](https://github.com/open-telemetry/opentelemetry-js/pull/5100) @trentm

## 1.27.0

* Version bump only
* Note: This package will now be versioned according to the version of semantic conventions being provided.

## 1.26.0

Note: This package will now be versioned according to the version of semantic conventions being provided.

### :rocket: (Enhancement)

* feat(semconv): update semantic conventions to 1.27 (from 1.7.0) [#4690](https://github.com/open-telemetry/opentelemetry-js/pull/4690) @dyladan
  * Exported names have changed to `ATTR_{name}` for attributes (e.g. `ATTR_HTTP_REQUEST_METHOD`), `{name}_VALUE_{value}` for enumeration values (e.g. `HTTP_REQUEST_METHOD_VALUE_POST`), and `METRIC_{name}` for metrics. Exported names from previous versions are deprecated.
  * Import `@opentelemetry/semantic-conventions` for *stable* semantic conventions. Import `@opentelemetry/semantic-conventions/incubating` for all semantic conventions, stable and unstable.

### :house: (Internal)
