/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

// Loaded through `mocha --require` by the `test:cjs:diagch` script so the
// suites pick up the diagnostics channel path from the environment.
process.env.OTEL_INSTRUMENTATION_HTTP_USE_DIAGNOSTICS_CHANNEL = 'true';
