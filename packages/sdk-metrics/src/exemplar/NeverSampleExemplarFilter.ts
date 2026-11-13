/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import type { Context, Attributes } from '@opentelemetry/api';
import type { ExemplarFilter } from './ExemplarFilter';

export class NeverSampleExemplarFilter implements ExemplarFilter {
  shouldSample(
    _value: number,
    _timestamp: number,
    _attributes: Attributes,
    _ctx: Context
  ): boolean {
    return false;
  }
}
