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

import { readFileSync } from 'fs';
import * as path from 'path';
import { types } from 'util';

import { DiagLogger, diag, metrics, trace } from '@opentelemetry/api';
import { logs } from '@opentelemetry/api-logs';
import type { HookFn } from 'import-in-the-middle';
import { Hook as HookImport } from 'import-in-the-middle';
import type { OnRequireFn } from 'require-in-the-middle';
import { Hook as HookRequire } from 'require-in-the-middle';

import {
  RequireInTheMiddleSingleton,
  Hooked,
} from './RequireInTheMiddleSingleton';
import { satisfies } from '../../semver';
import * as shimmer from '../../shimmer';
import type {
  Instrumentation,
  InstrumentationConfig,
  InstrumentationDelegate,
  InstrumentationModuleDefinition,
} from '../../types';
import { isWrapped } from '../../utils';

const _kOtDiag = Symbol('otel_instrumentation_diag');
const _kOtEnabled = Symbol('otel_instrumentation_enabled');
const _kOtModules = Symbol('otel_instrumentation_modules');
const _kOtHooks = Symbol('otel_instrumentation_hooks');

/**
 * sets a value in the target object for the given symbol
 */
/* eslint-disable-next-line  @typescript-eslint/no-explicit-any */
function set(target: any, key: symbol, val: unknown) {
  target[key] = val;
}

/**
 * gets the value stored for the symbol.
 */
/* eslint-disable-next-line  @typescript-eslint/no-explicit-any */
function get<T>(target: any, key: symbol): T {
  return target[key] as T;
}

export function createInstrumentation<T extends InstrumentationConfig>(
  delegate: InstrumentationDelegate<T>,
  config: T
): Instrumentation<T> {
  const delegateConfig = { enabled: true, ...config };
  const diagLogger = diag.createComponentLogger({ namespace: delegate.name });
  delegate.setConfig(delegateConfig);
  delegate.setDiag(diagLogger);
  delegate.setTracer(trace.getTracer(delegate.name, delegate.version));
  delegate.setMeter(metrics.getMeter(delegate.name, delegate.version));
  delegate.setLogger(logs.getLogger(delegate.name, delegate.version));

  // Keep the diagLogger
  set(delegate, _kOtDiag, diagLogger);
  set(delegate, _kOtHooks, []);
  // Set the modules
  let modules = delegate.init(nodeShimmer);
  if (modules && !Array.isArray(modules)) {
    modules = [modules];
  }
  set(delegate, _kOtModules, modules || []);
  // And enable
  if (delegateConfig.enabled) {
    enableInstrumentation(delegate);
  }

  return {
    _delegate: delegate, // For testing purposes
    instrumentationName: delegate.name,
    instrumentationVersion: delegate.version,
    setConfig(cfg) {
      delegate.setConfig(cfg);
    },
    getConfig() {
      return delegate.getConfig();
    },
    enable() {
      enableInstrumentation(delegate);
      delegate.enable?.();
    },
    disable() {
      disableInstrumentation(delegate);
      delegate.disable?.();
    },
    setTracerProvider(traceProv) {
      delegate.setTracer(traceProv.getTracer(delegate.name, delegate.version));
    },
    setMeterProvider(meterProv) {
      delegate.setMeter(meterProv.getMeter(delegate.name, delegate.version));
    },
    setLoggerProvider(loggerProv) {
      delegate.setLogger(loggerProv.getLogger(delegate.name, delegate.version));
    },
  } as Instrumentation<T>;
}

/**
 * Registers IITM and RITM hooks the 1st time is called and
 * applies the patches on any subsequent call if not enabled.
 */
function enableInstrumentation(delegate: InstrumentationDelegate) {
  const enabled = get<boolean>(delegate, _kOtEnabled);
  if (enabled) {
    return;
  }

  set(delegate, _kOtEnabled, true);
  const diag = get<DiagLogger>(delegate, _kOtDiag);
  const modules = get<InstrumentationModuleDefinition[]>(delegate, _kOtModules);
  const hooks = get<(Hooked | HookRequire)[]>(delegate, _kOtHooks);

  // already hooked, just call patch again
  if (hooks.length > 0) {
    for (const module of modules) {
      if (typeof module.patch === 'function' && module.moduleExports) {
        diag.debug(
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
          diag.debug(
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

  // warn on preloaded modules
  for (const module of modules) {
    const { name } = module;
    try {
      const resolvedModule = require.resolve(name);
      if (require.cache[resolvedModule]) {
        // Module is already cached, which means the instrumentation hook might not work
        diag.warn(
          `Module ${name} has been loaded before ${delegate.name} so it might not work, please initialize it before requiring ${name}`
        );
      }
    } catch {
      // Module isn't available, we can simply skip
    }
  }

  // Patch modules for the 1st time and register the hooks
  const ritmSingleton = RequireInTheMiddleSingleton.getInstance();
  for (const module of modules) {
    const hookFn: HookFn = (exports, name, baseDir) => {
      if (!baseDir && path.isAbsolute(name)) {
        const parsedPath = path.parse(name);
        name = parsedPath.name;
        baseDir = parsedPath.dir;
      }
      return onRequire<typeof exports>(
        delegate,
        module,
        exports,
        name,
        baseDir
      );
    };
    const requireFn: OnRequireFn = (exports, name, baseDir) => {
      return onRequire<typeof exports>(
        delegate,
        module,
        exports,
        name,
        baseDir
      );
    };

    // `RequireInTheMiddleSingleton` does not support absolute paths.
    // For an absolute paths, we must create a separate instance of the
    // require-in-the-middle `Hook`.
    const hook = path.isAbsolute(module.name)
      ? new HookRequire([module.name], { internals: true }, requireFn)
      : ritmSingleton.register(module.name, requireFn);

    hooks.push(hook);
    const esmHook = new HookImport(
      [module.name],
      { internals: false },
      <HookFn>hookFn
    );
    hooks.push(esmHook);
  }
}

/**
 * Unpatches the modules if the instrumentation is enabled.
 */
function disableInstrumentation(delegate: InstrumentationDelegate) {
  const enabled = get<boolean>(delegate, _kOtEnabled);
  if (!enabled) {
    return;
  }

  set(delegate, _kOtEnabled, false);
  const diag = get<DiagLogger>(delegate, _kOtDiag);
  const modules = get<InstrumentationModuleDefinition[]>(delegate, _kOtModules);

  for (const module of modules) {
    if (typeof module.unpatch === 'function' && module.moduleExports) {
      diag.debug(
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
        diag.debug(
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

/**
 * Applies the patches defined by the instrumentation delegate to
 * the exported module.
 */
function onRequire<T>(
  delegate: InstrumentationDelegate,
  module: InstrumentationModuleDefinition,
  exports: T,
  name: string,
  baseDir?: string | void
): T {
  const enabled = get<boolean>(delegate, _kOtEnabled);
  const diag = get<DiagLogger>(delegate, _kOtDiag);

  if (!baseDir) {
    if (typeof module.patch === 'function') {
      module.moduleExports = exports;
      if (enabled) {
        diag.debug(
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

  // Get the version
  try {
    const pkgInfo = JSON.parse(
      readFileSync(path.join(baseDir, 'package.json'), {
        encoding: 'utf8',
      })
    );
    module.moduleVersion =
      typeof pkgInfo.version === 'string' ? pkgInfo.version : undefined;
  } catch (error) {
    diag.warn('Failed extracting version', baseDir, error.message);
  }

  if (module.name === name) {
    // main module
    if (
      isSupported(
        module.supportedVersions,
        module.moduleVersion,
        module.includePrerelease
      )
    ) {
      if (typeof module.patch === 'function') {
        module.moduleExports = exports;
        if (enabled) {
          diag.debug(
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
      isSupported(
        f.supportedVersions,
        module.moduleVersion,
        module.includePrerelease
      )
    );
  return supportedFileInstrumentations.reduce<T>((patchedExports, file) => {
    file.moduleExports = patchedExports;
    if (enabled) {
      diag.debug(
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

/**
 * Tells if a package version is supported
 */
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

// A shimmer for node
const nodeWrap: typeof shimmer.wrap = (moduleExports, name, wrapper) => {
  if (isWrapped(moduleExports[name])) {
    nodeUnwrap(moduleExports, name);
  }
  if (!types.isProxy(moduleExports)) {
    return shimmer.wrap(moduleExports, name, wrapper);
  } else {
    const wrapped = shimmer.wrap(
      Object.assign({}, moduleExports),
      name,
      wrapper
    );
    Object.defineProperty(moduleExports, name, {
      value: wrapped,
    });
    return wrapped;
  }
};
const nodeUnwrap: typeof shimmer.unwrap = (moduleExports, name) => {
  if (!types.isProxy(moduleExports)) {
    return shimmer.unwrap(moduleExports, name);
  } else {
    return Object.defineProperty(moduleExports, name, {
      value: moduleExports[name],
    });
  }
};

const nodeMassWrap: typeof shimmer.massWrap = (
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
      nodeWrap(moduleExports, name, wrapper);
    });
  });
};

const nodeMassUnwrap: typeof shimmer.massUnwrap = (
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
      nodeUnwrap(moduleExports, name);
    });
  });
};

const nodeShimmer = {
  wrap: nodeWrap,
  unwrap: nodeUnwrap,
  massWrap: nodeMassWrap,
  massUnwrap: nodeMassUnwrap,
};
