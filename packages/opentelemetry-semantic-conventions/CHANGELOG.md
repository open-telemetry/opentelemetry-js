<!-- markdownlint-disable MD004 -->
# CHANGELOG

All notable changes to semantic conventions package in this project will be documented in this file.

## Unreleased

Note: This package will now be versioned according to the version of semantic conventions being provided.

### :boom: Breaking Change

### :rocket: (Enhancement)

* feat(semconv): update semantic conventions to 1.27 (from 1.7.0) [#4690](https://github.com/open-telemetry/opentelemetry-js/pull/4690) @dyladan
  * Exported names have changed to `ATTR_{name}` for attributes (e.g. `ATTR_HTTP_REQUEST_METHOD`), `{name}_VALUE_{value}` for enumeration values (e.g. `HTTP_REQUEST_METHOD_VALUE_POST`), and `METRIC_{name}` for metrics. Exported names from previous versions are deprecated.
  * Import `@opentelemetry/semantic-conventions` for *stable* semantic conventions. Import `@opentelemetry/semantic-conventions/incubating` for all semantic conventions, stable and unstable.

### :bug: (Bug Fix)

### :books: (Refine Doc)

### :house: (Internal)
