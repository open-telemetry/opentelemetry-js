/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import type { OTLPExporterConfigBase } from './legacy-base-configuration';
import { wrapStaticHeadersInFunction } from './shared-configuration';
import type { HeadersFactory } from './otlp-http-configuration';

export function convertLegacyHeaders(
  config: OTLPExporterConfigBase
): HeadersFactory | undefined {
  if (typeof config.headers === 'function') {
    return config.headers;
  }
  return wrapStaticHeadersInFunction(config.headers);
}
