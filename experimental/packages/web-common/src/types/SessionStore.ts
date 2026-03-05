/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import type { Session } from './Session';

export interface SessionStore {
  save(session: Session): Promise<void>;
  get(): Promise<Session | null>;
}
