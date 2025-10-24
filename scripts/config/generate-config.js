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
 * 3. Post-processes the generated file by adding license headers
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const { compile } = require('json-schema-to-typescript');
const $RefParser = require('@apidevtools/json-schema-ref-parser');

const SCRIPT_DIR = __dirname;
const GENERATED_FILE_PATH = path.join(SCRIPT_DIR, '../../experimental/packages/opentelemetry-configuration/src/generated/opentelemetry_configuration.ts');
const SCHEMA_PATH = path.join(SCRIPT_DIR, 'opentelemetry-configuration/schema/opentelemetry_configuration.json');

async function generateTypes() {
  try {
    console.log('Generating TypeScript types from JSON schema...');

    // Bundle all file references into a single schema to resolve cross-file $refs
    let bundledSchema = await $RefParser.bundle(SCHEMA_PATH);

    // Generate TypeScript types from the bundled schema
    const ts = await compile(bundledSchema, 'OpentelemetryConfiguration', {
      strictIndexSignatures: false,
    });

    fs.writeFileSync(GENERATED_FILE_PATH, ts);

    console.log('TypeScript generation completed successfully');
  } catch (error) {
    console.error('Error during TypeScript generation:', error);
    process.exit(1);
  }
}

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

// This file is auto-generated based on the OpenTelemetry Configuration Schema
// DO NOT EDIT MANUALLY - run npm run generate:config to regenerate

`;

  return licenseHeader + content;
}

function postProcess() {
  try {
    if (!fs.existsSync(GENERATED_FILE_PATH)) {
      console.log('Generated file not found, skipping post-processing');
      return;
    }

    let content = fs.readFileSync(GENERATED_FILE_PATH, 'utf8');

    // Add license header if not present
    if (!content.includes('Copyright The OpenTelemetry Authors')) {
      content = addLicenseHeader(content);
    }

    // Write back the processed content
    fs.writeFileSync(GENERATED_FILE_PATH, content);
    console.log('Post-processing completed successfully');
  } catch (error) {
    console.error('Error during post-processing:', error);
    process.exit(1);
  }
}

async function main() {
  try {
    console.log('Running configuration generation script...');

    // Run the bash script
    const scriptPath = path.join(SCRIPT_DIR, 'generate_config.sh');
    execSync(`bash "${scriptPath}"`, { stdio: 'inherit', cwd: SCRIPT_DIR });

    const outputDir = path.join(SCRIPT_DIR, '../../experimental/packages/opentelemetry-configuration/src/generated');

    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    await generateTypes();

    // Post-process the generated file
    postProcess();

    console.log('Configuration generation completed successfully');
  } catch (error) {
    console.error('Error during configuration generation:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { postProcess };
