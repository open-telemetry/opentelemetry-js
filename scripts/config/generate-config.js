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

const SCHEMA_OUT_PATH = path.join(
  SCRIPT_DIR,
  '../../experimental/packages/configuration/src/generated/schema.ts'
);

const schema = JSON.parse(fs.readFileSync(SCHEMA_PATH, 'utf8'));

// Strip minItems constraints from the schema used for runtime validation.
// preprocessNullArrays() converts null → [] for processors/readers so providers
// with no children still pass validation; minItems: 1 would reject those.
function stripMinItems(obj) {
  if (typeof obj !== 'object' || obj === null) return obj;
  if (Array.isArray(obj)) return obj.map(stripMinItems);
  const result = {};
  for (const [k, v] of Object.entries(obj)) {
    if (k === 'minItems') continue;
    result[k] = stripMinItems(v);
  }
  return result;
}
const runtimeSchema = stripMinItems(schema);

const licenseHeader = `/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */
`;

const bannerComment = [
  licenseHeader,
  '/* eslint-disable */',
  '// AUTO-GENERATED — do not edit',
  '// Generated from opentelemetry-configuration JSON schema v1.0.0-rc.3',
  '// Run `npm run generate:config` from the configuration package to regenerate',
].join('\n');

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

    // json-schema-to-typescript inlines enum types that lack a title property.
    // Emit const objects + type aliases for defs the public API needs by name,
    // so consumers can use e.g. ExemplarFilter.TraceBased as a value.
    const toPascalCase = s =>
      s.split('_').map(p => p.charAt(0).toUpperCase() + p.slice(1)).join('');
    const namedEnums = [
      'InstrumentType',
      'ExporterTemporalityPreference',
      'ExemplarFilter',
      'SeverityNumber',
      'ExporterDefaultHistogramAggregation',
      'ExperimentalPrometheusTranslationStrategy',
      'OtlpHttpEncoding',
    ];
    for (const defName of namedEnums) {
      const def = schema.$defs && schema.$defs[defName];
      if (!def || !Array.isArray(def.enum)) continue;
      const stringVals = def.enum.filter(v => v !== null && typeof v === 'string');
      if (!stringVals.length) continue;
      const entries = stringVals.map(v => `  ${toPascalCase(v)}: ${JSON.stringify(v)},`);
      ts += `\nexport const ${defName} = {\n${entries.join('\n')}\n} as const;\n`;
      ts += `export type ${defName} = typeof ${defName}[keyof typeof ${defName}];\n`;
    }

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

    // Replace overly-narrow index signatures that conflict with typed properties.
    // When additionalProperties is absent or true, json-schema-to-typescript emits
    // [k: string]: {} | null which is too narrow to accommodate specific typed fields.
    ts = ts.replace(/\[k: string\]: \{\} \| null;/g, '[k: string]: unknown;');
    ts = ts.replace(/\[k: string\]: \{\};/g, '[k: string]: unknown;');

    fs.mkdirSync(path.dirname(TYPES_PATH), { recursive: true });
    fs.writeFileSync(TYPES_PATH, ts);
    console.log(`Written ${ts.split('\n').length} lines to ${TYPES_PATH}`);

    // Emit the raw JSON schema as a TS module so it can be imported for
    // runtime validation (ajv) without needing resolveJsonModule in tsconfig.
    const schemaTs = [
      licenseHeader,
      '/* eslint-disable */',
      '// AUTO-GENERATED — do not edit',
      '// Generated from opentelemetry-configuration JSON schema',
      '// Run `npm run generate:config` from the configuration package to regenerate',
      '',
      '// eslint-disable-next-line @typescript-eslint/no-explicit-any',
      `export const opentelemetryConfigurationSchema: any = ${JSON.stringify(runtimeSchema, null, 2)};`,
      '',
    ].join('\n');
    fs.writeFileSync(SCHEMA_OUT_PATH, schemaTs);
    console.log(`Written schema to ${SCHEMA_OUT_PATH}`);
  })
  .catch(err => {
    console.error('Generation failed:', err);
    process.exit(1);
  });
