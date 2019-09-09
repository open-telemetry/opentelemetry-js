/**
 * Copyright 2019, OpenTelemetry Authors
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

import { Tracer, Plugin, Logger } from '@opentelemetry/types';
import * as semver from 'semver';
import * as path from 'path';

/**
 * Maps a name (key) representing a internal file module and its exports
 */
export interface ModuleNameToFilePath {
  [moduleName: string]: string; // moduleName: path/to/file
}

/**
 * Maps a semver to a module:filepath Map
 */
export interface ModuleExportsMapping {
  [semver: string]: ModuleNameToFilePath;
}

/** This class represent the base to patch plugin. */
export abstract class BasePlugin<T> implements Plugin<T> {
  supportedVersions?: string[];
  protected _moduleExports!: T;
  protected _tracer!: Tracer;
  protected _logger!: Logger;
  protected readonly _internalFilesList?: ModuleExportsMapping
  protected _internalFilesExports!: { [module: string]: any };
  protected basedir!: string;

  constructor(readonly moduleName?: string, readonly version?: string) {}

  enable(
    moduleExports: T,
    tracer: Tracer,
    logger: Logger,
    config?: { [key: string]: unknown }
  ): T {
    this._moduleExports = moduleExports;
    this._tracer = tracer;
    this._logger = logger;
    if (config && config.basedir) this.basedir = config.basedir as string;
    this._internalFilesExports = this._loadInternalFiles();
    return this.patch();
  }

  disable(): void {
    this.unpatch();
  }

  private _loadInternalFiles(): ModuleExportsMapping {
    let extraModules: ModuleExportsMapping = {};
    if (this._internalFilesList) {
      this._logger.debug('loadInternalFiles %o', this._internalFilesList);
      Object.keys(this._internalFilesList).forEach(versionRange => {
        if (this.version && this.moduleName && semver.satisfies(this.version, versionRange)) {
          if (Object.keys(extraModules).length > 0) {
            this._logger.warn(
              'Plugin for %s@%s, has overlap version range (%s) for internal files: %o',
              this.moduleName,
              this.version,
              versionRange,
              this._internalFilesList
            );
          }
          extraModules = this._loadInternalModuleFiles(this._internalFilesList![versionRange], this.basedir);
        }
      });
    }
    if (Object.keys(extraModules)) {
      this._logger.debug('No internal files could be loaded for %s@%s', this.moduleName, this.version);
    }
    return extraModules;
  }

  private _loadInternalModuleFiles(extraModulesList: ModuleNameToFilePath, basedir: string): ModuleExportsMapping {
    const extraModules: ModuleExportsMapping = {};
    if (extraModulesList) {
      Object.keys(extraModulesList).forEach(moduleName => {
        try {
          this._logger.debug('loading File %s', extraModulesList[moduleName]);
          extraModules[moduleName] = require(path.join(
            basedir,
            extraModulesList[moduleName]
          ));
        } catch (e) {
          this._logger.error('Could not load internal file %s of module %s. Error: %s', path.join(basedir, extraModulesList[moduleName]), this.moduleName, e.message);
        }
      });
    }
    return extraModules;
  }

  protected abstract patch(): T;
  protected abstract unpatch(): void;
}
