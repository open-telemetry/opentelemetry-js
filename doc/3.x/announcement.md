# Planned SDK 3.0 Release (Important Dates and Information)

> [!IMPORTANT]
>
> - **Feature-freeze for 2.x: September 1, 2026**
> - **SDK 3.0 release: September 30, 2026**

## Description

### Quick Summary

We're planning to release SDK 3.0. This release continues to clean up the SDK's public API surface, drops unmaintained packages, raises minimum runtime requirements, and aligns more closely with the OpenTelemetry specification.

We plan to **feature-freeze 2.x on September 1, 2026**. Any feature PRs not yet merged at that point will target SDK 3.0.
We plan to **release SDK 3.0 on September 30, 2026**.

### Why we're releasing SDK 3.0

- **Dual CJS/ESM exports**: packages will ship proper ESM and CJS dual exports via a migration to `tsdown` ([#6293](https://github.com/open-telemetry/opentelemetry-js/pull/6293)).
- **Raise minimum Node.js version**: Node.js v20 reached EOL on April 30, 2026. SDK 3.0 will require Node.js v22+ (exact minimum TBD, discussion tracked in [#6420](https://github.com/open-telemetry/opentelemetry-js/issues/6420)).
- **Consolidated tracing SDK**: `@opentelemetry/sdk-trace-base`, `@opentelemetry/sdk-trace-node`, and `@opentelemetry/sdk-trace-web` are replaced by a single `@opentelemetry/sdk-trace` package. The split into three packages has caused confusion and inconsistencies: `NodeTracerProvider` and `WebTracerProvider` exposed a `.register()` convenience method that doesn't exist in the logs and metrics SDKs, and the trace SDK supported env-var based configuration ([#6595](https://github.com/open-telemetry/opentelemetry-js/issues/6595)) that the other SDKs do not. The new package removes these inconsistencies and aligns the trace SDK with the rest of the SDK. See the [`sdk-trace` README](https://github.com/open-telemetry/opentelemetry-js/tree/main/packages/sdk-trace#readme) for migration instructions.
- **Drop unmaintained and deprecated packages**: packages such as `@opentelemetry/propagator-jaeger`, `@opentelemetry/instrumentation-restify`, `@opentelemetry/shim-opentracing`, and `@opentelemetry/shim-opencensus` are being removed to reduce maintenance burden.
- **Clean up public API surface**: removal of unintentional re-exports (e.g., `export *` in `sdk-node`) and the `merge` export from `@opentelemetry/core`.
- **Specification alignment**: the Prometheus exporter is being aligned with the specification ([#6605](https://github.com/open-telemetry/opentelemetry-js/issues/6605)), including defaulting the host to `localhost` ([#6594](https://github.com/open-telemetry/opentelemetry-js/issues/6594)).

### How (and when) we're moving forward

> [!IMPORTANT]
> `@opentelemetry/api` follows a different versioning scheme. While it will **not** receive breaking changes for API consumers or instrumentation authors, a new minor version of `@opentelemetry/api` **may be released alongside SDK 3.0**. Per the [OpenTelemetry specification](https://github.com/open-telemetry/opentelemetry-specification/blob/main/specification/upgrading.md), new API minor versions are always additive and backward-compatible for consumers, but **third-party SDK implementors must update their implementations** to support the new API version.

Development for SDK 3.0 takes place on the `main` branch.

**Now until September 1, 2026 is the feature triage period.** During this phase we will discuss and decide which issues should be included in the SDK 3.0 milestone. The [current milestone scope](https://github.com/open-telemetry/opentelemetry-js/milestone/20) is a draft and subject to change. If you'd like to influence the scope:

- 👍 a GitHub issue to signal support for including it in 3.0.
- Leave a comment on an issue to raise concerns or provide context.
- Join the [JavaScript SIG meetings](https://github.com/open-telemetry/opentelemetry-js#contributing) to discuss in person.

On **September 1, 2026 we will enter feature-freeze for 2.x**. At that point a `v2.x` branch will be created. From this point onward:

- Only high-severity bugfix and security backports will be accepted for 2.x (on the `v2.x` branch).
- Backported fixes **must be merged into `main` first**, unless the fix targets a package that no longer exists on `main`.
- Any unmerged feature PRs will only be accepted for SDK 3.0.

**September 30, 2026** we will release SDK 3.0.

**2.x will continue to receive high-severity bugfix and security releases until September 30, 2027** (one year after the SDK 3.0 release).

## What this means for you

### End-Users

You will still receive high-severity bugfixes and security fixes on 2.x, but new features merged after **September 1, 2026** will only be released in **SDK 3.0 on September 30, 2026**.

There will be no breaking changes in `@opentelemetry/api`. Any code written against `@opentelemetry/api` should continue to work as-is. You may need to update to the latest version of `@opentelemetry/api` to stay compatible with SDK 3.0 packages.

Upon release, you may need to adjust your SDK setup code to the new interface. To prepare:

- Keep `@opentelemetry/*` packages up-to-date and follow the migration paths for any `@deprecated` APIs.
- Ensure you're on Node.js v22 or later before upgrading to SDK 3.0.
- If you use `@opentelemetry/sdk-trace-base`, `sdk-trace-node`, or `sdk-trace-web`, migrate to `@opentelemetry/sdk-trace`. See the [`sdk-trace` README](https://github.com/open-telemetry/opentelemetry-js/tree/main/packages/sdk-trace#readme) for a detailed migration guide.
- If you depend on any of the other packages being dropped (`propagator-jaeger`, `instrumentation-restify`, `shim-opencensus`), plan your migration ahead of time.

### Instrumentation authors

`@opentelemetry/instrumentation` may receive breaking changes; you may need to update your instrumentation upon release.

`@opentelemetry/api` will **not** receive breaking changes. Your actual instrumentation code (writing metrics, traces, interacting with context and propagation) will remain the same.

### Third-party SDK implementors

If you maintain a third-party SDK implementation (i.e. you implement `@opentelemetry/api` interfaces rather than just consuming them), a new minor version of `@opentelemetry/api` released alongside SDK 3.0 **may require you to update your implementation**. Per the [OpenTelemetry specification](https://github.com/open-telemetry/opentelemetry-specification/blob/main/specification/upgrading.md), SDK implementors must keep their implementations up-to-date with the latest API version. This is a breaking change for your SDK, but transparent to end-users and instrumentation authors.

### Third-party distributors

If you expose or accept SDK 2.x types, you may need to bump your distribution's major version when upgrading to SDK 3.0. Follow the same steps as end-users above and review any deprecated APIs early.
