/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import { InstrumentType } from './MetricData';

/**
 * Cardinality Limit selector based on metric instrument types.
 */
export type CardinalitySelector = (instrumentType: InstrumentType) => number;
