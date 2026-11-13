/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import type { InstrumentationScope } from '@opentelemetry/core';
import type { MeterConfig } from './MeterConfig';
import { DEFAULT_METER_CONFIG } from './MeterConfig';

export type MeterConfigurator = (
  meterScope: InstrumentationScope
) => MeterConfig | null | undefined;

export interface MeterConfiguratorCondition {
  /** Wildcard-capable meter name pattern, e.g. 'noisy-lib-*' or '*' */
  name: string;
  config: MeterConfig;
}

/**
 * Creates a MeterConfigurator from an ordered list of pattern -> config
 * mappings. First match wins.
 */
export function createMeterConfigurator(
  conditions: MeterConfiguratorCondition[]
): MeterConfigurator {
  return (meterScope: InstrumentationScope) => {
    for (const { name, config } of conditions) {
      if (matchesPattern(name, meterScope.name)) {
        return { ...DEFAULT_METER_CONFIG, ...config };
      }
    }
    return null;
  };
}

function matchesPattern(pattern: string, name: string): boolean {
  if (pattern === '*') return true;
  if (!pattern.includes('*')) return pattern === name;
  const regex = new RegExp(
    '^' + pattern.split('*').map(escapeRegExp).join('.*') + '$'
  );
  return regex.test(name);
}

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}