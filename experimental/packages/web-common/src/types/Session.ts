/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Session {
  id: string;
  startTimestamp: number; // epoch milliseconds
}
