<!-- markdownlint-disable MD004 -->
# CHANGELOG

All notable changes to the semantic-conventions-genai package will be documented in this file.

## Unreleased

### :boom: Breaking Changes

### :rocket: Features

* feat(semantic-conventions-genai): initial generation of the `@opentelemetry/semantic-conventions-genai` package [#7014](https://github.com/open-telemetry/opentelemetry-js/pull/7014) @wolfgangcodes
  * Generated from the [GenAI semantic conventions registry](https://github.com/open-telemetry/semantic-conventions-genai), which was split out of `@opentelemetry/semantic-conventions`.
  * This package version will track the schema version of the [GenAI semantic conventions registry](https://github.com/open-telemetry/semantic-conventions-genai) once that registry begins publishing.
  * We are starting at `0.0.0` since there has not yet been a release of the `@opentelemetry/semantic-conventions-genai` registry; versioning approach discussed in [semantic-conventions-genai#247](https://github.com/open-telemetry/semantic-conventions-genai/issues/247#issuecomment-4746523985).
  * Exposes stable conventions from `@opentelemetry/semantic-conventions-genai` (currently has no exports) and unstable/incubating conventions from `@opentelemetry/semantic-conventions-genai/incubating`.

### :bug: Bug Fixes

### :books: Documentation

### :house: Internal
