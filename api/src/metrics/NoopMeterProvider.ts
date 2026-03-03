/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import { Meter, MeterOptions } from './Meter';
import { MeterProvider } from './MeterProvider';
import { NOOP_METER } from './NoopMeter';

/**
 * An implementation of the {@link MeterProvider} which returns an impotent Meter
 * for all calls to `getMeter`
 */
export class NoopMeterProvider implements MeterProvider {
  getMeter(_name: string, _version?: string, _options?: MeterOptions): Meter {
    return NOOP_METER;
  }
}

export const NOOP_METER_PROVIDER = new NoopMeterProvider();
