#!/usr/bin/env node

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

/**
 * Generates TypeScript types from the OpenTelemetry configuration JSON schema
 * using json-schema-to-typescript.
 *
 * Usage: node generate-config.js
 * Run from the configuration package: npm run generate:config
 */

'use strict';

const { compile } = require('json-schema-to-typescript');
const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const Ajv = require('ajv/dist/2020');
const standaloneCode = require('ajv/dist/standalone').default;

const SCRIPT_DIR = __dirname;

// Run the bash script to clone / refresh the schema repository
const bashResult = spawnSync('bash', ['generate-config.sh'], {
  stdio: 'inherit',
  cwd: SCRIPT_DIR,
});
if (bashResult.error) {
  throw bashResult.error;
}

const SCHEMA_PATH = path.join(
  SCRIPT_DIR,
  'opentelemetry-configuration',
  'opentelemetry_configuration.json'
);

const TYPES_PATH = path.join(
  SCRIPT_DIR,
  '../../experimental/packages/configuration/src/generated/types.ts'
);

const VALIDATOR_JS_PATH = path.join(
  SCRIPT_DIR,
  '../../experimental/packages/configuration/src/generated/validator.js'
);

const VALIDATOR_DTS_PATH = path.join(
  SCRIPT_DIR,
  '../../experimental/packages/configuration/src/generated/validator.d.ts'
);

const licenseHeader = `/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */
`;

// ---- Generate AJV-based schema validator.

const schema = JSON.parse(fs.readFileSync(SCHEMA_PATH, 'utf8'));

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
  '// Run `npm run generate:config` from the configuration package to regenerate',
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
  '// Run `npm run generate:config` from the configuration package to regenerate',
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


// ---- Generate TypeScript types file for schema.

const bannerComment = [
  licenseHeader,
  '/* eslint-disable */',
  '// AUTO-GENERATED — do not edit',
  '// Generated from opentelemetry-configuration JSON schema v1.0.0',
  '// Run `npm run generate:config` from the configuration package to regenerate',
].join('\n');

// Ensure the types have an export for all `$defs`.
//
// opentelemetry-configuration discourages putting `title` on `$defs`.
// json-schema-to-typescript *inlines* enum types that lack a `title`.
// We'd like to have an explicit type for enums, e.g. for `SeverityNumber`
//  https://github.com/open-telemetry/opentelemetry-configuration/blob/main/schema-docs.md#severitynumber
// Adding a 'title' results in json-schema-to-typescript doing this.
for (const name of Object.keys(schema.$defs)) {
  schema.$defs[name].title = name;
}

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
      /(\binterface OpenTelemetryConfiguration \{[^}]*?)  file_format: /,
      '$1  file_format?: '
    );

    // Rename the root type to ConfigurationModel for consistency with the rest
    // of the codebase and other OTel SDKs.
    ts = ts.replace(
      /\bOpenTelemetryConfiguration\b/g,
      'ConfigurationModel'
    );

    // Deduplicate TLS types: json-schema-to-typescript emits GrpcTls1/HttpTls1 as
    // structurally identical duplicates of GrpcTls/HttpTls (same $defs reused in multiple
    // schema locations). Remove the duplicate type declarations and rename all references
    // to the canonical names so consumers only see GrpcTls and HttpTls.
    function removeTypeDef(src, typeName) {
      const startMarker = `\nexport type ${typeName} =`;
      const start = src.indexOf(startMarker);
      if (start === -1) return src;
      // Find the next top-level export after this type declaration
      const nextExport = src.indexOf('\nexport ', start + startMarker.length);
      return nextExport === -1 ? src.slice(0, start) : src.slice(0, start) + '\n' + src.slice(nextExport + 1);
    }
    ts = removeTypeDef(ts, 'GrpcTls1');
    ts = removeTypeDef(ts, 'HttpTls1');
    ts = ts.replace(/\bGrpcTls1\b/g, 'GrpcTls');
    ts = ts.replace(/\bHttpTls1\b/g, 'HttpTls');

    // Change the TypeScript representation for interfaces where
    // "additionalProperties" is allowed.
    //
    // The configuration JSON schema uses:
    //    "additionalProperties": {
    //      "type": [ "object", "null" ],
    // for types that have well-known property keys (e.g. 'batch' or 'simple'
    // for `SpanProcessor`), but allow custom values.
    //
    // json-schema-to-typescript represents this with:
    //    [k: string]: {} | null
    //
    // However, we want:
    //    [k: string]: object | undefined
    //
    // - `object` instead of `{}`, because JSON schema "object" means a thing
    //   with keys and values (https://json-schema.org/understanding-json-schema/reference/object)
    //   and TypeScript "object" means non-Primitive values (https://stackoverflow.com/a/49465172)
    //   which is closest. `{}` allows too much (e.g. 42 matches `{}`).
    // - `undefined` rather than `null` because we want to express that the
    //   property can be unspecified.
    ts = ts.replace(/\[k: string\]: \{\} \| null;/g, '[k: string]: object | undefined;');
    // Similarly for schema types with the following (e.g. `Distribution`):
    //    "additionalProperties": {
    //      "type": [ "object" ],
    ts = ts.replace(/\[k: string\]: \{\};/g, '[k: string]: object;');

    // Strip `| null` from type unions. The JSON schema uses
    // "type": ["string", "null"] to express optional/nullable fields, which
    // json-schema-to-typescript converts to `T | null`. In TypeScript the `?:`
    // modifier already expresses absence; consumers (e.g. sdk-node) expect
    // `T | undefined`, not `T | null`, so null in the union causes type errors
    // at assignment sites. Removing it keeps the types compatible.
    // The runtime counterpart is stripNulls() in FileConfigFactory.ts, which
    // deletes null-valued properties after YAML parsing so the data matches.
    ts = ts.replace(/ \| null\b/g, '');

    fs.mkdirSync(path.dirname(TYPES_PATH), { recursive: true });
    fs.writeFileSync(TYPES_PATH, ts);
    console.log(`Written ${ts.split('\n').length} lines to ${TYPES_PATH}`);

  })
  .catch(err => {
    console.error('Generation failed:', err);
    process.exit(1);
  });
