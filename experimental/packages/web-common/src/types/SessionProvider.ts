/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

export interface SessionProvider {
  getSessionId(): string | null;
}
