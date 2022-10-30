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
import * as ImportInTheMiddle from 'import-in-the-middle';
import * as path from 'path';
import { ModuleNameTrie, ModuleNameSeparator } from './ModuleNameTrie';

export type Hooked = {
  moduleName: string
  onRequire: RequireInTheMiddle.OnRequireFn
};

/**
 * We are forced to re-type there because ImportInTheMiddle is exported as normal CJS
 * in the JS files but transpiled ESM (with a default export) in its typing.
 */
const ESMHook = ImportInTheMiddle as unknown as typeof ImportInTheMiddle.default;

/**
 * Whether Mocha is running in this process
 * Inspired by https://github.com/AndreasPizsa/detect-mocha
 *
 * @type {boolean}
 */
const isMocha = ['afterEach','after','beforeEach','before','describe','it'].every(fn => {
  // @ts-expect-error TS7053: Element implicitly has an 'any' type
  return typeof global[fn] === 'function';
});

/**
 * Singleton class for `require-in-the-middle` and `import-in-the-middle`
 * Allows instrumentation plugins to patch modules with only a single `require` patch
 * WARNING: Because this class will create its own RITM and IITM instance,
 * we should minimize the number of new instances of this class.
 * Multiple instances of `@opentelemetry/instrumentation` (e.g. multiple versions) in a single process
 * will result in multiple instances of RITM/ITTM, which will have an impact
 * on the performance of instrumentation hooks being applied.
 */
export class RequireInTheMiddleSingleton {
  private _moduleNameTrie: ModuleNameTrie = new ModuleNameTrie();
  private static _instance?: RequireInTheMiddleSingleton;

  private constructor() {
    this._initialize();
  }

  private _initialize() {
    const onHook = (exports: any, name: string, basedir: string | undefined | void) => {
      // For internal files on Windows, `name` will use backslash as the path separator
      const normalizedModuleName = normalizePathSeparators(name);

      const matches = this._moduleNameTrie.search(normalizedModuleName, { maintainInsertionOrder: true });

      for (const { onRequire } of matches) {
        exports = onRequire(exports, name, basedir ? basedir : undefined);
      }

      return exports;
    };
    // Intercept all `require` calls; we will filter the matching ones below
    RequireInTheMiddle(null, { internals: true }, onHook);
    // We can give no module to patch but this signature isn't exposed in typings
    new ESMHook(null as any, { internals: true }, onHook);
  }

  /**
   * Register a hook with `require-in-the-middle`
   *
   * @param {string} moduleName Module name
   * @param {RequireInTheMiddle.OnRequireFn} onRequire Hook function
   * @returns {Hooked} Registered hook
   */
  register(moduleName: string, onRequire: RequireInTheMiddle.OnRequireFn): Hooked {
    const hooked = { moduleName, onRequire };
    this._moduleNameTrie.insert(hooked);
    return hooked;
  }

  /**
   * Get the `RequireInTheMiddleSingleton` singleton
   *
   * @returns {RequireInTheMiddleSingleton} Singleton of `RequireInTheMiddleSingleton`
   */
  static getInstance(): RequireInTheMiddleSingleton {
    // Mocha runs all test suites in the same process
    // This prevents test suites from sharing a singleton
    if (isMocha) return new RequireInTheMiddleSingleton();

    return this._instance = this._instance ?? new RequireInTheMiddleSingleton();
  }
}

/**
 * Normalize the path separators to forward slash in a module name or path
 *
 * @param {string} moduleNameOrPath Module name or path
 * @returns {string} Normalized module name or path
 */
function normalizePathSeparators(moduleNameOrPath: string): string {
  return path.sep !== ModuleNameSeparator
    ? moduleNameOrPath.split(path.sep).join(ModuleNameSeparator)
    : moduleNameOrPath;
}
