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

import * as types from '../../types';
import * as path from 'path';
import * as RequireInTheMiddle from 'require-in-the-middle';
import * as semver from 'semver';
import { InstrumentationAbstract } from '../../instrumentation';
import {
  InstrumentationModuleDefinition,
  InstrumentationModuleFile,
} from './types';

/**
 * Base abstract class for instrumenting node plugins
 */
export abstract class InstrumentationBase<T = any>
  extends InstrumentationAbstract
  implements types.Instrumentation {
  private _modules: InstrumentationModuleDefinition<T>[];
  private _hooks: RequireInTheMiddle.Hooked[] = [];
  private _enabled = false;

  constructor(
    instrumentationName: string,
    instrumentationVersion: string,
    config: types.InstrumentationConfig = {}
  ) {
    super(instrumentationName, instrumentationVersion, config);

    let modules = this.init();

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
        module.moduleExports = exports;
        return module.patch(exports);
      }
      return exports;
    }

    if (module.name === name) {
      // main module
      const version = require(path.join(baseDir, 'package.json')).version;
      if (typeof version === 'string' && this._isSupported(name, version)) {
        if (typeof module.patch === 'function') {
          module.moduleExports = exports;
          if (this._enabled) {
            return module.patch(exports);
          }
        }
      }
    } else {
      // internal file
      const files = module.files || [];
      const file = files.find(
        (file: InstrumentationModuleFile<T>) => file.name === name
      );
      if (file) {
        file.moduleExports = exports;
        if (this._enabled) {
          return file.patch(exports);
        }
      }
    }
    return exports;
  }

  public enable() {
    if (this._enabled) {
      return;
    }
    this._enabled = true;

    // already hooked, just call patch again
    if (this._hooks.length > 0) {
      for (const module of this._modules) {
        if (typeof module.patch === 'function' && module.moduleExports) {
          module.patch(module.moduleExports);
        }
        for (const file of module.files) {
          if (file.moduleExports) {
            file.patch(file.moduleExports);
          }
        }
      }
      return;
    }

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
    if (!this._enabled) {
      return;
    }
    this._enabled = false;

    for (const module of this._modules) {
      if (typeof module.unpatch === 'function' && module.moduleExports) {
        module.unpatch(module.moduleExports);
      }
      for (const file of module.files) {
        if (file.moduleExports) {
          file.unpatch(file.moduleExports);
        }
      }
    }
  }
}
