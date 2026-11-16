/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import type {
  ConfigProperties,
  ConfigProvider,
} from '@opentelemetry/api-config';
import type { DiagLogger } from '@opentelemetry/api';

function isPlainObject(val: unknown): val is Record<string, unknown> {
  return typeof val === 'object' && val !== null && !Array.isArray(val);
}

/**
 * Merge `overlay` over `base`, recursing into plain objects. Returns new objects
 * throughout, so neither argument is mutated.
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
 * Lookup a property in a plain object, where `lookup` is a dotted path. Returns
 * `undefined` when the path does not exist. For example:
 *
 *   > dottedGet({ foo: { bar: { baz: 42 } } }, 'foo.bar.baz');
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

function isNumber(val: unknown): boolean {
  return typeof val === 'number' && !Number.isNaN(val);
}

function isArrayOf(arr: unknown, isElement: (el: unknown) => boolean): boolean {
  return Array.isArray(arr) && arr.every(isElement);
}

/** Flattens all keys of a nested object into dotted string paths. */
function flattenedKeys(node: ConfigProperties, prefix = ''): string[] {
  return Object.keys(node).reduce((acc: string[], key) => {
    const currPath = prefix ? `${prefix}.${key}` : key;
    const val = node[key];

    if (isPlainObject(val)) {
      acc.push(...flattenedKeys(val, currPath));
    } else {
      acc.push(currPath);
    }

    return acc;
  }, []);
}

/**
 * Typed reads over one declarative config node. Each getter takes a dotted path
 * relative to the node and returns the value only when it is present and of the
 * expected type. A type mismatch warns; a missing or null property is silent, so
 * the instrumentation keeps its existing value.
 */
export interface ConfigPropertiesReader {
  getBoolean(path: string): boolean | undefined;
  getString(path: string): string | undefined;
  getNumber(path: string): number | undefined;
  getStringArray(path: string): string[] | undefined;
  getBooleanArray(path: string): boolean[] | undefined;
  getNumberArray(path: string): number[] | undefined;
}

/**
 * Maps declarative config onto an instrumentation's config fields. Called with
 * two typed readers:
 *
 * - `own`: this instrumentation's own node, `instrumentation/development.js.<name>`.
 * - `general`: the shared `instrumentation/development.general` node.
 *
 * Build the return value from the reader getters. Annotating the return type as
 * `Partial<MyConfig>` is what type-checks the mapping: a getter whose type does
 * not match the target field, or a field name that does not exist, fails to
 * compile. A getter yields `undefined` for a missing, null or wrong-typed
 * property, and those are pruned before merging, so an unset property keeps the
 * instrumentation's current value.
 *
 * ```ts
 * (own, general): Partial<MyConfig> => ({
 *   someField: own.getString('some_field'),
 *   captured: { headers: general.getStringArray('http.client.request_captured_headers') },
 * })
 * ```
 */
export type DeclarativeConfigReader<ConfigType> = (
  own: ConfigPropertiesReader,
  general: ConfigPropertiesReader
) => Partial<ConfigType>;

/**
 * Strip nullish values, recursing into plain objects and dropping any object
 * left empty. A reader builds nested fields as object literals, so an unset
 * property arrives as an `undefined` leaf that must not overwrite the current
 * config.
 */
function pruneNullish(node: Record<string, unknown>): Record<string, unknown> {
  const pruned: Record<string, unknown> = {};
  for (const [key, val] of Object.entries(node)) {
    if (val == null) {
      continue;
    }
    if (isPlainObject(val)) {
      const nested = pruneNullish(val);
      if (Object.keys(nested).length > 0) {
        pruned[key] = nested;
      }
    } else {
      pruned[key] = val;
    }
  }
  return pruned;
}

/** A {@link ConfigPropertiesReader} over one node, recording which paths were read. */
class NodeReader implements ConfigPropertiesReader {
  private readonly _node: ConfigProperties;
  private readonly _prefix: string;
  private readonly _readPaths: Set<string>;
  private readonly _diag?: DiagLogger;

  constructor(
    node: ConfigProperties,
    prefix: string,
    readPaths: Set<string>,
    diag?: DiagLogger
  ) {
    this._node = node;
    this._prefix = prefix;
    this._readPaths = readPaths;
    this._diag = diag;
  }

  getBoolean(path: string): boolean | undefined {
    return this._read(path, '"boolean"', val => typeof val === 'boolean');
  }

  getString(path: string): string | undefined {
    return this._read(path, '"string"', val => typeof val === 'string');
  }

  getNumber(path: string): number | undefined {
    return this._read(path, '"number"', isNumber);
  }

  getStringArray(path: string): string[] | undefined {
    return this._read(path, 'array of strings', val =>
      isArrayOf(val, el => typeof el === 'string')
    );
  }

  getBooleanArray(path: string): boolean[] | undefined {
    return this._read(path, 'array of booleans', val =>
      isArrayOf(val, el => typeof el === 'boolean')
    );
  }

  getNumberArray(path: string): number[] | undefined {
    return this._read(path, 'array of numbers', val =>
      isArrayOf(val, isNumber)
    );
  }

  private _read<T>(
    path: string,
    expected: string,
    valid: (val: unknown) => boolean
  ): T | undefined {
    const propName = `${this._prefix}.${path}`;
    this._readPaths.add(propName);
    const val = dottedGet(this._node, path);
    // A present-but-null property means "use the default".
    if (val === undefined || val === null) {
      return undefined;
    }
    if (!valid(val)) {
      const got = expected.startsWith('"') ? `, got "${typeof val}"` : '';
      this._diag?.warn(
        `unexpected type for declarative config property "${propName}": expected ${expected}${got}`
      );
      return undefined;
    }
    return val as T;
  }
}

/**
 * Read an instrumentation's declarative config and map it onto config fields.
 *
 * Builds typed readers over the instrumentation's own node and the shared
 * `general` node, passes them to `reader`, and returns a partial config to merge
 * over the current one. Nested fields are deep-merged with `currentConfig`, so
 * declarative config that sets one leaf does not drop sibling leaves set in
 * code. Reading never throws (a reader error is caught and warned), because
 * `setConfigProvider()` must not. Properties the instrumentation owns but the
 * reader did not read are reported together as unhandled.
 *
 * ```ts
 * setConfigProvider(configProvider: ConfigProvider): void {
 *   const config = readDeclarativeConfig({
 *     configProvider,
 *     instrumentationName: this.instrumentationName,
 *     generalDomains: ['http'],
 *     currentConfig: this.getConfig() as Record<string, unknown>,
 *     diag: this._diag,
 *     reader: (own, general): Partial<MyConfig> => ({
 *       redactedQueryParams: own.getStringArray('redacted_query_params'),
 *     }),
 *   });
 *   if (Object.keys(config).length > 0) {
 *     this.setConfig({ ...this.getConfig(), ...config });
 *   }
 * }
 * ```
 */
export function readDeclarativeConfig<ConfigType>(opts: {
  configProvider: ConfigProvider;
  instrumentationName: string;
  reader: DeclarativeConfigReader<ConfigType>;
  /**
   * The `general` domains this instrumentation is responsible for, e.g.
   * `['http']`. Unhandled properties are reported for these domains only,
   * because `general` is shared between instrumentations.
   */
  generalDomains?: string[];
  /**
   * The instrumentation's current config. Nested fields are merged over the
   * matching branch of this, so declarative config that sets one leaf does not
   * drop sibling leaves set in code.
   */
  currentConfig?: Record<string, unknown>;
  diag?: DiagLogger;
}): Partial<ConfigType> {
  const ownPrefix = `instrumentation/development.js.${opts.instrumentationName}`;
  const generalPrefix = 'instrumentation/development.general';
  const ownNode = opts.configProvider.getInstrumentationConfig(
    opts.instrumentationName
  );
  const generalNode = opts.configProvider.getGeneralInstrumentationConfig();

  const readPaths = new Set<string>();
  let partial: Partial<ConfigType>;
  try {
    partial = opts.reader(
      new NodeReader(ownNode, ownPrefix, readPaths, opts.diag),
      new NodeReader(generalNode, generalPrefix, readPaths, opts.diag)
    );
  } catch (err) {
    opts.diag?.warn(`error reading declarative config: ${err}`);
    return {};
  }

  // Drop nullish fields, at every depth, so an unset property keeps the current
  // value.
  const config = pruneNullish(partial as Record<string, unknown>);

  // Nested fields must carry the current config's siblings, because the caller
  // merges with a shallow spread.
  const current = opts.currentConfig;
  if (current) {
    for (const [key, val] of Object.entries(config)) {
      if (isPlainObject(val)) {
        config[key] = deepMerge(current[key], val);
      }
    }
  }

  // Report properties this instrumentation is responsible for but never read.
  const ownedPropNames = flattenedKeys(ownNode, ownPrefix);
  for (const domain of opts.generalDomains ?? []) {
    const subtree = dottedGet(generalNode, domain);
    if (isPlainObject(subtree)) {
      ownedPropNames.push(
        ...flattenedKeys(subtree, `${generalPrefix}.${domain}`)
      );
    }
  }
  const unhandledPropNames = ownedPropNames.filter(k => !readPaths.has(k));
  if (unhandledPropNames.length > 0) {
    opts.diag?.warn(
      `unhandled declarative configuration properties: ${JSON.stringify(unhandledPropNames)}`
    );
  }

  return config as Partial<ConfigType>;
}
