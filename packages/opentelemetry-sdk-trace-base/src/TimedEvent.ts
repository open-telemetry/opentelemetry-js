/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import { HrTime, Attributes } from '@opentelemetry/api';

/**
 * Represents a timed event.
 * A timed event is an event with a timestamp.
 */
export interface TimedEvent {
  time: HrTime;
  /** The name of the event. */
  name: string;
  /** The attributes of the event. */
  attributes?: Attributes;
  /** Count of attributes of the event that were dropped due to collection limits */
  droppedAttributesCount?: number;
}
