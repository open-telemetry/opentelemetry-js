/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * MeterConfig defines various configurable aspects of a Meter's behavior.
 */
export interface MeterConfig {
  /** Whether this meter is disabled. Disabled meters no-op all instruments. */
  disabled?: boolean;
}

export const DEFAULT_METER_CONFIG: MeterConfig = {
  disabled: false,
};