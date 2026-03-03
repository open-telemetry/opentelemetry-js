/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import { Context, HrTime, Attributes } from '@opentelemetry/api';
import { ExemplarFilter } from './ExemplarFilter';

export class NeverSampleExemplarFilter implements ExemplarFilter {
  shouldSample(
    _value: number,
    _timestamp: HrTime,
    _attributes: Attributes,
    _ctx: Context
  ): boolean {
    return false;
  }
}
