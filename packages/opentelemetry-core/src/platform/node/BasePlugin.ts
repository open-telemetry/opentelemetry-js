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

import {
  Plugin,
  Logger,
  PluginConfig,
  PluginInternalFiles,
  PluginInternalFilesVersion,
  TracerProvider,
} from '@opentelemetry/api';
import * as semver from 'semver';
import * as path from 'path';
import { BaseAbstractPlugin } from '../BaseAbstractPlugin';

/** This class represent the base to patch plugin. */
export abstract class BasePlugin<T>
  extends BaseAbstractPlugin<T>
  implements Plugin<T> {
  enable(
    moduleExports: T,
    tracerProvider: TracerProvider,
    logger: Logger,
    config?: PluginConfig
  ): T {
    this._moduleExports = moduleExports;
    this._tracer = tracerProvider.getTracer(
      this._tracerName,
      this._tracerVersion
    );
    this._logger = logger;
    this._internalFilesExports = this._loadInternalFilesExports();
    if (config) this._config = config;
    return this.patch();
  }

  disable(): void {
    this.unpatch();
  }

  /**
   * @TODO: To avoid circular dependencies, internal file loading functionality currently
   * lives in BasePlugin. It is not meant to work in the browser and so this logic
   * should eventually be moved somewhere else where it makes more sense.
   * https://github.com/open-telemetry/opentelemetry-js/issues/285
   */
  private _loadInternalFilesExports(): PluginInternalFiles {
    if (!this._internalFilesList) return {};
    if (!this.version || !this.moduleName || !this._basedir) {
      // log here because internalFilesList was provided, so internal file loading
      // was expected to be working
      this._logger.debug(
        'loadInternalFiles failed because one of the required fields was missing: moduleName=%s, version=%s, basedir=%s',
        this.moduleName,
        this.version,
        this._basedir
      );
      return {};
    }
    const extraModules: PluginInternalFiles = {};
    this._logger.debug('loadInternalFiles %o', this._internalFilesList);
    Object.keys(this._internalFilesList).forEach(versionRange => {
      this._loadInternalModule(versionRange, extraModules);
    });
    if (Object.keys(extraModules).length === 0) {
      this._logger.debug(
        'No internal files could be loaded for %s@%s',
        this.moduleName,
        this.version
      );
    }
    return extraModules;
  }

  private _loadInternalModule(
    versionRange: string,
    outExtraModules: PluginInternalFiles
  ): void {
    if (semver.satisfies(this.version!, versionRange)) {
      if (Object.keys(outExtraModules).length > 0) {
        this._logger.warn(
          'Plugin for %s@%s, has overlap version range (%s) for internal files: %o',
          this.moduleName,
          this.version,
          versionRange,
          this._internalFilesList
        );
      }
      this._requireInternalFiles(
        this._internalFilesList![versionRange],
        this._basedir!,
        outExtraModules
      );
    }
  }

  private _requireInternalFiles(
    extraModulesList: PluginInternalFilesVersion,
    basedir: string,
    outExtraModules: PluginInternalFiles
  ): void {
    if (!extraModulesList) return;
    Object.keys(extraModulesList).forEach(moduleName => {
      try {
        this._logger.debug('loading File %s', extraModulesList[moduleName]);
        outExtraModules[moduleName] = require(path.join(
          basedir,
          extraModulesList[moduleName]
        ));
      } catch (e) {
        this._logger.error(
          'Could not load internal file %s of module %s. Error: %s',
          path.join(basedir, extraModulesList[moduleName]),
          this.moduleName,
          e.message
        );
      }
    });
  }

  protected abstract patch(): T;

  protected abstract unpatch(): void;
}
