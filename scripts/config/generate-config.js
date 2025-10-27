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
 * Configuration generation wrapper script
 * This script:
 * 1. Runs the generate_config.sh bash script to clone the schema repository
 * 2. Uses json-schema-to-typescript to generate TypeScript types from the JSON schema
 * 3. Post-processes the generated file by adding license headers and fixing types
 */

const { compileFromFile } = require('json-schema-to-typescript');
const fs = require('fs');
const { execSync } = require('child_process');
const path = require('path');

const SCRIPT_DIR = __dirname;
const ROOT_DIR = path.join(SCRIPT_DIR, '..', '..');

// Run the bash script to get the latest version of the schema
const scriptPath = path.join(SCRIPT_DIR, 'generate-config.sh');
execSync(`bash "${scriptPath}"`, { stdio: 'inherit', cwd: SCRIPT_DIR });

function addLicenseHeader(content) {
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

  return licenseHeader + content;
}

const options = {
  cwd: `${ROOT_DIR}/scripts/config/opentelemetry-configuration/schema`,
  strictIndexSignatures: true, // adds undefined
  unknownAny: false // too strict for simple and batch processor
}

// compile from file
const outputPath = `${ROOT_DIR}/experimental/packages/opentelemetry-configuration/src/generated/opentelemetry-configuration.ts`;
compileFromFile(`${ROOT_DIR}/scripts/config/opentelemetry-configuration/schema/opentelemetry_configuration.json`, options)
  .then(ts => {
    fs.writeFileSync(outputPath, ts);

    // Post-process step to fix the HttpsOpentelemetryIoOtelconfigInstrumentationJson type
    // See notes below for details on why this is needed
    let content = fs.readFileSync(outputPath, 'utf8');

    // Find and replace the index signature in HttpsOpentelemetryIoOtelconfigInstrumentationJson
    // Pattern matches the interface and its index signature line
    const pattern = /(export interface HttpsOpentelemetryIoOtelconfigInstrumentationJson\s*\{[\s\S]*?)(\s+\[k: string\]: ExperimentalLanguageSpecificInstrumentation;)/;

    content = content.replace(pattern, (match, interfaceStart, indexSignature) => {
      // Replace the index signature with the corrected multi-type version
      const replacement = `  [k: string]:\n    | ExperimentalLanguageSpecificInstrumentation\n    | ExperimentalGeneralInstrumentation\n    | undefined;`;
      return interfaceStart + replacement;
    });

    // Add license header if not present
    if (!content.includes('Copyright The OpenTelemetry Authors')) {
      content = addLicenseHeader(content);
    }

    // Write back the processed content
    fs.writeFileSync(outputPath, content);

    // format opentelemetry-configuration generated types
    execSync(`npx prettier --write ${outputPath}`, { stdio: 'inherit' });

    // compile opentelemetry-configuration package
    execSync(`npm run compile`, { stdio: 'inherit', cwd: `${ROOT_DIR}/experimental/packages/opentelemetry-configuration` });
  });

/* notes
2 bugs in json-schema-to-typescript
Seems to miss adding | undefined to HttpsOpentelemetryIoOtelconfigInstrumentationJson
It also seems to miss the already-defined types in the generated code
https://github.com/bcherny/json-schema-to-typescript/issues/604
https://github.com/bcherny/json-schema-to-typescript/issues/402
related to ts issue https://github.com/microsoft/TypeScript/issues/17867

export interface HttpsOpentelemetryIoOtelconfigInstrumentationJson {
  general?: ExperimentalGeneralInstrumentation;
  cpp?: ExperimentalLanguageSpecificInstrumentation;
...
  swift?: ExperimentalLanguageSpecificInstrumentation;
  [k: string]: ExperimentalLanguageSpecificInstrumentation;
}
  becomes

export interface HttpsOpentelemetryIoOtelconfigInstrumentationJson {
  general?: ExperimentalGeneralInstrumentation;
  cpp?: ExperimentalLanguageSpecificInstrumentation;
...
  swift?: ExperimentalLanguageSpecificInstrumentation;
  [k: string]:
    | ExperimentalLanguageSpecificInstrumentation
    | ExperimentalGeneralInstrumentation
    | undefined;
}
*/
