/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import * as api from '@opentelemetry/api';
import * as path from 'path';
import * as RequireInTheMiddle from 'require-in-the-middle';
import * as semver from 'semver';
import { BaseInstrumentation } from '../../instrumentation';
import {
  InstrumentationModuleDefinition,
  InstrumentationModuleFile,
} from './types';

/**
 * Base abstract class for instrumenting node plugins
 */
export abstract class Instrumentation<T = any>
  extends BaseInstrumentation
  implements api.Instrumentation {
  private _modules: InstrumentationModuleDefinition<T>[];
  private _hooks: RequireInTheMiddle.Hooked[] = [];

  constructor(
    instrumentationName: string,
    instrumentationVersion: string,
    config: api.InstrumentationConfig = {}
  ) {
    super(instrumentationName, instrumentationVersion, config);

    let modules = this._init();

    if (modules && !Array.isArray(modules)) {
      modules = [modules];
    }

    this._modules = (modules as InstrumentationModuleDefinition<T>[]) || [];

    if (this._modules.length === 0) {
      this._logger.warn(
        'No modules instrumentation has been defined,' +
          ' nothing will be patched'
      );
    }

    if (this._config.enabled) {
      this.enable();
    }
  }

  private _isSupported(name: string, version: string): boolean {
    for (const module of this._modules) {
      if (module.name === name) {
        if (!module.supportedVersions) {
          return true;
        }

        for (const supportedVersions of module.supportedVersions) {
          if (semver.satisfies(version, supportedVersions)) {
            return true;
          }
        }
      }
    }

    return false;
  }

  private _onRequire<T>(
    module: InstrumentationModuleDefinition<T>,
    exports: T,
    name: string,
    baseDir?: string
  ): T {
    if (!baseDir) {
      if (typeof module.patch === 'function') {
        return module.patch(exports);
      }
      return exports;
    }

    if (module.name === name) {
      // main module
      const version = require(path.join(baseDir, 'package.json')).version;
      if (typeof version === 'string' && this._isSupported(name, version)) {
        if (typeof module.patch === 'function') {
          return module.patch(exports);
        }
        return exports;
      }
    } else {
      // internal file
      const files = module.files || [];
      const file = files.find(
        (file: InstrumentationModuleFile<T>) => file.name === name
      );
      if (file) {
        return file.patch(exports);
      }
    }
    return exports;
  }

  public enable() {
    for (const module of this._modules) {
      this._hooks.push(
        RequireInTheMiddle(
          [module.name],
          { internals: true },
          (exports, name, baseDir) => {
            return this._onRequire<typeof exports>(
              (module as unknown) as InstrumentationModuleDefinition<
                typeof exports
              >,
              exports,
              name,
              baseDir
            );
          }
        )
      );
    }
  }

  public disable() {
    this._hooks.forEach(hook => {
      hook.unhook();
    });
    for (const module of this._modules) {
      if (typeof module.unpatch === 'function') {
        module.unpatch();
      }
      for (const file of module.files) {
        file.unpatch();
      }
    }
  }

  /**
   * Init method in which plugin should define _modules and patches for
   * methods
   */
  protected abstract _init():
    | InstrumentationModuleDefinition<T>
    | InstrumentationModuleDefinition<T>[];
}
