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
 * Post-processes the generated protobuf file to use default import
 * instead of namespace import for CJS/ESM interop compatibility.
 *
 * Node.js 24+ requires default import for CJS modules when using ESM.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootJsPath = join(__dirname, '..', 'src', 'generated', 'root.js');

const content = readFileSync(rootJsPath, 'utf8');
const fixed = content.replace(
  /^import \* as \$protobuf from/m,
  'import $protobuf from'
);

writeFileSync(rootJsPath, fixed);
// eslint-disable-next-line no-console
console.log('Fixed protobuf import in root.js');
