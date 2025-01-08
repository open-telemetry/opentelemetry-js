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

module.exports = [
  ['1.0.0 - 2.0.0', '2.2.3'],
  ['1.2.3+asdf - 2.4.3+asdf', '1.2.3-pre.2'],
  ['1.2.3+asdf - 2.4.3+asdf', '2.4.3-alpha'],
  ['^1.2.3+build', '2.0.0'],
  ['^1.2.3+build', '1.2.0'],
  ['^1.2.3', '1.2.3-pre'],
  ['^1.2', '1.2.0-pre'],
  ['>1.2', '1.3.0-beta'],
  ['<=1.2.3', '1.2.3-beta'],
  ['^1.2.3', '1.2.3-beta'],
  ['=0.7.x', '0.7.0-asdf'],
  ['>=0.7.x', '0.7.0-asdf'],
  ['<=0.7.x', '0.7.0-asdf'],
  //['1', '1.0.0beta', { loose: 420 }],
  // 'loose' option and syntax are not supported (there must be '-' before pre-release tag), so test with this:
  ['1', '1.0.0-beta'],
  //['<1', '1.0.0beta', true],
  // 'true' option and syntax are not supported (there must be '-' before pre-release tag), so test with this:
  ['<1', '1.0.0-beta'],
  //['< 1', '1.0.0beta', true],
  // 'true' option and syntax are not supported (there must be '-' before pre-release tag), so test with this:
  ['< 1', '1.0.0-beta'],
  ['1.0.0', '1.0.1'],
  ['>=1.0.0', '0.0.0'],
  ['>=1.0.0', '0.0.1'],
  ['>=1.0.0', '0.1.0'],
  ['>1.0.0', '0.0.1'],
  ['>1.0.0', '0.1.0'],
  ['<=2.0.0', '3.0.0'],
  ['<=2.0.0', '2.9999.9999'],
  ['<=2.0.0', '2.2.9'],
  ['<2.0.0', '2.9999.9999'],
  ['<2.0.0', '2.2.9'],
  //['>=0.1.97', 'v0.1.93', true],
  // 'true' option is not supported, so test with this:
  ['>=0.1.97', 'v0.1.93'],
  ['>=0.1.97', '0.1.93'],
  ['0.1.20 || 1.2.4', '1.2.3'],
  ['>=0.2.3 || <0.0.1', '0.0.3'],
  ['>=0.2.3 || <0.0.1', '0.2.2'],
  //['2.x.x', '1.1.3', { loose: NaN }],
  // 'loose' option is not supported, so test with this:
  ['2.x.x', '1.1.3'],
  ['2.x.x', '1.1.3'],
  ['2.x.x', '3.1.3'],
  ['1.2.x', '1.3.3'],
  ['1.2.x || 2.x', '3.1.3'],
  ['1.2.x || 2.x', '1.1.3'],
  ['2.*.*', '1.1.3'],
  ['2.*.*', '3.1.3'],
  ['1.2.*', '1.3.3'],
  ['1.2.* || 2.*', '3.1.3'],
  ['1.2.* || 2.*', '1.1.3'],
  ['2', '1.1.2'],
  ['2.3', '2.4.1'],
  ['~0.0.1', '0.1.0-alpha'],
  ['~0.0.1', '0.1.0'],
  ['~2.4', '2.5.0'],
  ['~2.4', '2.3.9'],
  ['~>3.2.1', '3.3.2'],
  ['~>3.2.1', '3.2.0'],
  ['~1', '0.2.3'],
  ['~>1', '2.2.3'],
  ['~1.0', '1.1.0'],
  ['<1', '1.0.0'],
  ['>=1.2', '1.1.1'],
  //['1', '2.0.0beta', true],
  // 'true' option and syntax are not supported (there must be '-' before pre-release tag), so test with this:
  ['1', '2.0.0-beta'],
  ['~v0.5.4-beta', '0.5.4-alpha'],
  ['=0.7.x', '0.8.2'],
  ['>=0.7.x', '0.6.2'],
  ['<0.7.x', '0.7.2'],
  ['<1.2.3', '1.2.3-beta'],
  ['=1.2.3', '1.2.3-beta'],
  ['>1.2', '1.2.8'],
  ['^0.0.1', '0.0.2-alpha'],
  ['^0.0.1', '0.0.2'],
  ['^1.2.3', '2.0.0-alpha'],
  ['^1.2.3', '1.2.2'],
  ['^1.2', '1.1.9'],
  //['*', 'v1.2.3-foo', true],
  // 'true' option is not supported, so test with this:
  ['*', 'v1.2.3-foo'],

  // invalid versions never satisfy, but shouldn't throw
  ['*', 'not a version'],
  ['>=2', 'glorp'],
  ['>=2', false],

  ['2.x', '3.0.0-pre.0', { includePrerelease: true }],
  ['^1.0.0', '1.0.0-rc1', { includePrerelease: true }],
  ['^1.0.0', '2.0.0-rc1', { includePrerelease: true }],
  ['^1.2.3-rc2', '2.0.0', { includePrerelease: true }],
  ['^1.0.0', '2.0.0-rc1'],

  ['1 - 2', '3.0.0-pre', { includePrerelease: true }],
  ['1 - 2', '2.0.0-pre'],
  ['1 - 2', '1.0.0-pre'],
  ['1.0 - 2', '1.0.0-pre'],

  ['1.1.x', '1.0.0-a'],
  ['1.1.x', '1.1.0-a'],
  ['1.1.x', '1.2.0-a'],
  ['1.1.x', '1.2.0-a', { includePrerelease: true }],
  ['1.1.x', '1.0.0-a', { includePrerelease: true }],
  ['1.x', '1.0.0-a'],
  ['1.x', '1.1.0-a'],
  ['1.x', '1.2.0-a'],
  ['1.x', '0.0.0-a', { includePrerelease: true }],
  ['1.x', '2.0.0-a', { includePrerelease: true }],

  ['>=1.0.0 <1.1.0', '1.1.0'],
  ['>=1.0.0 <1.1.0', '1.1.0', { includePrerelease: true }],
  ['>=1.0.0 <1.1.0', '1.1.0-pre'],
  ['>=1.0.0 <1.1.0-pre', '1.1.0-pre'],

  //['== 1.0.0 || foo', '2.0.0', { loose: true }],
  // 'loose' option is not supported, so test with this:
  ['== 1.0.0 || foo', '2.0.0'],
];
