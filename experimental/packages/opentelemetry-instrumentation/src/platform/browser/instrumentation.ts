/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import { InstrumentationAbstract } from '../../instrumentation';
import type * as types from '../../types';
import type { InstrumentationConfig } from '../../types';

/**
 * Base abstract class for instrumenting web plugins
 */
export abstract class InstrumentationBase<
    ConfigType extends InstrumentationConfig = InstrumentationConfig,
  >
  extends InstrumentationAbstract<ConfigType>
  implements types.Instrumentation<ConfigType>
{
  /** Set by subclasses in enable() and disable(); matches the Node.js base. */
  protected _enabled = false;

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

  /** Whether the instrumentation is active. Subclasses that never set `_enabled` read false. */
  public isEnabled(): boolean {
    return this._enabled;
  }
}
