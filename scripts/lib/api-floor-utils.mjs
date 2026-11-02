/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Helpers for checking that a package's `@opentelemetry/api` peer range does
 * not admit an API version that lacks a value the package (or a workspace
 * package it imports at runtime) imports from `@opentelemetry/api`.
 *
 * Example: `otlp-transformer` imports `SeverityNumber`, which exists since API
 * 1.10.0. A package that imports `otlp-transformer` at runtime but declares
 * `"@opentelemetry/api": "^1.3.0"` can be installed next to API 1.9 and then
 * fails to load as ESM.
 *
 * Known limits: only top-level API values are tracked, not members added to
 * existing objects (for example `propagation.getActiveBaggage`, added in
 * 1.4.0), and API values reached through computed or dynamic access
 * (`api[name]`, `(await import('@opentelemetry/api')).logs`) are not seen.
 */

import semver from 'semver';
import ts from 'typescript';
import { prereleaseClauseOf } from './api-range-utils.mjs';

export const API = '@opentelemetry/api';

/**
 * Value (runtime) exports of `@opentelemetry/api`, by the version that first
 * exported them. Type-only exports are not listed: they cannot fail at runtime.
 *
 * When the API gains a value export, add it under the new version. The
 * "lists every value export of api/src/index.ts" test fails until you do.
 */
export const API_VALUE_EXPORTS_BY_VERSION = {
  '1.0.0': [
    'DiagConsoleLogger',
    'DiagLogLevel',
    'INVALID_SPANID',
    'INVALID_SPAN_CONTEXT',
    'INVALID_TRACEID',
    'ProxyTracer',
    'ProxyTracerProvider',
    'ROOT_CONTEXT',
    'SamplingDecision',
    'SpanKind',
    'SpanStatusCode',
    'TraceFlags',
    'baggageEntryMetadataFromString',
    'context',
    'createContextKey',
    'default',
    'defaultTextMapGetter',
    'defaultTextMapSetter',
    'diag',
    'isSpanContextValid',
    'isValidSpanId',
    'isValidTraceId',
    'propagation',
    'trace',
  ],
  '1.1.0': ['createTraceState'],
  '1.3.0': ['ValueType', 'createNoopMeter', 'metrics'],
  '1.10.0': ['SeverityNumber', 'createNoopLogger', 'logs'],
};

/**
 * Entry points of `@opentelemetry/api` other than the root, by the version
 * that first shipped them. Any runtime import from one needs that version.
 */
export const API_ENTRY_POINTS_BY_VERSION = {
  '1.8.0': [`${API}/experimental`],
};

const INTRODUCED_IN = new Map(
  Object.entries(API_VALUE_EXPORTS_BY_VERSION).flatMap(([version, names]) =>
    names.map(name => [name, version])
  )
);

const ENTRY_POINT_INTRODUCED_IN = new Map(
  Object.entries(API_ENTRY_POINTS_BY_VERSION).flatMap(([version, entries]) =>
    entries.map(entry => [entry, version])
  )
);

/**
 * The API version that first exported `name`, or `undefined` when `name` is
 * not a known value export.
 */
export function apiVersionIntroducing(name) {
  return INTRODUCED_IN.get(name);
}

/**
 * The API version that first shipped the entry point `specifier` (for example
 * `@opentelemetry/api/experimental`), or `undefined`.
 */
export function apiVersionIntroducingEntryPoint(specifier) {
  return ENTRY_POINT_INTRODUCED_IN.get(specifier);
}

const moduleSpecifierOf = node =>
  node && ts.isStringLiteralLike(node) ? node.text : undefined;

// `require('x')` or `import('x')` with a literal argument.
const loadedModule = node =>
  ts.isCallExpression(node) &&
  node.arguments.length === 1 &&
  (node.expression.kind === ts.SyntaxKind.ImportKeyword ||
    (ts.isIdentifier(node.expression) && node.expression.text === 'require'))
    ? moduleSpecifierOf(node.arguments[0])
    : undefined;

/**
 * Finds the runtime imports in one TypeScript source file.
 *
 * Returns the `@opentelemetry/api` value names the file uses, the API entry
 * points other than the root it imports, and the module specifiers of other
 * packages it imports at runtime. Type-only imports and re-exports
 * (`import type`, `import { type X }`, `export type`) are ignored, because
 * TypeScript erases them.
 *
 * @param {string} fileName
 * @param {string} sourceText
 * @returns {{ apiValues: Set<string>, apiEntryPoints: Set<string>, specifiers: Set<string> }}
 */
export function collectRuntimeImports(fileName, sourceText) {
  const sourceFile = ts.createSourceFile(
    fileName,
    sourceText,
    ts.ScriptTarget.Latest,
    true
  );
  const apiValues = new Set();
  const apiEntryPoints = new Set();
  const specifiers = new Set();
  // Local names bound to the whole API module (`import * as api`, `import api`,
  // `import api = require(...)`, `const api = require(...)`).
  const apiAliases = new Set();

  const recordModule = specifier => {
    if (specifier === API) return;
    if (specifier.startsWith(`${API}/`)) {
      apiEntryPoints.add(specifier);
    } else {
      specifiers.add(specifier);
    }
  };
  const recordValue = (specifier, name) => {
    if (specifier === API) {
      apiValues.add(name);
    } else {
      recordModule(specifier);
    }
  };
  const recordBindings = pattern => {
    for (const element of pattern.elements) {
      const name = element.propertyName ?? element.name;
      if (ts.isIdentifier(name) || ts.isStringLiteralLike(name)) {
        apiValues.add(name.text);
      }
    }
  };

  // Pass 1: imports, re-exports, and aliases of the API module.
  const collect = node => {
    if (ts.isImportDeclaration(node)) {
      const specifier = moduleSpecifierOf(node.moduleSpecifier);
      const clause = node.importClause;
      if (specifier && !clause) {
        // `import 'x'` runs the module.
        recordModule(specifier);
      } else if (specifier && !clause.isTypeOnly) {
        if (clause.name) {
          recordValue(specifier, 'default');
          if (specifier === API) apiAliases.add(clause.name.text);
        }
        const bindings = clause.namedBindings;
        if (bindings && ts.isNamespaceImport(bindings)) {
          if (specifier === API) {
            apiAliases.add(bindings.name.text);
          } else {
            recordModule(specifier);
          }
        } else if (bindings) {
          for (const element of bindings.elements) {
            if (!element.isTypeOnly) {
              recordValue(
                specifier,
                (element.propertyName ?? element.name).text
              );
            }
          }
        }
      }
    } else if (ts.isExportDeclaration(node) && !node.isTypeOnly) {
      const specifier = moduleSpecifierOf(node.moduleSpecifier);
      if (specifier) {
        if (!node.exportClause || ts.isNamespaceExport(node.exportClause)) {
          // `export * from 'x'`. For the API this needs nothing: a star
          // re-export does not fail when a name is missing.
          recordModule(specifier);
        } else {
          for (const element of node.exportClause.elements) {
            if (!element.isTypeOnly) {
              recordValue(
                specifier,
                (element.propertyName ?? element.name).text
              );
            }
          }
        }
      }
    } else if (
      ts.isImportEqualsDeclaration(node) &&
      !node.isTypeOnly &&
      ts.isExternalModuleReference(node.moduleReference)
    ) {
      // `import api = require('x')`
      const specifier = moduleSpecifierOf(node.moduleReference.expression);
      if (specifier === API) {
        apiAliases.add(node.name.text);
      } else if (specifier) {
        recordModule(specifier);
      }
    } else if (ts.isVariableDeclaration(node) && node.initializer) {
      const loaded = loadedModule(node.initializer);
      if (loaded === API && ts.isIdentifier(node.name)) {
        // `const api = require('@opentelemetry/api')`
        apiAliases.add(node.name.text);
      } else if (loaded === API && ts.isObjectBindingPattern(node.name)) {
        // `const { logs } = require('@opentelemetry/api')`
        recordBindings(node.name);
      }
    } else {
      const loaded = loadedModule(node);
      if (loaded) recordModule(loaded);
    }
    ts.forEachChild(node, collect);
  };
  collect(sourceFile);

  // Pass 2: values read through an alias of the API module.
  const isAlias = node => ts.isIdentifier(node) && apiAliases.has(node.text);
  const use = node => {
    if (ts.isPropertyAccessExpression(node) && isAlias(node.expression)) {
      // `api.logs`
      apiValues.add(node.name.text);
    } else if (
      ts.isElementAccessExpression(node) &&
      isAlias(node.expression) &&
      ts.isStringLiteralLike(node.argumentExpression)
    ) {
      // `api['logs']`
      apiValues.add(node.argumentExpression.text);
    } else if (
      ts.isVariableDeclaration(node) &&
      node.initializer &&
      isAlias(node.initializer) &&
      ts.isObjectBindingPattern(node.name)
    ) {
      // `const { logs } = api`
      recordBindings(node.name);
    }
    ts.forEachChild(node, use);
  };
  if (apiAliases.size > 0) use(sourceFile);

  return { apiValues, apiEntryPoints, specifiers };
}

/**
 * Lists the value exports of a module from its source (used on the API's
 * `src/index.ts` to keep `API_VALUE_EXPORTS_BY_VERSION` complete).
 *
 * Throws on export forms it cannot list (for example `export * from`), so the
 * completeness test fails loudly instead of checking nothing.
 *
 * @param {string} fileName
 * @param {string} sourceText
 * @returns {Set<string>}
 */
export function listValueExports(fileName, sourceText) {
  const sourceFile = ts.createSourceFile(
    fileName,
    sourceText,
    ts.ScriptTarget.Latest,
    true
  );
  const names = new Set();
  const hasModifier = (node, kind) =>
    ts.getModifiers(node)?.some(modifier => modifier.kind === kind) ?? false;
  const isExported = node => hasModifier(node, ts.SyntaxKind.ExportKeyword);
  const unsupported = statement => {
    const { line } = sourceFile.getLineAndCharacterOfPosition(
      statement.getStart()
    );
    throw new Error(
      `${fileName}:${line + 1}: cannot list the value exports of this statement: ` +
        statement.getText().split('\n')[0]
    );
  };

  for (const statement of sourceFile.statements) {
    if (ts.isExportDeclaration(statement)) {
      if (statement.isTypeOnly) continue;
      if (
        !statement.exportClause ||
        ts.isNamespaceExport(statement.exportClause)
      ) {
        unsupported(statement);
      }
      for (const element of statement.exportClause.elements) {
        if (!element.isTypeOnly) names.add(element.name.text);
      }
    } else if (ts.isExportAssignment(statement)) {
      names.add('default');
    } else if (!isExported(statement)) {
      continue;
    } else if (ts.isVariableStatement(statement)) {
      for (const declaration of statement.declarationList.declarations) {
        if (!ts.isIdentifier(declaration.name)) unsupported(statement);
        names.add(declaration.name.text);
      }
    } else if (
      ts.isFunctionDeclaration(statement) ||
      ts.isClassDeclaration(statement)
    ) {
      names.add(
        hasModifier(statement, ts.SyntaxKind.DefaultKeyword)
          ? 'default'
          : statement.name.text
      );
    } else if (ts.isEnumDeclaration(statement)) {
      // A `const enum` is erased at build time.
      if (!hasModifier(statement, ts.SyntaxKind.ConstKeyword)) {
        names.add(statement.name.text);
      }
    } else if (
      ts.isModuleDeclaration(statement) ||
      ts.isImportEqualsDeclaration(statement)
    ) {
      unsupported(statement);
    }
    // Exported interfaces and type aliases are types only.
  }
  return names;
}

/**
 * Maps a module specifier to the workspace package it belongs to
 * (`@opentelemetry/core` and `@opentelemetry/core/foo` both map to
 * `@opentelemetry/core`), or `undefined` for anything else.
 */
export function workspacePackageFor(specifier, packageNames) {
  if (packageNames.has(specifier)) {
    return specifier;
  }
  const parts = specifier.split('/');
  const name = specifier.startsWith('@')
    ? parts.slice(0, 2).join('/')
    : parts[0];
  return packageNames.has(name) ? name : undefined;
}

/**
 * The lowest released API version a peer range admits. The exact pre-release
 * clause that `align-api-deps` appends while the API is a pre-release
 * (`^1.10.0 || 1.10.0-rc.0`) is ignored: it only lets the workspace link the
 * pre-release API and says nothing about the lower bound.
 */
export function lowestReleaseAdmitted(range) {
  const clause = prereleaseClauseOf(range);
  const releaseRange = clause
    ? range
        .split('||')
        .map(set => set.trim())
        .filter(set => set !== clause)
        .join(' || ')
    : range;
  return semver.minVersion(releaseRange)?.version;
}

/**
 * Finds packages whose `@opentelemetry/api` peer range admits an API version
 * that lacks a value they need at runtime, directly or through workspace
 * packages they import at runtime.
 *
 * @param {Array<{
 *   name: string,
 *   apiPeerRange?: string,
 *   files: Array<{ fileName: string, sourceText: string }>,
 * }>} packages
 * @returns {Array<{
 *   name: string,
 *   apiPeerRange: string,
 *   lowestAllowed: string,
 *   required: string,
 *   value: string,
 *   chain: string[],
 *   fileName: string,
 * }>}
 */
export function findApiFloorViolations(packages) {
  const packageNames = new Set(packages.map(pkg => pkg.name));
  const usage = new Map();
  for (const pkg of packages) {
    // What this package needs from the API, keyed by value name or entry point.
    const needs = new Map();
    const runtimeDeps = new Set();
    for (const { fileName, sourceText } of pkg.files) {
      const imports = collectRuntimeImports(fileName, sourceText);
      for (const value of imports.apiValues) {
        const version = apiVersionIntroducing(value);
        if (version && !needs.has(value)) {
          needs.set(value, { version, fileName });
        }
      }
      for (const entryPoint of imports.apiEntryPoints) {
        const version = apiVersionIntroducingEntryPoint(entryPoint);
        if (version && !needs.has(entryPoint)) {
          needs.set(entryPoint, { version, fileName });
        }
      }
      for (const specifier of imports.specifiers) {
        const dep = workspacePackageFor(specifier, packageNames);
        if (dep && dep !== pkg.name) runtimeDeps.add(dep);
      }
    }
    usage.set(pkg.name, { needs, runtimeDeps });
  }

  // For one package: the newest API version it needs, and how it gets there.
  const requirement = name => {
    let best;
    const seen = new Set([name]);
    const queue = [[name]];
    while (queue.length > 0) {
      const chain = queue.shift();
      const { needs, runtimeDeps } = usage.get(chain[chain.length - 1]);
      for (const [value, { version, fileName }] of needs) {
        if (!best || semver.gt(version, best.required)) {
          best = { required: version, value, chain, fileName };
        }
      }
      for (const dep of runtimeDeps) {
        if (!seen.has(dep)) {
          seen.add(dep);
          queue.push([...chain, dep]);
        }
      }
    }
    return best;
  };

  const violations = [];
  for (const pkg of packages) {
    if (!pkg.apiPeerRange) continue;
    const lowestAllowed = lowestReleaseAdmitted(pkg.apiPeerRange);
    const needed = requirement(pkg.name);
    if (lowestAllowed && needed && semver.lt(lowestAllowed, needed.required)) {
      violations.push({
        name: pkg.name,
        apiPeerRange: pkg.apiPeerRange,
        lowestAllowed,
        ...needed,
      });
    }
  }
  return violations;
}
