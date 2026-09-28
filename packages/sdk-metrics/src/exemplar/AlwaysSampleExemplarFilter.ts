/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import type { Context, HrTime, Attributes } from '@opentelemetry/api';
import type { ExemplarFilter } from './ExemplarFilter';

export class AlwaysSampleExemplarFilter implements ExemplarFilter {
  shouldSample(
    _value: number,
    _timestamp: HrTime,
    _attributes: Attributes,
    _ctx: Context
  ): boolean {
    return true;
  }
}
