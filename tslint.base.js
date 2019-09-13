/* !
 * Copyright 2019, OpenTelemetry Authors
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

// Note the `file-header` TS lint rule implicitly adds comments around this, and
// makes the first comment line begin with /*!
// See:
// https://github.com/palantir/tslint/blob/b2972495e05710fa55600c233bf46a8a5c02e3cd/src/rules/fileHeaderRule.ts#L224
const fileHeaderTemplate = `Copyright YEAR_PLACEHOLDER, OpenTelemetry Authors

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

     https://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.`;

const fileHeaderRegexStr =
    fileHeaderTemplate
        .replace(/[\\\/^$.*+?()[\]{}|]/g, '\\$&')  // Escape regex
        .replace(/\n/g, '\n \\* ?')  // Per line space+asterisk, optional space
        .replace('YEAR_PLACEHOLDER', '2\\d{3}');

const fileHeaderDefault =
    fileHeaderTemplate.replace('YEAR_PLACEHOLDER', new Date().getFullYear());

const rules = {
  'file-header': [
    true,
    {
      'allow-single-line-comments': false,
      'match': fileHeaderRegexStr,
      'default': fileHeaderDefault,
    },
  ],
};

module.exports = {
  rules,
};
