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
  /** Subclasses set this to true when their enable() succeeds and to false in
   * their disable(); isEnabled() returns it. */
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

  /** Returns `_enabled`, which stays false unless the subclass's enable() sets it. */
  public isEnabled(): boolean {
    return this._enabled;
  }
}
