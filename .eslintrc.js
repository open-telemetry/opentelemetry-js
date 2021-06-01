module.exports = {
    "env": {
        "mocha": true,
        "commonjs": true,
        "shared-node-browser": true
    },
    plugins: [
        "@typescript-eslint",
        "header"
    ],
    extends: [
        "./node_modules/gts",
    ],
    parser: "@typescript-eslint/parser",
    parserOptions: {
        "project": [
            "./tsconfig.json"
        ]
    },
    ignorePatterns: [
        'build',
    ],
    rules: {
        "@typescript-eslint/no-this-alias": "off",
        "eqeqeq": [
            "error",
            "smart"
        ],
        "prefer-rest-params": "off",
        "@typescript-eslint/naming-convention": [
            "error",
            {
                "selector": "memberLike",
                "modifiers": ["private", "protected"],
                "format": ["camelCase"],
                "leadingUnderscore": "require"
            }
        ],
        "@typescript-eslint/no-unused-vars": ["error", { "argsIgnorePattern": "^_", "args": "after-used" }],
        "@typescript-eslint/no-inferrable-types": ["error", { ignoreProperties: true }],
        "arrow-parens": ["error", "as-needed"],
        "prettier/prettier": ["error", { "singleQuote": true, "arrowParens": "avoid" }],
        "prefer-spread": "off",
        "node/no-deprecated-api": ["warn"],
        "header/header": [2, "block", [{
            pattern: / \* Copyright The OpenTelemetry Authors[\r\n]+ \*[\r\n]+ \* Licensed under the Apache License, Version 2\.0 \(the \"License\"\);[\r\n]+ \* you may not use this file except in compliance with the License\.[\r\n]+ \* You may obtain a copy of the License at[\r\n]+ \*[\r\n]+ \*      https:\/\/www\.apache\.org\/licenses\/LICENSE-2\.0[\r\n]+ \*[\r\n]+ \* Unless required by applicable law or agreed to in writing, software[\r\n]+ \* distributed under the License is distributed on an \"AS IS\" BASIS,[\r\n]+ \* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied\.[\r\n]+ \* See the License for the specific language governing permissions and[\r\n]+ \* limitations under the License\./gm,
            template:
                `\n * Copyright The OpenTelemetry Authors\n *\n * Licensed under the Apache License, Version 2.0 (the "License");\n * you may not use this file except in compliance with the License.\n * You may obtain a copy of the License at\n *\n *      https://www.apache.org/licenses/LICENSE-2.0\n *\n * Unless required by applicable law or agreed to in writing, software\n * distributed under the License is distributed on an "AS IS" BASIS,\n * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.\n * See the License for the specific language governing permissions and\n * limitations under the License.\n `
        }]]
    },
    overrides: [
        {
            "files": ["test/**/*.ts"],
            "rules": {
                "no-empty": "off",
                "@typescript-eslint/ban-ts-ignore": "off",
                "@typescript-eslint/no-empty-function": "off",
                "@typescript-eslint/no-explicit-any": "off",
                "@typescript-eslint/no-unused-vars": "off",
                "@typescript-eslint/no-var-requires": "off"
            }
        }
    ]
}
