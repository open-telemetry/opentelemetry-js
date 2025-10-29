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
const yaml = require('yaml');
const ts = require('typescript');

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

/**
 * Manual mapping table between YAML type names and TypeScript interface/type names
 * This handles cases where json-schema-to-typescript generates different names
 */
const TYPE_NAME_MAPPING = {
  'OpenTelemetryConfiguration': 'OpenTelemetryConfiguration',
  'Resource': 'HttpsOpentelemetryIoOtelconfigResourceJson',
  'ResourceDetection': 'ExperimentalResourceDetection',
  'Detector': 'ExperimentalResourceDetector',
  'DetectorAttributes': 'IncludeExclude',
  'AttributeLimits': 'AttributeLimits',
  'Propagator': 'HttpsOpentelemetryIoOtelconfigPropagatorJson',
  'CompositePropagator': 'TextMapPropagator',
  'LoggerProvider': 'HttpsOpentelemetryIoOtelconfigLoggerProviderJson',
  'LogRecordProcessor': 'LogRecordProcessor',
  'BatchLogRecordProcessor': 'BatchLogRecordProcessor',
  'SimpleLogRecordProcessor': 'SimpleLogRecordProcessor',
  'LogRecordExporter': 'LogRecordExporter',
  'LogRecordLimits': 'LogRecordLimits',
  'LoggerConfigurator': 'ExperimentalLoggerConfigurator',
  'LoggerConfigAndMatcher': 'ExperimentalLoggerMatcherAndConfig',
  'LoggerConfig': 'ExperimentalLoggerConfig',
  'TracerProvider': 'HttpsOpentelemetryIoOtelconfigTracerProviderJson',
  'SpanProcessor': 'SpanProcessor',
  'BatchSpanProcessor': 'BatchSpanProcessor',
  'SimpleSpanProcessor': 'SimpleSpanProcessor',
  'SpanExporter': 'SpanExporter',
  'ZipkinSpanExporter': 'ZipkinSpanExporter',
  'SpanLimits': 'SpanLimits',
  'Sampler': 'Sampler',
  'TracerConfigurator': 'ExperimentalTracerConfigurator',
  'TracerConfigAndMatcher': 'ExperimentalTracerMatcherAndConfig',
  'TracerConfig': 'ExperimentalTracerConfig',
  'MeterProvider': 'HttpsOpentelemetryIoOtelconfigMeterProviderJson',
  'MetricReader': 'MetricReader',
  'PullMetricReader': 'PullMetricReader',
  'PeriodicMetricReader': 'PeriodicMetricReader',
  'MetricProducer': 'MetricProducer',
  'CardinalityLimits': 'CardinalityLimits',
  'MetricExporter': ['PushMetricExporter', 'PullMetricExporter'],  // Handles both push and pull
  'PrometheusMetricExporter': 'ExperimentalPrometheusMetricExporter',
  'PrometheusIncludeExclude': 'IncludeExclude',
  'View': 'View',
  'Selector': 'ViewSelector',
  'Stream': 'ViewStream',
  'StreamIncludeExclude': 'IncludeExclude',
  'StreamAggregation': 'Aggregation',
  'StreamAggregationExplicitBucketHistogram': 'ExplicitBucketHistogramAggregation',
  'MeterConfigurator': 'ExperimentalMeterConfigurator',
  'MeterConfigAndMatcher': 'ExperimentalMeterMatcherAndConfig',
  'MeterConfig': 'ExperimentalMeterConfig',
  'OtlpExporterCommon': ['OtlpHttpExporter', 'OtlpGrpcExporter', 'OtlpHttpMetricExporter', 'OtlpGrpcMetricExporter'],
  'OtlpHttpExporter': ['OtlpHttpExporter', 'OtlpHttpSpanExporter', 'OtlpHttpLogRecordExporter'],
  'OtlpHttpSpanExporter': 'OtlpHttpExporter',
  'OtlpHttpMetricExporter': 'OtlpHttpMetricExporter',
  'OtlpHttpLogRecordExporter': 'OtlpHttpExporter',
  'OtlpGrpcExporter': 'OtlpGrpcExporter',
  'OtlpFileExporter': ['ExperimentalOtlpFileExporter', 'ExperimentalOtlpFileMetricExporter'],
  'Instrumentation': 'HttpsOpentelemetryIoOtelconfigInstrumentationJson',
  'GeneralInstrumentation': 'ExperimentalGeneralInstrumentation',
  'GeneralInstrumentationPeer': 'ExperimentalPeerInstrumentation',
  'GeneralInstrumentationHttp': 'ExperimentalHttpInstrumentation',
  'GeneralInstrumentationHttpClient': 'ExperimentalHttpInstrumentation',  // client property
  'GeneralInstrumentationHttpServer': 'ExperimentalHttpInstrumentation',  // server property
  'LanguageSpecificInstrumentation': 'ExperimentalLanguageSpecificInstrumentation',
};

/**
 * Load type descriptions from YAML file
 */
function loadTypeDescriptions() {
  const yamlPath = path.join(SCRIPT_DIR, 'opentelemetry-configuration/schema/type_descriptions.yaml');
  const yamlContent = fs.readFileSync(yamlPath, 'utf8');
  const parsed = yaml.parse(yamlContent);

  // Build a map from type name to property descriptions
  const typeDescriptions = new Map();

  for (const entry of parsed) {
    if (entry.type && entry.property_descriptions) {
      typeDescriptions.set(entry.type, entry.property_descriptions);
    }
  }

  return typeDescriptions;
}

/**
 * Create JSDoc comment from description text
 */
function createJSDocComment(description, indent = 0) {
  const indentStr = ' '.repeat(indent);
  const cleanDesc = description.replace(/\n\s*\n/g, '\n\n').trim();
  const lines = cleanDesc.split('\n');

  if (lines.length === 1) {
    return `${indentStr}/** ${lines[0]} */\n`;
  }

  let comment = `${indentStr}/**\n`;
  for (const line of lines) {
    comment += `${indentStr} * ${line}\n`;
  }
  comment += `${indentStr} */\n`;

  return comment;
}

/**
 * Add descriptions to generated TypeScript file
 */
function addDescriptionsToTypes(content) {
  const typeDescriptions = loadTypeDescriptions();
  const sourceFile = ts.createSourceFile(
    'temp.ts',
    content,
    ts.ScriptTarget.Latest,
    true
  );

  const modifications = [];

  function visitNode(node) {
    if (ts.isInterfaceDeclaration(node) && node.name) {
      const interfaceName = node.name.text;
      const yamlTypes = findYamlTypesForInterface(interfaceName);

      for (const yamlType of yamlTypes) {
        const descriptions = typeDescriptions.get(yamlType);
        if (descriptions) {
          // Add descriptions for each property
          for (const member of node.members) {
            if (ts.isPropertySignature(member) && member.name) {
              const propertyName = getPropertyName(member.name);
              const description = descriptions[propertyName];

              if (description && !hasExistingJSDoc(member, content)) {
                const indent = getIndentation(member, content);
                const jsDoc = createJSDocComment(description, indent);
                modifications.push({
                  pos: member.pos,
                  jsDoc: jsDoc
                });
              }
            }
          }
          break; // Found matching type, stop searching
        }
      }
    }

    if (ts.isTypeAliasDeclaration(node) && node.name) {
      const typeName = node.name.text;
      const yamlTypes = findYamlTypesForInterface(typeName);

      // For type aliases that are object types, we need to extract properties
      if (node.type && ts.isTypeLiteralNode(node.type)) {
        for (const yamlType of yamlTypes) {
          const descriptions = typeDescriptions.get(yamlType);
          if (descriptions) {
            for (const member of node.type.members) {
              if (ts.isPropertySignature(member) && member.name) {
                const propertyName = getPropertyName(member.name);
                const description = descriptions[propertyName];

                if (description && !hasExistingJSDoc(member, content)) {
                  const indent = getIndentation(member, content);
                  const jsDoc = createJSDocComment(description, indent);
                  modifications.push({
                    pos: member.pos,
                    jsDoc: jsDoc
                  });
                }
              }
            }
            break;
          }
        }
      }

      if (node.type && ts.isIntersectionTypeNode(node.type)) {
        for (const typeNode of node.type.types) {
          if (ts.isTypeLiteralNode(typeNode)) {
            for (const yamlType of yamlTypes) {
              const descriptions = typeDescriptions.get(yamlType);
              if (descriptions) {
                for (const member of typeNode.members) {
                  if (ts.isPropertySignature(member) && member.name) {
                    const propertyName = getPropertyName(member.name);
                    const description = descriptions[propertyName];

                    if (description && !hasExistingJSDoc(member, content)) {
                      const indent = getIndentation(member, content);
                      const jsDoc = createJSDocComment(description, indent);
                      modifications.push({
                        pos: member.pos,
                        jsDoc: jsDoc
                      });
                    }
                  }
                }
                break;
              }
            }
          }
        }
      }
    }

    ts.forEachChild(node, visitNode);
  }

  visitNode(sourceFile);

  // Apply modifications in reverse order (from end to start) to maintain positions
  modifications.sort((a, b) => b.pos - a.pos);

  let modifiedContent = content;
  for (const mod of modifications) {
    // Insert JSDoc, but remove the first newline from the content after insertion point
    // to avoid double spacing (JSDoc ends with \n, and property has leading \n)
    const afterContent = modifiedContent.slice(mod.pos);
    const trimmedAfter = afterContent.replace(/^\n/, '');
    modifiedContent = modifiedContent.slice(0, mod.pos) + '\n' + mod.jsDoc + trimmedAfter;
  }

  return modifiedContent;
}

/**
 * Find YAML type names that correspond to a TypeScript interface name
 */
function findYamlTypesForInterface(interfaceName) {
  const matches = [];

  for (const [yamlType, tsNames] of Object.entries(TYPE_NAME_MAPPING)) {
    if (Array.isArray(tsNames)) {
      if (tsNames.includes(interfaceName)) {
        matches.push(yamlType);
      }
    } else if (tsNames === interfaceName) {
      matches.push(yamlType);
    }
  }

  return matches;
}

/**
 * Get property name from PropertyName node
 */
function getPropertyName(name) {
  if (ts.isIdentifier(name)) {
    return name.text;
  } else if (ts.isStringLiteral(name)) {
    return name.text;
  }
  return '';
}

/**
 * Check if a node already has JSDoc comments
 */
function hasExistingJSDoc(node, sourceText) {
  const nodeStart = node.getStart();
  const textBefore = sourceText.slice(Math.max(0, node.pos), nodeStart);
  return textBefore.includes('/**') || textBefore.includes('@minItems');
}

/**
 * Get the indentation level for a node
 */
function getIndentation(node, sourceText) {
  const nodeStart = node.getStart();
  const textBefore = sourceText.slice(0, nodeStart);
  const lastNewline = textBefore.lastIndexOf('\n');

  if (lastNewline === -1) {
    return 0;
  }

  const lineStart = lastNewline + 1;
  const indent = nodeStart - lineStart;
  return indent;
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

    // Add JSDoc descriptions from type_descriptions.yaml
    let content = fs.readFileSync(outputPath, 'utf8');
    content = addDescriptionsToTypes(content);
    fs.writeFileSync(outputPath, content);

    // Fix the HttpsOpentelemetryIoOtelconfigInstrumentationJson type
    // See notes below for details on why this is needed
    content = fs.readFileSync(outputPath, 'utf8');

    // Find and replace the index signature in HttpsOpentelemetryIoOtelconfigInstrumentationJson
    // Pattern matches the interface and its index signature line
    const pattern = /(export interface HttpsOpentelemetryIoOtelconfigInstrumentationJson\s*\{[\s\S]*?)(\s+\[k: string\]: ExperimentalLanguageSpecificInstrumentation;)/;

    content = content.replace(pattern, (_match, interfaceStart, _indexSignature) => {
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
