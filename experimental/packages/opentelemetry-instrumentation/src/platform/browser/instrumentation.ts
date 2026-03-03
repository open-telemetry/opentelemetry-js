/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import { InstrumentationAbstract } from '../../instrumentation';
import * as types from '../../types';
import { InstrumentationConfig } from '../../types';

/**
 * Base abstract class for instrumenting web plugins
 */
export abstract class InstrumentationBase<
    ConfigType extends InstrumentationConfig = InstrumentationConfig,
  >
  extends InstrumentationAbstract<ConfigType>
  implements types.Instrumentation<ConfigType>
{
  constructor(
    instrumentationName: string,
    instrumentationVersion: string,
    config: ConfigType
  ) {
    super(instrumentationName, instrumentationVersion, config);

    if (this._config.enabled) {
      this.enable();
    }
  }
}
