/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import type {
  ATTR_TELEMETRY_SDK_NAME,
  ATTR_TELEMETRY_SDK_LANGUAGE,
  ATTR_TELEMETRY_SDK_VERSION,
} from '@opentelemetry/semantic-conventions';
import type { ATTR_PROCESS_RUNTIME_NAME } from '../semconv';

// One declaration describes both platforms, so values stay `string` rather
// than each barrel's literal ('nodejs' vs 'webjs').
export interface SdkInfo {
  [ATTR_TELEMETRY_SDK_NAME]: string;
  [ATTR_PROCESS_RUNTIME_NAME]: string;
  [ATTR_TELEMETRY_SDK_LANGUAGE]: string;
  [ATTR_TELEMETRY_SDK_VERSION]: string;
}
