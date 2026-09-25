/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import { getBooleanFromEnv } from '@opentelemetry/core';
import { isHttpDiagnosticsChannelSupported } from '../../src/diagnostics-channel';

/**
 * Whether the suites run with the modules patched, i.e. the diagnostics
 * channel path is not requested through `OTEL_INSTRUMENTATION_HTTP_USE_DIAGNOSTICS_CHANNEL`
 * (see the `test:cjs:diagch` script) or not supported by the runtime.
 */
export const expectModulePatching =
  !getBooleanFromEnv('OTEL_INSTRUMENTATION_HTTP_USE_DIAGNOSTICS_CHANNEL') ||
  !isHttpDiagnosticsChannelSupported();

/**
 * `it` for behavior only observable while the modules are patched: requests
 * intercepted (`nock`) or thrown before a real `ClientRequest` is created.
 */
export const itModulePatchingOnly = expectModulePatching ? it : it.skip;
