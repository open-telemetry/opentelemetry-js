/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import globals from 'globals';
import nodePlugin from 'eslint-plugin-n';
import prettierPlugin from 'eslint-plugin-prettier';
import prettierRecommended from 'eslint-plugin-prettier/recommended';
import yalhPlugin from 'eslint-plugin-yet-another-license-header';

const fullLicenseHeader = `
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
`;

const shortLicenseHeader = `
/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */
`;

// Accept either the full Apache 2.0 header or the SPDX short form.
const fullHeaderPattern =
  /^\/\*\n \* Copyright The OpenTelemetry Authors\n \*\n \* Licensed under the Apache License, Version 2\.0 \(the "License"\);\n \* you may not use this file except in compliance with the License\.\n \* You may obtain a copy of the License at\n \*\n \* {6}https:\/\/www\.apache\.org\/licenses\/LICENSE-2\.0\n \*\n \* Unless required by applicable law or agreed to in writing, software\n \* distributed under the License is distributed on an "AS IS" BASIS,\n \* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied\.\n \* See the License for the specific language governing permissions and\n \* limitations under the License\.\n \*\/$/;

const shortHeaderPattern =
  /^\/\*\n \* Copyright The OpenTelemetry Authors\n \* SPDX-License-Identifier: Apache-2\.0\n \*\/$/;

export default tseslint.config(
  {
    ignores: [
      '**/.nx/**',
      '**/build/**',
      '**/coverage/**',
      '**/dist/**',
      '**/node_modules/**',
      '**/protos/**',
      '**/.tmp/**',
      'docs/**',
      // Generated files committed back to the tree.
      'experimental/packages/configuration/src/generated/**',
      'experimental/packages/otlp-transformer/src/generated/**',
      'semantic-conventions/src/experimental_attributes.ts',
      'semantic-conventions/src/experimental_metrics.ts',
      'semantic-conventions/src/stable_attributes.ts',
      'semantic-conventions/src/stable_metrics.ts',
    ],
  },

  // Files we lint. The legacy setup ran `eslint . --ext .ts` per package and
  // explicit JS/MJS in examples + e2e-tests + integration-tests/api. We
  // mirror that here so unrelated `.js` files (karma configs, etc.) stay
  // untouched.
  {
    files: [
      '**/*.ts',
      'examples/**/*.{js,mjs,cjs}',
      'experimental/examples/**/*.{js,mjs,cjs}',
      'e2e-tests/**/*.{js,mjs,cjs}',
      'integration-tests/**/*.{js,cjs}',
    ],
    plugins: {
      n: nodePlugin,
      prettier: prettierPlugin,
      'yet-another-license-header': yalhPlugin,
    },
    extends: [eslint.configs.recommended, prettierRecommended],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        ...globals.node,
        ...globals.browser,
        ...globals.mocha,
      },
    },
    rules: {
      quotes: ['error', 'single', { avoidEscape: true }],
      eqeqeq: ['error', 'smart'],
      'prefer-rest-params': 'off',
      'no-console': 'error',
      'no-shadow': 'off',
      'n/no-deprecated-api': 'warn',
      'yet-another-license-header/header': [
        'error',
        {
          header: fullLicenseHeader,
          allowedHeaderPatterns: [fullHeaderPattern, shortHeaderPattern],
        },
      ],
    },
  },

  // TypeScript files: enable the TS parser and TS-specific rules.
  {
    files: ['**/*.ts'],
    extends: [...tseslint.configs.recommended],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        projectService: true,
      },
    },
    rules: {
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/no-this-alias': 'off',
      '@typescript-eslint/naming-convention': [
        'error',
        {
          selector: 'memberLike',
          modifiers: ['private', 'protected'],
          format: ['camelCase'],
          leadingUnderscore: 'require',
        },
      ],
      '@typescript-eslint/consistent-type-imports': [
        'error',
        {
          prefer: 'type-imports',
          fixStyle: 'separate-type-imports',
        },
      ],
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', args: 'after-used' },
      ],
      '@typescript-eslint/no-inferrable-types': [
        'error',
        { ignoreProperties: true },
      ],
      '@typescript-eslint/no-empty-function': 'off',
      '@typescript-eslint/no-unsafe-function-type': 'warn',
      '@typescript-eslint/no-shadow': 'warn',
      '@typescript-eslint/parameter-properties': 'error',
      'no-restricted-syntax': ['error', 'ExportAllDeclaration'],
      'prefer-rest-params': 'off',
    },
  },

  // Test sources: relax most rules, mirroring the legacy `test/**/*.ts` override.
  {
    files: ['**/test/**/*.ts'],
    rules: {
      'no-console': 'warn',
      'no-empty': 'off',
      '@typescript-eslint/no-unsafe-function-type': 'warn',
      '@typescript-eslint/no-empty-function': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/no-require-imports': 'off',
      '@typescript-eslint/no-shadow': 'off',
      '@typescript-eslint/no-floating-promises': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
    },
  },

  // Examples: pure JS, no license header check (matches legacy ./examples/.eslintrc.js).
  {
    files: ['examples/**/*.{js,mjs,cjs}', 'experimental/examples/**/*.{js,mjs,cjs}'],
    languageOptions: {
      sourceType: 'commonjs',
      globals: {
        ...globals.node,
        ...globals.mocha,
        ...globals.es2021,
      },
      parserOptions: {
        ecmaVersion: 2021,
      },
    },
    rules: {
      'yet-another-license-header/header': 'off',
    },
  },

  // e2e-tests use .mjs and may log freely.
  {
    files: ['e2e-tests/**/*.{js,mjs,cjs}'],
    languageOptions: {
      sourceType: 'module',
      globals: { ...globals.node },
    },
    rules: {
      'no-console': 'off',
    },
  },

  // integration-tests use .js (CommonJS).
  {
    files: ['integration-tests/**/*.{js,cjs}'],
    languageOptions: {
      sourceType: 'commonjs',
      globals: { ...globals.node, ...globals.mocha },
    },
  },

  // Browser-only context-zone packages need the Zone global.
  {
    files: ['packages/opentelemetry-context-zone-peer-dep/**/*.ts'],
    languageOptions: {
      globals: { Zone: 'readonly' },
    },
  },

  // shim-opencensus carries an upstream OpenCensus header for one file.
  {
    files: ['experimental/packages/shim-opencensus/src/OpenCensusMetricProducer.ts'],
    rules: {
      'yet-another-license-header/header': 'off',
    },
  }
);
