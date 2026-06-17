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

const defaultLicense = `
/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */
`;

// This matches `defaultLicense`, but allows additional Copyright holders
// either on the same line:
//    Copyright The OpenTelemetry Authors, <someone>, <another someone>
// and/or on subsequent lines:
//    Copyright The OpenTelemetry Authors
//    Copyright <someone>
//    Copyright <another someone>
const licensePattern =
  /^\/\*\n \* Copyright The OpenTelemetry Authors(?:, [^\n]+)*\n(?: \* Copyright [^\n]+\n)* \* SPDX-License-Identifier: Apache-2.0\n \*\/$/;

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
      // tsd-style negative type-check fixtures, intentionally outside tsconfig.
      'experimental/packages/configuration/test/fixtures/types/**',
      'experimental/packages/otlp-transformer/src/generated/**',
      'experimental/packages/otlp-transformer/test/generated/**',
      // protobuf-ts generated test fixtures (buf generate output, gitignored).
      'experimental/packages/opentelemetry-instrumentation-grpc/test/proto/**',
      // protobuf-generated example sources.
      'examples/grpc-js/helloworld_pb.js',
      'examples/grpc-js/helloworld_grpc_pb.js',
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
          header: defaultLicense,
          allowedHeaderPatterns: [licensePattern],
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
    files: [
      'examples/**/*.{js,mjs,cjs}',
      'experimental/examples/**/*.{js,mjs,cjs}',
    ],
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
    // The legacy `examples/.eslintrc.js` was a standalone config that didn't
    // inherit the base, so prettier, quotes, and no-console were never
    // enforced on example code. Preserve that behavior to keep this PR scoped
    // to the ESLint 10 migration; tightening up examples is its own change.
    rules: {
      'yet-another-license-header/header': 'off',
      'prettier/prettier': 'off',
      'no-console': 'off',
      'no-unused-vars': 'off',
      quotes: 'off',
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
    files: [
      'experimental/packages/shim-opencensus/src/OpenCensusMetricProducer.ts',
    ],
    rules: {
      'yet-another-license-header/header': 'off',
    },
  }
);
