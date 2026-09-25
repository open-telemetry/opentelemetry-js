# `@opentelemetry/sdk-trace-web` has been removed

> [!IMPORTANT]
> The `@opentelemetry/sdk-trace-web` package has been removed in favor of `@opentelemetry/sdk-trace`.
> See [the migration notes](../../doc/3.x/migration-guide.md#opentelemetrysdk-trace-base-package-removed).
> See also the current, active development of a [Browser SDK in the opentelemetry-browser.git repo](https://github.com/open-telemetry/opentelemetry-browser/tree/main/packages/sdk/).
>
> Use [the "v2.11.0" git tag to see the package source code for the last sdk-trace-web release](https://github.com/open-telemetry/opentelemetry-js/tree/v2.11.0/packages/opentelemetry-sdk-trace-web).

In Jun 2026, a new `@opentelemetry/sdk-trace` package (starting with version 2.9.0) was created to replace the `sdk-trace-base`, `sdk-trace-node`, and `sdk-trace-web` packages.
The new `sdk-trace` package cleans up some interfaces, removes some unnecessary functionality (which better belongs in higher-level SDK packages such as [`sdk-node`](../../experimental/packages/opentelemetry-sdk-node/) and [`browser-sdk`](https://github.com/open-telemetry/opentelemetry-browser/tree/main/packages/sdk/)), and in the case of sdk-trace-web moves some instrumentation-related utilities to [a new separate package](../../experimental/packages/web-common).

As part of the OTel JS SDK 3.0 release in the fall of 2026 the `sdk-trace-*` packages have been removed.
