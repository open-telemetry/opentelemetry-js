# Migrating to stable HTTP and database semantic conventions

This document describes how users of **OTel JS** instrumentations can migrate to stable **HTTP** and **database**-related semantic conventions (semconv).

For example, consider an HTTP client making a `GET /users/42` request that receives an HTTP 200 response status. HTTP instrumentation will generate a [Span](https://opentelemetry.io/docs/concepts/signals/traces/#spans) representing that request/response. Should the HTTP request method be captured with an attribute named `http.method` or `http.request.method`? The response status with `http.status_code` or `http.response.status_code`? This is what semantic conventions define. Which attribute names are used might matter when they are ingested into your Observability system: queries, dashboards, alerts, etc. might be relying on specific attribute names.

To allow users to **migrate** from old names to the stabilized names over a period of time, OpenTelemetry defined a recommended migration process based on setting the `OTEL_SEMCONV_STABILITY_OPT_IN` environment variable to indicate whether old, stable, or both sets of field names should be used. See [the HTTP migration guide](https://opentelemetry.io/docs/specs/semconv/non-normative/http-migration/) and the [database migration guide](https://opentelemetry.io/docs/specs/semconv/non-normative/db-migration/).

For **OTel JS users**, as of 2025-10, **not all instrumentations support stable semconv and `OTEL_SEMCONV_STABILITY_OPT_IN` yet**. Support for `http.*` attributes is complete, but not yet for `net.*` and `db.*` attributes.

## What's the easiest thing I can do?

1. Set the `OTEL_SEMCONV_STABILITY_OPT_IN=http/dup,database/dup` environment variable when you configure an OTel JS SDK. This tells instrumentations (that support it) to *emit* both old and stable semconv attributes.
2. Migrate queries/dashboards/alerts in your Observability system to **use the stable `http.*` semconv** as described in [the HTTP migration guide](https://opentelemetry.io/docs/specs/semconv/non-normative/http-migration/).
3. For now, continue to **use the old `net.*` and `db.*` attributes** in your Observability system.

Future:

4. When [OTel JS instrumentations support it](https://github.com/open-telemetry/opentelemetry-js/issues/5663): migrate queries/dashboards/alerts in your Observability system to use the stable `net.*` semconv as described in [the HTTP migration guide](https://opentelemetry.io/docs/specs/semconv/non-normative/http-migration/).
5. When [OTel JS instrumentations support it](https://github.com/open-telemetry/opentelemetry-js-contrib/issues/2953): migrate queries/dashboards/alerts in your Observability system to use the stable `db.*` semconv as described in [the database migration guide](https://opentelemetry.io/docs/specs/semconv/non-normative/db-migration/).
6. Sometime after a OTel JS SDK 3.0 release (anticipated to be in or after June 2026), you can drop usage of the `OTEL_SEMCONV_STABILITY_OPT_IN` environment variable. In JS SDK 3.0, instrumentations will only support the stable HTTP and database semantic conventions.

## Browser instrumentations

Some HTTP-related instrumentations are for use in the browser:
[`@opentelemetry/instrumentation-fetch`](https://github.com/open-telemetry/opentelemetry-js/tree/main/experimental/packages/opentelemetry-instrumentation-fetch/#semantic-conventions),
[`@opentelemetry/instrumentation-xml-http-request`](https://github.com/open-telemetry/opentelemetry-js/tree/main/experimental/packages/opentelemetry-instrumentation-xml-http-request/#semantic-conventions), and
[`@opentelemetry/instrumentation-document-load`](https://github.com/open-telemetry/opentelemetry-js-contrib/blob/main/packages/instrumentation-document-load/#semantic-conventions). Environment variables don't exist in the browser so, instead of `OTEL_SEMCONV_STABILITY_OPT_IN`, use the `semconvStabilityOptIn` config option to these instrumentations.

## Timeline

- 2023-11:03: In [semconv v1.23.0](https://github.com/open-telemetry/semantic-conventions/blob/main/CHANGELOG.md#v1230-2023-11-03), HTTP semantic conventions were stabilized.
- 2025-05-02: In [semconv v1.33.0](https://github.com/open-telemetry/semantic-conventions/blob/main/CHANGELOG.md#v1330), database semantic conventions were stabilized.
- 2024-09-10 to 2025-09-19: All OTel JS instrumentations producing `http.*` were updated to support stable semconv and `OTEL_SEMCONV_STABILITY_OPT_IN`.
- Ongoing: [OTel JS instrumentations producing **`net.*` semconv** are being updated](https://github.com/open-telemetry/opentelemetry-js/issues/5663) to support stable semconv and `OTEL_SEMCONV_STABILITY_OPT_IN`
- Ongoing: [OTel JS instrumentations producing **`db.*` semconv** are being updated](https://github.com/open-telemetry/opentelemetry-js-contrib/issues/2953) to support stable semconv and `OTEL_SEMCONV_STABILITY_OPT_IN`
- Projected 2025-06: As part of OTel JS SDK 3.0, instrumentations will emit *stable* HTTP and database semantic conventions by default, and drop support for old names.

## Q&A

### Why are `net.*` attributes controlled by `OTEL_SEMCONV_STABILITY_OPT_IN=http/dup`?

The semantic conventions for a number of networking-related attributes were stabilized as part of the same effort of stabilizing HTTP. Therefore when the [HTTP migration process](https://opentelemetry.io/docs/specs/semconv/non-normative/http-migration/) was defined, it included migration of `net.*` attributes -- e.g. `net.peer.name → server.address` and `net.protocol.version → network.protocol.version`.

Even though `net.*` attributes are used in non-HTTP instrumentations (e.g. `@opentelemetry/instrumentation-amqplib`, `@opentelemetry/instrumentation-mysql2`) they will still use the `http` (or `http/dup`) value in `OTEL_SEMCONV_STABILITY_OPT_IN`.

(Note: One exception to this is `@opentelemetry/instrumentation-pg`, which added support for stable semconv migration using `OTEL_SEMCONV_STABILITY_OPT_IN=db/dup` for both `net.*` and `db.*` attributes **before** the plan in this document was discussed.)
