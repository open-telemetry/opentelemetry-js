# OpenTelemetry JS Threat Model

This document describes the threat model for the OpenTelemetry JavaScript
projects, including [opentelemetry-js](https://github.com/open-telemetry/opentelemetry-js)
and [opentelemetry-js-contrib](https://github.com/open-telemetry/opentelemetry-js-contrib).
Its purpose is to define what the project considers a security vulnerability and
what falls outside that scope, helping security researchers, maintainers, and
users set clear expectations.

## Trusted Elements

In the OpenTelemetry JS threat model, the following elements are considered
**trusted**. Vulnerabilities that require the compromise of these trusted
elements are outside the scope of this threat model.

- **Application code and its inputs to OpenTelemetry APIs** — Everything passed
  to SDK and API packages (span names, attribute values, metric measurements,
  log bodies, etc.) is trusted input. It is the application developer's
  responsibility to sanitize data before passing it to OpenTelemetry APIs.

- **Environment variables** — `OTEL_*` environment variables and any other
  environment variables used for configuration are trusted. Scenarios that
  require an attacker to control environment variables are out of scope.

- **The operating system and runtime** — The underlying OS, the runtime,
  and browser environments are trusted.

- **Export destinations** — The configured collector or backend endpoints are
  trusted. Users should not export telemetry to untrusted destinations, as
  telemetry data discloses information about the application. Responses received
  from export destinations (response headers, error messages, etc.) are considered
  untrusted.

- **Instrumented libraries** — For instrumentations, the third-party library
  being instrumented (e.g., `express`, `pg`, `redis`) is trusted. If that
  library has a vulnerability, it is not an OpenTelemetry vulnerability.

- **Build environment and development tooling** — Build scripts, CI/CD
  pipelines, and development tools operate in a trusted environment.

## What Constitutes a Vulnerability

### SDK and API Packages

A vulnerability exists in SDK or API packages if a defect in the SDK itself
can cause — even when used correctly with trusted inputs:

- Crashes or unrecoverable errors in the application.
- Unbounded degradation of runtime performance.
- Unintended disclosure of telemetry data.

### Propagators (Context Extraction)

Propagators parse context from headers that originate from untrusted network
sources (e.g., `traceparent`, `tracestate`, `baggage`). A vulnerability exists
if untrusted propagation headers can cause:

- Crashes or unrecoverable errors.
- Unbounded resource consumption (e.g., regular expression denial of service on
  header parsing).
- Injection of data that bypasses expected validation or escaping.

### Instrumentations

Instrumentations process data from potentially untrusted inbound network
connections (HTTP headers, URLs, gRPC metadata, etc.). A vulnerability exists if
untrusted inbound data can cause:

- Crashes that would **not** have occurred without the instrumentation installed.
- Unbounded resource consumption (e.g., infinite loops generating spans) that
  goes beyond reasonable instrumentation overhead and would not otherwise occur
  in the uninstrumented application.
- Disclosure of sensitive data that the instrumented library itself would not
  expose.

### Exporters

Exporters send telemetry to a configured destination and process responses from
it. While the destination is trusted, its responses are not — an export
destination could become compromised. A vulnerability exists if a response from
an export destination can cause:

- Crashes or unrecoverable errors in the application.
- Unbounded resource consumption (e.g., reading an arbitrarily large response
  body into memory).

### Denial of Service (DoS)

For a behavior to be considered a DoS vulnerability, the proof of concept must
demonstrate:

- The API is being correctly used and is stable/documented.
- The behavior is directly exploitable by an untrusted source without requiring
  application mistakes.
- [Asymmetric resource consumption](https://cwe.mitre.org/data/definitions/405.html):
  the attacker expends significantly fewer resources than the target consumes.
- The behavior goes beyond expected instrumentation or SDK overhead.

## What Does NOT Constitute a Vulnerability

### Malicious Application Code

Application code is trusted. Any scenario that requires malicious first-party
code or malicious dependencies is not a vulnerability in OpenTelemetry.

### Unsanitized Application Inputs

OpenTelemetry trusts the inputs provided to it by application code. Scenarios
that require control over values passed to OpenTelemetry APIs (e.g., prototype
pollution via attribute values) are not considered vulnerabilities. It is the
application's responsibility to sanitize inputs.

### Misuse of APIs

Any usage of OpenTelemetry APIs that does not adhere to the contract laid out by
their TypeScript types and documentation is not covered by this threat model.
Scenarios that rely on passing incorrect types, calling internal or undocumented
APIs, or otherwise violating the API contract are not considered vulnerabilities.

### Environment Variable Manipulation

Since environment variables are trusted, scenarios requiring attacker control of
environment variables are out of scope.

### Instrumentation Overhead

Additional CPU and memory consumption from instrumentations within reasonable
limits is expected behavior. Pushing an application over resource limits due to
the expected cost of instrumentation is not a vulnerability.

### Vulnerabilities in Instrumented Libraries

Bugs or vulnerabilities in the libraries being instrumented (e.g., `express`,
`pg`, `redis`) are not OpenTelemetry vulnerabilities. Only *new* attack surface
introduced by the instrumentation is in scope.

### Crashes That Would Occur Without Instrumentation

If an inbound request would crash the application regardless of whether an
instrumentation is installed, the crash is not an OpenTelemetry vulnerability.

### Dependency Vulnerabilities

Vulnerabilities reported in third-party dependencies are not automatically
considered vulnerabilities in OpenTelemetry JS:

- If the vulnerable code path in the dependency is **not exercised** by
  OpenTelemetry, the report is not accepted.
- If the vulnerable code path **is** exercised but the dependency is specified as
  a version range that includes the fixed version, an expedited release will not
  be issued. Users can resolve the issue by re-generating their `package-lock.json`
  (or equivalent lock file) to pick up the patched dependency version.
- An expedited release may be considered only when the vulnerable code path is
  exercised by OpenTelemetry **and** the dependency is pinned or constrained to a
  range that does not include the fix.

### Build System Attacks

Attacks requiring control of the build environment (e.g., command injection via
build tool environment variables, path hijacking in build directories) are out of
scope. The build environment is trusted.
