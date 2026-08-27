/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import type { ConfigProvider } from '@opentelemetry/api-config';
import type { DiagLogger } from '@opentelemetry/api';

import type { ShimWrapped } from './types';

/**
 * function to execute patched function and being able to catch errors
 * @param execute - function to be executed
 * @param onFinish - callback to run when execute finishes
 */
export function safeExecuteInTheMiddle<T>(
  execute: () => T,
  onFinish: (e: Error | undefined, result: T | undefined) => void,
  preventThrowingError?: boolean
): T {
  let error: Error | undefined;
  let result: T | undefined;
  try {
    result = execute();
  } catch (e) {
    error = e;
  } finally {
    onFinish(error, result);
    if (error && !preventThrowingError) {
      // eslint-disable-next-line no-unsafe-finally
      throw error;
    }
    // eslint-disable-next-line no-unsafe-finally
    return result as T;
  }
}

/**
 * Async function to execute patched function and being able to catch errors
 * @param execute - function to be executed
 * @param onFinish - callback to run when execute finishes
 */
export async function safeExecuteInTheMiddleAsync<T>(
  execute: () => T,
  onFinish: (
    e: Error | undefined,
    result: T | undefined
  ) => Promise<void> | void,
  preventThrowingError?: boolean
): Promise<T> {
  let error: Error | undefined;
  let result: T | undefined;
  try {
    result = await execute();
  } catch (e) {
    error = e;
  } finally {
    await onFinish(error, result);
    if (error && !preventThrowingError) {
      // eslint-disable-next-line no-unsafe-finally
      throw error;
    }
    // eslint-disable-next-line no-unsafe-finally
    return result as T;
  }
}
/**
 * Checks if certain function has been already wrapped
 * @param func
 */
export function isWrapped(func: unknown): func is ShimWrapped {
  return (
    typeof func === 'function' &&
    typeof (func as ShimWrapped).__original === 'function' &&
    typeof (func as ShimWrapped).__unwrap === 'function' &&
    (func as ShimWrapped).__wrapped === true
  );
}

function isPlainObject(val: unknown): val is Record<string, unknown> {
  return typeof val === 'object' && val !== null && !Array.isArray(val);
}

/**
 * Merge `overlay` over `base`, recursing into plain objects. Returns new
 * objects throughout, so neither argument is mutated.
 */
function deepMerge(
  base: unknown,
  overlay: Record<string, unknown>
): Record<string, unknown> {
  const result: Record<string, unknown> = isPlainObject(base)
    ? { ...base }
    : {};
  for (const [key, val] of Object.entries(overlay)) {
    result[key] = isPlainObject(val) ? deepMerge(result[key], val) : val;
  }
  return result;
}

/**
 * Lookup a property in a plain object, where `lookup` is a dotted lookup.
 * Returns `undefined` if the lookup path doesn't exist.
 * For example:
 *
 *   > const o = { foo: { bar: { baz: 42 } } }
 *   > dottedGet(o, 'foo.bar.baz');
 *   42
 */
function dottedGet(obj: unknown, lookup: string): unknown {
  let result: unknown = obj;
  for (const key of lookup.split('.')) {
    if (isPlainObject(result) && Object.hasOwn(result, key)) {
      result = result[key as keyof typeof result];
    } else {
      return undefined;
    }
  }
  return result;
}

/**
 * Set a value on a plain object, where `lookup` is a dotted-path to index
 * into the given object, creating empty objects as necessary. E.g.:
 *
 *   > const o = {};
 *   > dottedSet(o, 'foo.bar.baz', 42);
 *   > o
 *   { foo: { bar: { baz: 42 } } }
 *
 * Returns false, without setting anything, when the path cannot be walked.
 */
function dottedSet(
  obj: Record<string, unknown>,
  lookup: string,
  val: unknown
): boolean {
  let targ = obj;
  const segs = lookup.split('.');
  const lastSeg = segs.pop();
  if (lastSeg === undefined) {
    return false;
  }
  for (const key of segs) {
    if (!Object.hasOwn(targ, key)) {
      targ[key] = {};
    }
    const candidate = targ[key];
    if (!isPlainObject(candidate)) {
      return false;
    }
    targ = candidate;
  }

  targ[lastSeg] = val;
  return true;
}

function isNumber(val: unknown): boolean {
  return typeof val === 'number' && !Number.isNaN(val);
}

function isArrayOf(arr: unknown, isElement: (el: unknown) => boolean): boolean {
  return Array.isArray(arr) && arr.every(isElement);
}

/**
 * Flattens all keys of a nested object into dotted string paths.
 */
function flattenedKeys(obj: Record<string, unknown>, prefix = ''): string[] {
  return Object.keys(obj).reduce((acc: string[], key) => {
    const currPath = prefix ? `${prefix}.${key}` : key;
    const val = obj[key];

    if (isPlainObject(val)) {
      acc.push(...flattenedKeys(val, currPath));
    } else {
      acc.push(currPath);
    }

    return acc;
  }, []);
}

/**
 * Validate that the given declarative config property is of the given "type".
 */
function validConfigPropertyType(
  name: string,
  val: unknown,
  type: string,
  diag?: DiagLogger
): boolean {
  switch (type) {
    case 'boolean':
      if (typeof val !== 'boolean') {
        diag?.warn(
          `unexpected type for declarative config property "${name}": expected "boolean", got "${typeof val}"`
        );
        return false;
      }
      break;
    case 'string':
      if (typeof val !== 'string') {
        diag?.warn(
          `unexpected type for declarative config property "${name}": expected "string", got "${typeof val}"`
        );
        return false;
      }
      break;
    case 'number':
      if (!isNumber(val)) {
        diag?.warn(
          `unexpected type for declarative config property "${name}": expected "number", got "${typeof val}"`
        );
        return false;
      }
      break;
    case 'string[]':
      if (!isArrayOf(val, el => typeof el === 'string')) {
        diag?.warn(
          `unexpected type for declarative config property "${name}": expected array of strings`
        );
        return false;
      }
      break;
    case 'boolean[]':
      if (!isArrayOf(val, el => typeof el === 'boolean')) {
        diag?.warn(
          `unexpected type for declarative config property "${name}": expected array of booleans`
        );
        return false;
      }
      break;
    case 'number[]':
      if (!isArrayOf(val, isNumber)) {
        diag?.warn(
          `unexpected type for declarative config property "${name}": expected array of numbers`
        );
        return false;
      }
      break;
    default:
      diag?.warn(
        `unsupported declarative config type "${type}" for property "${name}"; ignoring`
      );
      return false;
  }
  return true;
}

export function readConfigProperties(opts: {
  configProvider: ConfigProvider;
  instrumentationName?: string;
  instrumentationProps?: [string, string, string][];
  generalProps?: [string, string, string][];
  /**
   * The `general` domains this instrumentation is responsible for, e.g.
   * `['http']`. Unhandled properties are reported for these domains only,
   * because `general` is shared between instrumentations.
   */
  generalDomains?: string[];
  /**
   * The instrumentation's current config. Nested target paths are merged over
   * the matching branch of this, so declarative config that sets one leaf does
   * not drop sibling leaves set in code.
   */
  currentConfig?: Record<string, unknown>;
  diag?: DiagLogger;
}): Record<string, unknown> {
  // Unhandled-property reporting covers the properties this instrumentation is
  // responsible for: its own block, plus the `general` domains it declares via
  // `generalDomains`. The rest of `general` belongs to other instrumentations.
  const ownedPropNames: string[] = [];
  const handledPropNames: string[] = [];
  const config: Record<string, unknown> = {};

  if (opts.instrumentationName && opts.instrumentationProps) {
    const instrConf = opts.configProvider.getInstrumentationConfig(
      opts.instrumentationName
    );
    if (instrConf) {
      const prefix = `instrumentation/development.js.${opts.instrumentationName}`;
      ownedPropNames.push(...flattenedKeys(instrConf, prefix));

      for (const [fromLookup, type, toLookup] of opts.instrumentationProps) {
        const propName = prefix + '.' + fromLookup;
        handledPropNames.push(propName);
        const val = dottedGet(instrConf, fromLookup);
        if (val === undefined || val === null) {
          continue;
        }
        if (!validConfigPropertyType(propName, val, type, opts.diag)) {
          continue;
        }
        if (!dottedSet(config, toLookup, val)) {
          opts.diag?.warn(
            `cannot apply declarative config property "${propName}": invalid target path "${toLookup}"`
          );
        }
      }
    }
  }

  if (opts.generalProps) {
    const generalConf = opts.configProvider.getGeneralInstrumentationConfig();
    if (generalConf) {
      const prefix = 'instrumentation/development.general';
      for (const domain of opts.generalDomains ?? []) {
        const subtree = dottedGet(generalConf, domain);
        if (isPlainObject(subtree)) {
          ownedPropNames.push(...flattenedKeys(subtree, `${prefix}.${domain}`));
        }
      }

      for (const [fromLookup, type, toLookup] of opts.generalProps) {
        const propName = prefix + '.' + fromLookup;
        handledPropNames.push(propName);
        const val = dottedGet(generalConf, fromLookup);
        if (val === undefined || val === null) {
          continue;
        }
        if (!validConfigPropertyType(propName, val, type, opts.diag)) {
          continue;
        }
        if (!dottedSet(config, toLookup, val)) {
          opts.diag?.warn(
            `cannot apply declarative config property "${propName}": invalid target path "${toLookup}"`
          );
        }
      }
    }
  }

  // Warn about unhandled properties in the config.
  // Dev note: I'd use Set#difference, but that requires Node.js v22.
  const unhandledPropNames = ownedPropNames.filter(
    k => !handledPropNames.includes(k)
  );
  if (unhandledPropNames.length > 0) {
    opts.diag?.warn(
      `unhandled declarative configuration properties: ${JSON.stringify(unhandledPropNames)}`
    );
  }

  // The caller merges the result with a shallow spread, so any nested branch it
  // returns must already carry the current config's sibling values.
  const current = opts.currentConfig;
  if (current) {
    for (const [key, val] of Object.entries(config)) {
      if (isPlainObject(val)) {
        config[key] = deepMerge(current[key], val);
      }
    }
  }

  return config;
}
