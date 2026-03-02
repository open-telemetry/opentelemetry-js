/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import { SessionObserver } from './SessionObserver';

export interface SessionPublisher {
  addObserver(observer: SessionObserver): void;
}
