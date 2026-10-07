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
  // An ES private field, so it cannot clash with subclasses' own state fields.
  #enabled = false;

  constructor(
    instrumentationName: string,
    instrumentationVersion: string,
    config: ConfigType
  ) {
    super(instrumentationName, instrumentationVersion, config);

    // Subclasses override enable/disable without calling super, so wrap them; a throw
    // leaves the flag unchanged. A class-field enable/disable would replace this wrapper.
    const enable = this.enable;
    const disable = this.disable;
    this.enable = () => {
      enable.call(this);
      this.#enabled = true;
    };
    this.disable = () => {
      disable.call(this);
      this.#enabled = false;
    };

    if (this._config.enabled) {
      this.enable();
    }
  }

  /** Whether enable() was called more recently than disable(). Tracks calls
   * only: a subclass that returns early from enable() still reads as enabled. */
  public isEnabled(): boolean {
    return this.#enabled;
  }
}
