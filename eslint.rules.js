module.exports = {
    "@typescript-eslint/no-this-alias": "off",
    "prefer-rest-params": "off",
    "no-empty": "off", // for tests folder
    "@typescript-eslint/no-empty-function": "off", // for tests folder
    "@typescript-eslint/no-explicit-any": "off", // for tests folder
    "@typescript-eslint/no-unused-vars": "off", // for tests folder
    "@typescript-eslint/naming-convention": [
        "error",
        {
          "selector": "memberLike",
          "modifiers": ["private", "protected"],
          "format": ["camelCase"],
          "leadingUnderscore": "require"
        }
    ],
    "header/header": [2, "block", [
      `\n * Copyright ${new Date().getFullYear()}, OpenTelemetry Authors\n *\n * Licensed under the Apache License, Version 2.0 (the "License");\n * you may not use this file except in compliance with the License.\n * You may obtain a copy of the License at\n *\n *      https://www.apache.org/licenses/LICENSE-2.0\n *\n * Unless required by applicable law or agreed to in writing, software\n * distributed under the License is distributed on an "AS IS" BASIS,\n * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.\n * See the License for the specific language governing permissions and\n * limitations under the License.\n `
    ]]
};