/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

export interface SessionIdGenerator {
  generateSessionId(): string;
}
