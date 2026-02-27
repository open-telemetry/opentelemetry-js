module.exports = {
  ignorePatterns: ['tsdown.config.ts'],
  plugins: [
    "@typescript-eslint",
    "header",
    "n",
    "prettier"
  ],
  extends: ["eslint:recommended", "plugin:prettier/recommended"],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    "project": null,
  },
  rules: {
    "quotes": ["error", "single", { "avoidEscape": true }],
    "eqeqeq": [
      "error",
      "smart"
    ],
    "prefer-rest-params": "off",
    "no-console": "error",
    "no-shadow": "off",
    "n/no-deprecated-api": ["warn"],
    "header/header": ["error", "block", [{
      pattern: / \* Copyright The OpenTelemetry Authors[\r\n]+ \* SPDX-License-Identifier: Apache-2\.0/,
      template: `\n * Copyright The OpenTelemetry Authors\n * SPDX-License-Identifier: Apache-2.0\n `
    }]]
  },
  overrides: [
    {
      files: ['*.ts'],
      // Enable typescript-eslint for ts files.
      extends: ["eslint:recommended", "plugin:@typescript-eslint/recommended", "plugin:prettier/recommended"],
      parserOptions: {
        "projectService": true
      },
      rules: {
        "@typescript-eslint/no-floating-promises": "error",
        "@typescript-eslint/no-this-alias": "off",
        "@typescript-eslint/naming-convention": [
          "error",
          {
            "selector": "memberLike",
            "modifiers": ["private", "protected"],
            "format": ["camelCase"],
            "leadingUnderscore": "require"
          }
        ],
        "@typescript-eslint/no-unused-vars": ["error", {"argsIgnorePattern": "^_", "args": "after-used"}],
        "@typescript-eslint/no-inferrable-types": ["error", { ignoreProperties: true }],
        "@typescript-eslint/no-empty-function": ["off"],
        "@typescript-eslint/no-unsafe-function-type": ["warn"],
        "@typescript-eslint/no-shadow": ["warn"],
        "@typescript-eslint/parameter-properties": "error",
        "no-restricted-syntax": ["error", "ExportAllDeclaration"],
        "prefer-rest-params": "off",
      }
    },
    {
      files: ["test/**/*.ts"],
      // Enable typescript-eslint for ts files.
      extends: ["eslint:recommended", "plugin:@typescript-eslint/recommended", "plugin:prettier/recommended"],
      parserOptions: {
        "projectService": true
      },
      rules: {
        "no-console": "warn",
        "no-empty": "off",
        "@typescript-eslint/ban-ts-ignore": "off",
        "@typescript-eslint/no-unsafe-function-type": ["warn"],
        "@typescript-eslint/no-empty-function": "off",
        "@typescript-eslint/no-explicit-any": "off",
        "@typescript-eslint/no-unused-vars": "off",
        "@typescript-eslint/no-require-imports": "off",
        "@typescript-eslint/no-shadow": ["off"],
        "@typescript-eslint/no-floating-promises": ["off"],
        "@typescript-eslint/no-non-null-assertion": ["off"],
        "@typescript-eslint/explicit-module-boundary-types": ["off"],
        "prefer-rest-params": "off",
      }
    }
  ]
};
