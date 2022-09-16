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

import * as RequireInTheMiddle from 'require-in-the-middle';
import * as path from 'path';

export type Hooked = {
  moduleName: string
  onRequire: RequireInTheMiddle.OnRequireFn
};

// The version number at the end of this symbol should be incremented whenever there are
// changes (even non-breaking) to the `RequireInTheMiddleSingleton` class's public interface
const RITM_SINGLETON_SYM = Symbol.for('OpenTelemetry.js.sdk.require-in-the-middle.v1');

/**
 * Singleton class for `require-in-the-middle`
 * Allows instrumentation plugins to patch modules with only a single `require` patch
 * WARNING: Because this class will be used to create a process-global singleton,
 * any change to the public interface of the class (even a non-breaking change like adding a method or argument)
 * could break the integration with different versions of `InstrumentationBase`.
 * When a change to the public interface of the class is made,
 * we should increment the version number at the end of the `RITM_SINGLETON_SYM` symbol.
 */
export class RequireInTheMiddleSingleton {
  private _modulesToHook: Hooked[] = [];

  constructor() {
    this._initialize();
  }

  private _initialize() {
    RequireInTheMiddle(
      // Intercept all `require` calls; we will filter the matching ones below
      null,
      { internals: true },
      (exports, name, basedir) => {
        // For internal files on Windows, `name` will use backslash as the path separator
        const normalizedModuleName = normalizePathSeparators(name);
        const matches = this._modulesToHook.filter(({ moduleName: hookedModuleName }) => {
          return shouldHook(hookedModuleName, normalizedModuleName);
        });

        for (const { onRequire } of matches) {
          exports = onRequire(exports, name, basedir);
        }

        return exports;
      }
    );
  }

  register(moduleName: string, onRequire: RequireInTheMiddle.OnRequireFn): Hooked {
    const hooked = { moduleName, onRequire };
    this._modulesToHook.push(hooked);
    return hooked;
  }

  static getGlobalInstance(): RequireInTheMiddleSingleton {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (global as any)[RITM_SINGLETON_SYM] = (global as any)[RITM_SINGLETON_SYM] ?? new RequireInTheMiddleSingleton();
  }
}

/**
 * Determine whether a `require`d module should be hooked
 *
 * @param {string} hookedModuleName Hooked module name
 * @param {string} requiredModuleName Required module name
 * @returns {boolean} Whether to hook the required module
 * @private
 */
export function shouldHook(hookedModuleName: string, requiredModuleName: string): boolean {
  return requiredModuleName === hookedModuleName || requiredModuleName.startsWith(hookedModuleName + '/');
}

/**
 * Normalize the path separators to forward slash in a module name or path
 *
 * @param {string} moduleNameOrPath Module name or path
 * @returns {string} Normalized module name or path
 */
function normalizePathSeparators(moduleNameOrPath: string): string {
  return path.sep !== '/'
    ? moduleNameOrPath.split(path.sep).join('/')
    : moduleNameOrPath;
}
