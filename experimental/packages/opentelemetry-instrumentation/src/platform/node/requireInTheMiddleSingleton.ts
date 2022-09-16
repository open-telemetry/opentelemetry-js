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

/**
 * Singleton class for `require-in-the-middle`
 * Allows instrumentation plugins to patch modules with only a single `require` patch
 * WARNING: Because this class will create its own `require-in-the-middle` (RITM) instance,
 * we should minimize the number of new instances of this class.
 * Multiple instances of `@opentelemetry/instrumentation` (e.g. multiple versions) in a single process
 * will result in multiple instances of RITM, which will have an impact
 * on the performance of instrumentation hooks being applied.
 */
export class RequireInTheMiddleSingleton {
  private _modulesToHook: Hooked[] = [];
  private static _instance?: RequireInTheMiddleSingleton;

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

  static getInstance(): RequireInTheMiddleSingleton {
    return this._instance = this._instance ?? new RequireInTheMiddleSingleton();
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
