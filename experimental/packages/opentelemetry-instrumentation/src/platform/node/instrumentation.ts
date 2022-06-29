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
import { satisfies } from 'semver';
import { InstrumentationAbstract } from '../../instrumentation';
import { InstrumentationModuleDefinition } from './types';
import { diag } from '@opentelemetry/api';

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
      diag.warn(
        'No modules instrumentation has been defined,' +
        ' nothing will be patched'
      );
    }

    if (this._config.enabled) {
      this.enable();
    }
  }

  private _warnOnPreloadedModules(): void {
    this._modules.forEach((module: InstrumentationModuleDefinition<T>) => {
      const { name } = module;
      try {
        const resolvedModule = require.resolve(name);
        if (require.cache[resolvedModule]) {
          // Module is already cached, which means the instrumentation hook might not work
          this._diag.warn(`Module ${name} has been loaded before ${this.instrumentationName} so it might not work, please initialize it before requiring ${name}`);
        }
      } catch {
        // Module isn't available, we can simply skip
      }
    });
  }

  private _extractPackageVersion(baseDir: string): string | undefined {
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const version = require(path.join(baseDir, 'package.json')).version;
      return typeof version === 'string' ? version : undefined;
    } catch (error) {
      diag.warn('Failed extracting version', baseDir);
    }

    return undefined;
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
        if (this._enabled) {
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
            return module.patch(exports, module.moduleVersion);
          }
        }
      }
      return exports;
    }
    // internal file
    const files = module.files ?? [];
    const supportedFileInstrumentations = files
      .filter(f => f.name === name)
      .filter(f => isSupported(f.supportedVersions, version, module.includePrerelease));
    return supportedFileInstrumentations.reduce<T>(
      (patchedExports, file) => {
        file.moduleExports = patchedExports;
        if (this._enabled) {
          return file.patch(patchedExports, module.moduleVersion);
        }
        return patchedExports;
      },
      exports,
    );
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
          module.patch(module.moduleExports, module.moduleVersion);
        }
        for (const file of module.files) {
          if (file.moduleExports) {
            file.patch(file.moduleExports, module.moduleVersion);
          }
        }
      }
      return;
    }

    this._warnOnPreloadedModules();
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

  public disable(): void {
    if (!this._enabled) {
      return;
    }
    this._enabled = false;

    for (const module of this._modules) {
      if (typeof module.unpatch === 'function' && module.moduleExports) {
        module.unpatch(module.moduleExports, module.moduleVersion);
      }
      for (const file of module.files) {
        if (file.moduleExports) {
          file.unpatch(file.moduleExports, module.moduleVersion);
        }
      }
    }
  }

  public isEnabled(): boolean {
    return this._enabled;
  }
}

function isSupported(supportedVersions: string[], version?: string, includePrerelease?: boolean): boolean {
  if (typeof version === 'undefined') {
    // If we don't have the version, accept the wildcard case only
    return supportedVersions.includes('*');
  }

  return supportedVersions.some(supportedVersion => {
    return satisfies(version, supportedVersion, { includePrerelease });
  });
}
