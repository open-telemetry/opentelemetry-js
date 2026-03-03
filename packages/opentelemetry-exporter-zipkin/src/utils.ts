/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */
import { GetHeaders } from './types';

export function prepareGetHeaders(
  getExportRequestHeaders: GetHeaders
): () => Record<string, string> | undefined {
  return function () {
    return getExportRequestHeaders();
  };
}
