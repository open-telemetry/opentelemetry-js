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
