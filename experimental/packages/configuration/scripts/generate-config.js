#!/usr/bin/env node
/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Generates TypeScript types from the OpenTelemetry configuration JSON schema
 * using json-schema-to-typescript.
 *
 * Usage:
 *    cd experimental/packages/configuration
 *    npm run generate:config
 */

/* eslint-disable no-console */

'use strict';

const { compile } = require('json-schema-to-typescript');
const { spawnSync, execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const Ajv = require('ajv/dist/2020');
const standaloneCode = require('ajv/dist/standalone').default;
const typescript = require('typescript');

// Get latest version by running:
//    git tag -l --sort=version:refname | grep -v -- - | tail -1
// in git@github.com:open-telemetry/opentelemetry-configuration.git
const CONFIG_VERSION = 'v1.0.0';

const TOP = path.resolve(__dirname, '..');
const SCHEMA_PATH = path.join(
  TOP,
  'build/opentelemetry-configuration/opentelemetry_configuration.json'
);
const TYPES_PATH = path.join(TOP, 'src/generated/types.ts');
const VALIDATOR_JS_PATH = path.join(TOP, 'src/generated/validator.js');
const VALIDATOR_DTS_PATH = path.join(TOP, 'src/generated/validator.d.ts');

const licenseHeader = `/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */
`;

// ---- Utility to remove duplicate declarations from TypeScript code
// Based on https://github.com/bcherny/json-schema-to-typescript/issues/193#issuecomment-2595760821

// FITS strings that do not end with digits (so duplicated types)
// AND strings that contain V1,V2,V3,... at the end (versioned API is considered as not duplicate)
const NON_DUPLICATED_IDENTIFIER_REGEXP = /\b(?!\w*\d+$)\w+\b|\b\w*V\d+\b/;

function isDuplicatedTypeIdentifier(typeIdentifier) {
  return !typeIdentifier.escapedText
    .toString()
    .match(NON_DUPLICATED_IDENTIFIER_REGEXP);
}

function getNonDuplicatedIdentifierName(typeIdentifier) {
  // removes tail digits
  return typeIdentifier.escapedText.toString().replace(/[\d.]+$/, '');
}

function removeDuplicateTsDeclarations(tsCode) {
  const tsPrinter = typescript.createPrinter(
    {
      newLine: typescript.NewLineKind.LineFeed,
    },
    {
      substituteNode: (_, node) => {
        if (
          typescript.isTypeReferenceNode(node) &&
          isDuplicatedTypeIdentifier(node.typeName)
        ) {
          const originalIdentifierName = getNonDuplicatedIdentifierName(
            node.typeName
          );
          return typescript.factory.createTypeReferenceNode(
            originalIdentifierName
          );
        }
        if (
          (typescript.isInterfaceDeclaration(node) ||
            typescript.isEnumDeclaration(node) ||
            typescript.isTypeAliasDeclaration(node)) &&
          isDuplicatedTypeIdentifier(node.name)
        ) {
          const declarationIsCleared = typescript.factory.createIdentifier('');
          return declarationIsCleared;
        }
        return node;
      },
    }
  );

  const sourceFile = typescript.createSourceFile(
    '',
    tsCode,
    typescript.ScriptTarget.ESNext,
    false,
    typescript.ScriptKind.TS
  );

  const result = tsPrinter.printFile(sourceFile);
  return result;
}

// ---- 1. Get and load the OpenTelemetry Configuration JSON schema.

// Run the bash script to clone / refresh the schema repository
const bashResult = spawnSync(
  'bash',
  ['clone-config-repo-at-tag.sh', CONFIG_VERSION],
  {
    stdio: 'inherit',
    cwd: __dirname,
  });
if (bashResult.error) {
  throw bashResult.error;
}

const schema = JSON.parse(fs.readFileSync(SCHEMA_PATH, 'utf8'));

// ---- 2. Generate a pre-compiled validator

// Generate a pre-compiled (ahead-of-time) validator using ajv standalone mode.
// This eliminates the synchronous ajv.compile() call on every cold start by moving
// schema compilation to build time. The generated validator.js module is self-contained
// aside from small ajv/dist/runtime/* helper imports (~4KB).
const ajvAot = new Ajv({ strict: false, code: { source: true } });
const validateFn = ajvAot.compile(schema);
const validatorJs = standaloneCode(ajvAot, validateFn);
const validatorJsWithHeader = [
  '// AUTO-GENERATED — do not edit',
  '// Pre-compiled ajv validator for the OpenTelemetry configuration schema',
  `// Generated from opentelemetry-configuration.git ${CONFIG_VERSION}`,
  '// Run `npm run generate:config` to regenerate',
  '// eslint-disable-next-line',
  '',
  validatorJs,
].join('\n');
fs.writeFileSync(VALIDATOR_JS_PATH, validatorJsWithHeader);
console.log(`Written pre-compiled validator to ${VALIDATOR_JS_PATH}`);

// TypeScript declaration file so FileConfigFactory.ts can import the .js module.
// Uses `export =` to match the CJS module.exports = fn pattern emitted by standalone.
// Uses a local ValidatorError type (not imported from ajv) so consumers don't need
// ajv as a transitive dependency just for the .d.ts file.
const validatorDts = [
  licenseHeader,
  '/* eslint-disable */',
  '// AUTO-GENERATED — do not edit',
  '// Pre-compiled ajv validator for the OpenTelemetry configuration schema',
  `// Generated from opentelemetry-configuration.git ${CONFIG_VERSION}`,
  '// Run `npm run generate:config` to regenerate',
  '',
  '/** Minimal subset of ajv ErrorObject used by FileConfigFactory */',
  'interface ValidatorError {',
  '  instancePath: string;',
  '  message?: string;',
  '  [k: string]: unknown;',
  '}',
  '',
  'declare function validateConfig(data: unknown): boolean;',
  'declare namespace validateConfig {',
  '  let errors: ValidatorError[] | null | undefined;',
  '}',
  '',
  'export = validateConfig;',
  '',
].join('\n');
fs.writeFileSync(VALIDATOR_DTS_PATH, validatorDts);
console.log(`Written validator declaration to ${VALIDATOR_DTS_PATH}`);

// ---- 3. Generate a TypeScript types file from the JSON schema.

const bannerComment = [
  licenseHeader,
  '',
  '//',
  '// AUTO-GENERATED — do not edit',
  `// Generated from opentelemetry-configuration.git ${CONFIG_VERSION}`,
  '// Run `npm run generate:config` to regenerate',
  '//',
  '/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-empty-object-type */',
].join('\n');

// Ensure the types have an export for all `$defs`.
//
// - OpenTelemetry Configuration discourages putting `title` on `$defs`.
//   https://github.com/open-telemetry/opentelemetry-configuration/blob/v1.0.0/CONTRIBUTING.md#annotations---title-and-description
// - json-schema-to-typescript *inlines* enum types that lack a `title`.
// - We'd like to have an explicit type for enums, e.g. for `SeverityNumber`
//   https://github.com/open-telemetry/opentelemetry-configuration/blob/main/schema-docs.md#severitynumber
//
// Adding a 'title' results in json-schema-to-typescript doing this.
for (const name of Object.keys(schema.$defs)) {
  schema.$defs[name].title = name;
}

// Trim newlines from the end of descriptions. This is to avoid an extra
// blank line in TypeScript comments. This is purely cosmetic.
function rtrimDescription(node) {
  if (Array.isArray(node)) {
    for (let item of node) {
      rtrimDescription(item);
    }
  } else if (typeof node === 'object' && node !== null) {
    if (typeof node.description === 'string') {
      node.description = node.description.trimEnd();
    }
    for (const val of Object.values(node)) {
      rtrimDescription(val);
    }
  }
}
rtrimDescription(schema);

compile(schema, 'OpenTelemetryConfiguration', {
  bannerComment,
  unknownAny: false,
  // Don't add [k: string]: unknown index signatures — keeps types strict
  additionalProperties: false,
  // Suppress $schema and title from being emitted as properties
  ignoreMinAndMaxItems: true,
  // Use declared types for definitions, not inline expansions
  declareExternallyReferenced: true,
  // Don't insert extra blank lines in output
  style: { singleQuote: true, printWidth: 120 },
})
  .then(ts => {
    // file_format is required by the JSON schema and validated at runtime,
    // but callers constructing ConfigurationModel programmatically shouldn't
    // need to supply it. Make it optional in the TypeScript type.
    ts = ts.replace(
      /(\binterface OpenTelemetryConfiguration \{[^}]*?) {2}file_format: /,
      '$1  file_format?: '
    );

    // Rename the root type to ConfigurationModel for consistency with the rest
    // of the codebase and other OTel SDKs.
    ts = ts.replace(/\bOpenTelemetryConfiguration\b/g, 'ConfigurationModel');

    // Refine the TypeScript representation for interfaces where
    // "additionalProperties" is allowed.
    //
    // The configuration JSON schema uses the following for types that have
    // well-known property keys (e.g. 'batch' or 'simple' for `SpanProcessor`),
    // but also allow custom values.
    //    "additionalProperties": {
    //      "type": [ "object", "null" ],
    //
    // json-schema-to-typescript represents this with:
    //    [k: string]: {} | null
    //
    // However, we want:
    //    [k: string]: object | null | undefined
    //
    // - `object` instead of `{}`, because JSON schema "object" means a thing
    //   with keys and values (https://json-schema.org/understanding-json-schema/reference/object)
    //   and TypeScript "object" means non-Primitive values (https://stackoverflow.com/a/49465172)
    //   which is closest. `{}` allows too much (e.g. 42 matches `{}`).
    // - `null` to allow an empty value in the YAML
    // - `undefined` to allow the property to not be specified in the YAML
    ts = ts.replace(
      /\[k: string\]: \{\} \| null;/g,
      '[k: string]: object | null | undefined;'
    );
    // Similarly for schema types with the following (e.g. `Distribution`):
    //    "additionalProperties": {
    //      "type": [ "object" ],
    ts = ts.replace(/\[k: string\]: \{\};/g, '[k: string]: object;');

    // json-schema-to-ts has a limitation where duplicate types are created
    // for re-referenced JSON schema definitions. For example `OtlpHttpExporter`
    // is referenced twice in the schema, and the resulting TS includes both:
    //    export interface OtlpHttpExporter {
    //    export interface OtlpHttpExporter1 {
    // See https://github.com/bcherny/json-schema-to-typescript/issues/193
    // `removeDuplicateTsDeclarations` removes those duplicates.
    ts = removeDuplicateTsDeclarations(ts);

    // Cosmetic: add blank lines between exports.
    ts = ts
      .replace(/\n\/\*\*/g, '\n\n/**')
      .replace(/([^/])\nexport/g, '$1\n\nexport');

    fs.mkdirSync(path.dirname(TYPES_PATH), { recursive: true });
    fs.writeFileSync(TYPES_PATH, ts);
    execSync(`npm run lint:fix -- ${TYPES_PATH}`, {
      cwd: TOP,
      encoding: 'utf8',
    });
    console.log(`Written ${ts.split('\n').length} lines to ${TYPES_PATH}`);
  })
  .catch(err => {
    console.error('Generation failed:', err);
    process.exit(1);
  });
