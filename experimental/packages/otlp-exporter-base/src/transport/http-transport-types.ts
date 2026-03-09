/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import type { HeadersFactory } from '../configuration/otlp-http-configuration';

export interface HttpRequestParameters {
  url: string;
  headers: HeadersFactory;
  compression: 'gzip' | 'none';
  userAgent?: string;
}
