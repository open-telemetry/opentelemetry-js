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
import { types as utilTypes } from 'util';
import { satisfies } from 'semver';
import { wrap, unwrap, massWrap, massUnwrap } from 'shimmer';
import { InstrumentationAbstract } from '../../instrumentation';
import {
  RequireInTheMiddleSingleton,
  Hooked,
} from './RequireInTheMiddleSingleton';
import type { HookFn } from 'import-in-the-middle';
import * as ImportInTheMiddle from 'import-in-the-middle';
import { InstrumentationModuleDefinition } from '../../types';
import { diag } from '@opentelemetry/api';
import type { OnRequireFn } from 'require-in-the-middle';
import { Hook } from 'require-in-the-middle';
import { readFileSync } from 'fs';

/**
 * Base abstract class for instrumenting node plugins
 */
export abstract class InstrumentationBase
  extends InstrumentationAbstract
  implements types.Instrumentation
{
  private _modules: InstrumentationModuleDefinition[];
  private _hooks: (Hooked | Hook)[] = [];
  private _requireInTheMiddleSingleton: RequireInTheMiddleSingleton =
    RequireInTheMiddleSingleton.getInstance();
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

    this._modules = (modules as InstrumentationModuleDefinition[]) || [];

    if (this._modules.length === 0) {
      diag.debug(
        'No modules instrumentation has been defined for ' +
          `'${this.instrumentationName}@${this.instrumentationVersion}'` +
          ', nothing will be patched'
      );
    }

    if (this._config.enabled) {
      this.enable();
    }
  }

  protected override _wrap: typeof wrap = (moduleExports, name, wrapper) => {
    if (!utilTypes.isProxy(moduleExports)) {
      return wrap(moduleExports, name, wrapper);
    } else {
      const wrapped = wrap(Object.assign({}, moduleExports), name, wrapper);

      return Object.defineProperty(moduleExports, name, {
        value: wrapped,
      });
    }
  };

  protected override _unwrap: typeof unwrap = (moduleExports, name) => {
    if (!utilTypes.isProxy(moduleExports)) {
      return unwrap(moduleExports, name);
    } else {
      return Object.defineProperty(moduleExports, name, {
        value: moduleExports[name],
      });
    }
  };

  protected override _massWrap: typeof massWrap = (
    moduleExportsArray,
    names,
    wrapper
  ) => {
    if (!moduleExportsArray) {
      diag.error('must provide one or more modules to patch');
      return;
    } else if (!Array.isArray(moduleExportsArray)) {
      moduleExportsArray = [moduleExportsArray];
    }

    if (!(names && Array.isArray(names))) {
      diag.error('must provide one or more functions to wrap on modules');
      return;
    }

    moduleExportsArray.forEach(moduleExports => {
      names.forEach(name => {
        this._wrap(moduleExports, name, wrapper);
      });
    });
  };

  protected override _massUnwrap: typeof massUnwrap = (
    moduleExportsArray,
    names
  ) => {
    if (!moduleExportsArray) {
      diag.error('must provide one or more modules to patch');
      return;
    } else if (!Array.isArray(moduleExportsArray)) {
      moduleExportsArray = [moduleExportsArray];
    }

    if (!(names && Array.isArray(names))) {
      diag.error('must provide one or more functions to wrap on modules');
      return;
    }

    moduleExportsArray.forEach(moduleExports => {
      names.forEach(name => {
        this._unwrap(moduleExports, name);
      });
    });
  };

  private _warnOnPreloadedModules(): void {
    this._modules.forEach((module: InstrumentationModuleDefinition) => {
      const { name } = module;
      try {
        const resolvedModule = require.resolve(name);
        if (require.cache[resolvedModule]) {
          // Module is already cached, which means the instrumentation hook might not work
          this._diag.warn(
            `Module ${name} has been loaded before ${this.instrumentationName} so it might not work, please initialize it before requiring ${name}`
          );
        }
      } catch {
        // Module isn't available, we can simply skip
      }
    });
  }

  private _extractPackageVersion(baseDir: string): string | undefined {
    try {
      const json = readFileSync(path.join(baseDir, 'package.json'), {
        encoding: 'utf8',
      });
      const version = JSON.parse(json).version;
      return typeof version === 'string' ? version : undefined;
    } catch (error) {
      diag.warn('Failed extracting version', baseDir);
    }

    return undefined;
  }

  private _onRequire<T>(
    module: InstrumentationModuleDefinition,
    exports: T,
    name: string,
    baseDir?: string | void
  ): T {
    if (!baseDir) {
      if (typeof module.patch === 'function') {
        module.moduleExports = exports;
        if (this._enabled) {
          this._diag.debug(
            'Applying instrumentation patch for nodejs core module on require hook',
            {
              module: module.name,
            }
          );
          return module.patch(exports);
        }
      }
      return exports;
    }

    const version = this._extractPackageVersion(baseDir);
    module.moduleVersion = version;
    if (module.name === name) {
      // main module
      if (
        isSupported(module.supportedVersions, version, module.includePrerelease)
      ) {
        if (typeof module.patch === 'function') {
          module.moduleExports = exports;
          if (this._enabled) {
            this._diag.debug(
              'Applying instrumentation patch for module on require hook',
              {
                module: module.name,
                version: module.moduleVersion,
                baseDir,
              }
            );
            return module.patch(exports, module.moduleVersion);
          }
        }
      }
      return exports;
    }
    // internal file
    const files = module.files ?? [];
    const normalizedName = path.normalize(name);
    const supportedFileInstrumentations = files
      .filter(f => f.name === normalizedName)
      .filter(f =>
        isSupported(f.supportedVersions, version, module.includePrerelease)
      );
    return supportedFileInstrumentations.reduce<T>((patchedExports, file) => {
      file.moduleExports = patchedExports;
      if (this._enabled) {
        this._diag.debug(
          'Applying instrumentation patch for nodejs module file on require hook',
          {
            module: module.name,
            version: module.moduleVersion,
            fileName: file.name,
            baseDir,
          }
        );

        // patch signature is not typed, so we cast it assuming it's correct
        return file.patch(patchedExports, module.moduleVersion) as T;
      }
      return patchedExports;
    }, exports);
  }

  public enable(): void {
    if (this._enabled) {
      return;
    }
    this._enabled = true;

    // already hooked, just call patch again
    if (this._hooks.length > 0) {
      for (const module of this._modules) {
        if (typeof module.patch === 'function' && module.moduleExports) {
          this._diag.debug(
            'Applying instrumentation patch for nodejs module on instrumentation enabled',
            {
              module: module.name,
              version: module.moduleVersion,
            }
          );
          module.patch(module.moduleExports, module.moduleVersion);
        }
        for (const file of module.files) {
          if (file.moduleExports) {
            this._diag.debug(
              'Applying instrumentation patch for nodejs module file on instrumentation enabled',
              {
                module: module.name,
                version: module.moduleVersion,
                fileName: file.name,
              }
            );
            file.patch(file.moduleExports, module.moduleVersion);
          }
        }
      }
      return;
    }

    this._warnOnPreloadedModules();
    for (const module of this._modules) {
      const hookFn: HookFn = (exports, name, baseDir) => {
        return this._onRequire<typeof exports>(module, exports, name, baseDir);
      };
      const onRequire: OnRequireFn = (exports, name, baseDir) => {
        return this._onRequire<typeof exports>(module, exports, name, baseDir);
      };

      // `RequireInTheMiddleSingleton` does not support absolute paths.
      // For an absolute paths, we must create a separate instance of the
      // require-in-the-middle `Hook`.
      const hook = path.isAbsolute(module.name)
        ? new Hook([module.name], { internals: true }, onRequire)
        : this._requireInTheMiddleSingleton.register(module.name, onRequire);

      this._hooks.push(hook);
      const esmHook =
        new (ImportInTheMiddle as unknown as typeof ImportInTheMiddle.default)(
          [module.name],
          { internals: false },
          <HookFn>hookFn
        );
      this._hooks.push(esmHook);
    }
  }

  public disable(): void {
    if (!this._enabled) {
      return;
    }
    this._enabled = false;

    for (const module of this._modules) {
      if (typeof module.unpatch === 'function' && module.moduleExports) {
        this._diag.debug(
          'Removing instrumentation patch for nodejs module on instrumentation disabled',
          {
            module: module.name,
            version: module.moduleVersion,
          }
        );
        module.unpatch(module.moduleExports, module.moduleVersion);
      }
      for (const file of module.files) {
        if (file.moduleExports) {
          this._diag.debug(
            'Removing instrumentation patch for nodejs module file on instrumentation disabled',
            {
              module: module.name,
              version: module.moduleVersion,
              fileName: file.name,
            }
          );
          file.unpatch(file.moduleExports, module.moduleVersion);
        }
      }
    }
  }

  public isEnabled(): boolean {
    return this._enabled;
  }
}

function isSupported(
  supportedVersions: string[],
  version?: string,
  includePrerelease?: boolean
): boolean {
  if (typeof version === 'undefined') {
    // If we don't have the version, accept the wildcard case only
    return supportedVersions.includes('*');
  }

  return supportedVersions.some(supportedVersion => {
    return satisfies(version, supportedVersion, { includePrerelease });
  });
}
