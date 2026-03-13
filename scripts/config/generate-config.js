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
 * Generates Zod schemas from the OpenTelemetry configuration JSON schema.
 * Produces a single generated.ts file that provides both TypeScript types
 * (via z.infer<>) and runtime validation (via .parse() / .safeParse()).
 *
 * Usage: node generate-config.js
 * Run from the configuration package: npm run generate:config
 */

'use strict';

const { jsonSchemaToZod } = require('json-schema-to-zod');
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
const OUT_PATH = path.join(
  SCRIPT_DIR,
  '../../experimental/packages/configuration/src/generated/opentelemetry-configuration.ts'
);

const schema = JSON.parse(fs.readFileSync(SCHEMA_PATH, 'utf8'));
const defs = schema.$defs;

// --- Schema pre-processing ---

// Unwrap single-element type arrays: type: ["object"] -> type: "object"
// json-schema-to-zod generates z.union([single]) for these, which is invalid in Zod v3.
//
// Convert oneOf -> anyOf: the OTel schema uses oneOf for type unions where types don't
// overlap (e.g. AttributeNameValue.value: string|number|boolean|null|array).
// json-schema-to-zod generates z.superRefine() for oneOf, but the ctx API changed in
// Zod v4. anyOf (z.union) is semantically equivalent for non-overlapping types.
function normalizeSchema(obj) {
  if (typeof obj !== 'object' || obj === null) return obj;
  if (Array.isArray(obj)) return obj.map(normalizeSchema);
  const result = {};
  for (const [k, v] of Object.entries(obj)) {
    if (k === 'type' && Array.isArray(v) && v.length === 1) {
      result[k] = v[0];
    } else if (k === 'oneOf') {
      result['anyOf'] = normalizeSchema(v);
    } else {
      result[k] = normalizeSchema(v);
    }
  }
  return result;
}

const normalizedDefs = normalizeSchema(defs);
const normalizedRootSchema = normalizeSchema({ ...schema, $defs: undefined });

// --- Circular type detection (SCC via Tarjan's algorithm) ---

function findStronglyConnectedComponents(deps) {
  const index = {},
    lowlink = {},
    onStack = {},
    stack = [];
  const sccs = [];
  let idx = 0;

  function strongconnect(v) {
    index[v] = lowlink[v] = idx++;
    stack.push(v);
    onStack[v] = true;
    for (const w of deps[v] || []) {
      if (!(w in index)) {
        strongconnect(w);
        lowlink[v] = Math.min(lowlink[v], lowlink[w]);
      } else if (onStack[w]) {
        lowlink[v] = Math.min(lowlink[v], index[w]);
      }
    }
    if (lowlink[v] === index[v]) {
      const scc = [];
      let w;
      do {
        w = stack.pop();
        onStack[w] = false;
        scc.push(w);
      } while (w !== v);
      sccs.push(scc);
    }
  }

  for (const v of Object.keys(deps)) {
    if (!(v in index)) strongconnect(v);
  }
  return sccs;
}

function getDirectRefs(obj) {
  const refs = new Set();
  if (typeof obj !== 'object' || obj === null) return refs;
  if (Array.isArray(obj)) {
    obj.forEach(v => getDirectRefs(v).forEach(r => refs.add(r)));
    return refs;
  }
  if (obj.$ref) refs.add(obj.$ref.split('/').pop());
  for (const [k, v] of Object.entries(obj)) {
    if (k !== '$defs') getDirectRefs(v).forEach(r => refs.add(r));
  }
  return refs;
}

const deps = {};
for (const name of Object.keys(normalizedDefs)) {
  deps[name] = [...getDirectRefs(normalizedDefs[name])].filter(
    r => r in normalizedDefs
  );
}

const sccs = findStronglyConnectedComponents(deps);
const circularNodes = new Set(
  sccs
    .filter(scc => scc.length > 1 || deps[scc[0]]?.includes(scc[0]))
    .flat()
);

// Tarjan's outputs SCCs in dependency-first order (leaves before roots)
const topoOrder = sccs.flat();

// --- Code generation ---

const parserOverride = s => {
  if (!s.$ref) return undefined;
  const name = s.$ref.split('/').pop();
  const varName = `${name}Schema`;
  if (s.description) return `${varName}.describe(${JSON.stringify(s.description)})`;
  return varName;
};

const lazyLines = [];
const defLines = [];

for (const name of topoOrder) {
  if (!(name in normalizedDefs)) continue;
  const defSchema = normalizedDefs[name];
  const varName = `${name}Schema`;

  let zodExpr;
  try {
    zodExpr = jsonSchemaToZod(defSchema, { parserOverride });
  } catch (e) {
    zodExpr = `z.any() /* codegen error: ${e.message} */`;
  }

  if (circularNodes.has(name)) {
    // Lazy declaration goes at the top; actual definition follows in topo order
    lazyLines.push(
      `export const ${varName}: z.ZodTypeAny = z.lazy(() => _${name}Schema);`
    );
    defLines.push(`_${name}Schema = ${zodExpr};`);
    defLines.push('');
  } else {
    defLines.push(`export const ${varName} = ${zodExpr};`);
    defLines.push('');
  }
}

const licenseHeader = `/*
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
`;

const lines = [];
lines.push(licenseHeader);
lines.push(`// AUTO-GENERATED — do not edit`);
lines.push(`// Generated from opentelemetry-configuration JSON schema`);
lines.push(`// Run \`npm run generate:config\` from the configuration package to regenerate`);
lines.push(`import { z } from 'zod';`);
lines.push('');

// Forward declarations for circular types
const circularList = [...circularNodes];
if (circularList.length > 0) {
  lines.push(`// Forward declarations for circular types`);
  for (const name of circularList) {
    lines.push(`let _${name}Schema: z.ZodTypeAny;`);
  }
  lines.push('');
  lines.push(...lazyLines);
  lines.push('');
}

lines.push(...defLines);

// Root schema
const rootZod = jsonSchemaToZod(normalizedRootSchema, { parserOverride });
lines.push(`export const OpenTelemetryConfigurationSchema = ${rootZod};`);
lines.push('');

let output = lines.join('\n');

// Zod v4: z.record() requires two args (key type + value type).
// json-schema-to-zod (v3 target) emits z.record(valueExpr) — add z.string() key arg.
// The negative lookahead avoids double-patching already-correct occurrences.
output = output.replace(/z\.record\((?!z\.string\(\))/g, 'z.record(z.string(), ');

fs.mkdirSync(path.dirname(OUT_PATH), { recursive: true });
fs.writeFileSync(OUT_PATH, output);
console.log(`Written ${output.split('\n').length} lines to ${OUT_PATH}`);
console.log(`Circular types (${circularList.length}): ${circularList.join(', ')}`);

// =============================================================================
// TypeScript interface generation → types.ts
// =============================================================================

const TYPES_PATH = path.join(
  SCRIPT_DIR,
  '../../experimental/packages/configuration/src/generated/types.ts'
);

/**
 * Convert a JSON schema fragment to a TypeScript type string.
 * `schema` is already normalised (oneOf→anyOf, single-element arrays unwrapped).
 */
function schemaToTsType(schema) {
  if (!schema || schema === true) return 'unknown';

  // $ref — refer to the named type directly
  if (schema.$ref) {
    return schema.$ref.split('/').pop();
  }

  // anyOf union
  if (schema.anyOf) {
    const parts = schema.anyOf.map(schemaToTsType);
    // Deduplicate and join
    return [...new Set(parts)].join(' | ');
  }

  // enum → string literal union
  if (schema.enum !== undefined) {
    return schema.enum
      .map(v => (v === null ? 'null' : JSON.stringify(v)))
      .join(' | ');
  }

  const types = Array.isArray(schema.type)
    ? schema.type
    : schema.type
    ? [schema.type]
    : [];

  if (types.length === 0) return 'unknown';

  const parts = [];
  for (const t of types) {
    if (t === 'null') {
      parts.push('null');
    } else if (t === 'string') {
      parts.push('string');
    } else if (t === 'number' || t === 'integer') {
      parts.push('number');
    } else if (t === 'boolean') {
      parts.push('boolean');
    } else if (t === 'array') {
      const itemType = schema.items ? schemaToTsType(schema.items) : 'unknown';
      parts.push(`Array<${itemType}>`);
    } else if (t === 'object') {
      // Inline anonymous object — just use 'object' (properties handled at def level)
      parts.push('object');
    } else {
      parts.push('unknown');
    }
  }
  return [...new Set(parts)].join(' | ');
}

/**
 * Quote a property name if it contains characters that aren't valid bare identifiers.
 */
function quoteKey(name) {
  return /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(name) ? name : `'${name}'`;
}

/**
 * Generate a TypeScript type declaration for a single $defs entry.
 * Returns an array of lines (no trailing newline).
 */
function generateTsDecl(name, schema) {
  const types = Array.isArray(schema.type)
    ? schema.type
    : schema.type
    ? [schema.type]
    : [];

  const isObject = types.includes('object') || !!schema.properties;
  const isNullable = types.includes('null');

  // ── Non-object: emit a type alias ──────────────────────────────────────────
  if (!isObject) {
    const tsType = schemaToTsType(schema);
    return [`export type ${name} = ${tsType};`];
  }

  // ── Object: emit an interface (or type alias when the object is nullable) ──
  const required = new Set(schema.required || []);
  const propLines = [];

  for (const [propName, propSchema] of Object.entries(schema.properties || {})) {
    const opt = required.has(propName) ? '' : '?';
    const tsType = schemaToTsType(propSchema);
    propLines.push(`  ${quoteKey(propName)}${opt}: ${tsType};`);
  }

  // Index signature for open schemas
  const ap = schema.additionalProperties;
  if (ap !== false && ap !== undefined) {
    // ap may be `true` or a schema fragment — either way use `unknown`
    propLines.push(`  [key: string]: unknown;`);
  }

  if (isNullable) {
    // TypeScript interfaces can't be unioned with null, so use a type alias.
    const body = propLines.length ? `{\n${propLines.join('\n')}\n}` : '{}';
    return [`export type ${name} = ${body} | null;`];
  }

  const lines = [`export interface ${name} {`, ...propLines, '}'];
  return lines;
}

// ── Build the types file ─────────────────────────────────────────────────────

const typeLines = [];
typeLines.push(licenseHeader);
typeLines.push(`// AUTO-GENERATED — do not edit`);
typeLines.push(`// Generated from opentelemetry-configuration JSON schema`);
typeLines.push(
  `// Run \`npm run generate:config\` from the configuration package to regenerate`
);
typeLines.push(`import type { z } from 'zod';`);
typeLines.push(
  `import { OpenTelemetryConfigurationSchema } from './opentelemetry-configuration';`
);
typeLines.push('');

// Emit one declaration per def, in topological order
for (const name of topoOrder) {
  if (!(name in normalizedDefs)) continue;
  const decl = generateTsDecl(name, normalizedDefs[name]);
  typeLines.push(...decl);
  typeLines.push('');
}

// Root schema → Configuration interface
const rootSchema = normalizedRootSchema;
const rootDecl = generateTsDecl('Configuration', rootSchema);
typeLines.push(...rootDecl);
typeLines.push('');

// ConfigurationSchema export (cast avoids TS7056 "type exceeds max length")
typeLines.push(
  `// eslint-disable-next-line @typescript-eslint/no-explicit-any`
);
typeLines.push(
  `export const ConfigurationSchema: z.ZodType<Configuration> = OpenTelemetryConfigurationSchema as z.ZodType<Configuration>;`
);
typeLines.push('');

const typesOutput = typeLines.join('\n');
fs.writeFileSync(TYPES_PATH, typesOutput);
console.log(`Written ${typesOutput.split('\n').length} lines to ${TYPES_PATH}`);
