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

/*
 * The ISC License
 *
 * Copyright (c) Isaac Z. Schlueter and Contributors
 *
 * Permission to use, copy, modify, and/or distribute this software for any
 * purpose with or without fee is hereby granted, provided that the above
 * copyright notice and this permission notice appear in all copies.
 *
 * THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
 * WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
 * MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
 * ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
 * WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
 * ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF OR
 * IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
 */

// Imported from https://github.com/npm/node-semver/blob/868d4bbe3d318c52544f38d5f9977a1103e924c2/test/fixtures/range-include.js

module.exports = [
  ['1.0.0 - 2.0.0', '1.2.3'],
  ['^1.2.3+build', '1.2.3'],
  ['^1.2.3+build', '1.3.0'],
  ['1.2.3-pre+asdf - 2.4.3-pre+asdf', '1.2.3'],
  //['1.2.3pre+asdf - 2.4.3-pre+asdf', '1.2.3', true],
  //['1.2.3-pre+asdf - 2.4.3pre+asdf', '1.2.3', true],
  //['1.2.3pre+asdf - 2.4.3pre+asdf', '1.2.3', true],
  // 'true' option and syntax are not supported (there must be '-' before pre-release tag),
  ['1.2.3-pre+asdf - 2.4.3-pre+asdf', '1.2.3'],
  ['1.2.3-pre+asdf - 2.4.3-pre+asdf', '1.2.3-pre.2'],
  ['1.2.3-pre+asdf - 2.4.3-pre+asdf', '2.4.3-alpha'],
  ['1.2.3+asdf - 2.4.3+asdf', '1.2.3'],
  ['1.0.0', '1.0.0'],
  ['>=*', '0.2.4'],
  ['', '1.0.0'],
  ['*', '1.2.3', {}],
  //['*', 'v1.2.3', { loose: 123 }],
  // 'loose' option is not supported, so test with this:
  ['*', 'v1.2.3'],
  ['>=1.0.0', '1.0.0', /asdf/],
  //['>=1.0.0', '1.0.1', { loose: null }],
  // 'loose' option is not supported, so test with this:
  ['>=1.0.0', '1.0.1'],
  //['>=1.0.0', '1.1.0', { loose: 0 }],
  // 'loose' option is not supported, so test with this:
  ['>=1.0.0', '1.1.0'],
  //['>1.0.0', '1.0.1', { loose: undefined }],
  // 'loose' option is not supported, so test with this:
  ['>1.0.0', '1.0.1'],
  ['>1.0.0', '1.1.0'],
  ['<=2.0.0', '2.0.0'],
  ['<=2.0.0', '1.9999.9999'],
  ['<=2.0.0', '0.2.9'],
  ['<2.0.0', '1.9999.9999'],
  ['<2.0.0', '0.2.9'],
  ['>= 1.0.0', '1.0.0'],
  ['>=  1.0.0', '1.0.1'],
  ['>=   1.0.0', '1.1.0'],
  ['> 1.0.0', '1.0.1'],
  ['>  1.0.0', '1.1.0'],
  ['<=   2.0.0', '2.0.0'],
  ['<= 2.0.0', '1.9999.9999'],
  ['<=  2.0.0', '0.2.9'],
  ['<    2.0.0', '1.9999.9999'],
  ['<\t2.0.0', '0.2.9'],
  //['>=0.1.97', 'v0.1.97', true],
  // 'true' option is not supported, so test with this:
  ['>=0.1.97', 'v0.1.97'],
  ['>=0.1.97', '0.1.97'],
  ['0.1.20 || 1.2.4', '1.2.4'],
  ['>=0.2.3 || <0.0.1', '0.0.0'],
  ['>=0.2.3 || <0.0.1', '0.2.3'],
  ['>=0.2.3 || <0.0.1', '0.2.4'],
  ['||', '1.3.4'],
  ['2.x.x', '2.1.3'],
  ['1.2.x', '1.2.3'],
  ['1.2.x || 2.x', '2.1.3'],
  ['1.2.x || 2.x', '1.2.3'],
  ['x', '1.2.3'],
  ['2.*.*', '2.1.3'],
  ['1.2.*', '1.2.3'],
  ['1.2.* || 2.*', '2.1.3'],
  ['1.2.* || 2.*', '1.2.3'],
  ['*', '1.2.3'],
  ['2', '2.1.2'],
  ['2.3', '2.3.1'],
  ['~0.0.1', '0.0.1'],
  ['~0.0.1', '0.0.2'],
  ['~x', '0.0.9'],
  ['~2', '2.0.9'],
  ['~2.4', '2.4.0'],
  ['~2.4', '2.4.5'],
  ['~>3.2.1', '3.2.2'],
  ['~1', '1.2.3'],
  ['~>1', '1.2.3'],
  ['~> 1', '1.2.3'],
  ['~1.0', '1.0.2'],
  ['~ 1.0', '1.0.2'],
  ['~ 1.0.3', '1.0.12'],
  //['~ 1.0.3alpha', '1.0.12', { loose: true }],
  // 'true' option and syntax are not supported (there must be '-' before pre-release tag), so test with this:
  ['~ 1.0.3-alpha', '1.0.12'],
  ['>=1', '1.0.0'],
  ['>= 1', '1.0.0'],
  ['<1.2', '1.1.1'],
  ['< 1.2', '1.1.1'],
  ['~v0.5.4-pre', '0.5.5'],
  ['~v0.5.4-pre', '0.5.4'],
  ['=0.7.x', '0.7.2'],
  ['<=0.7.x', '0.7.2'],
  ['>=0.7.x', '0.7.2'],
  ['<=0.7.x', '0.6.2'],
  ['~1.2.1 >=1.2.3', '1.2.3'],
  ['~1.2.1 =1.2.3', '1.2.3'],
  ['~1.2.1 1.2.3', '1.2.3'],
  ['~1.2.1 >=1.2.3 1.2.3', '1.2.3'],
  ['~1.2.1 1.2.3 >=1.2.3', '1.2.3'],
  ['>=1.2.1 1.2.3', '1.2.3'],
  ['1.2.3 >=1.2.1', '1.2.3'],
  ['>=1.2.3 >=1.2.1', '1.2.3'],
  ['>=1.2.1 >=1.2.3', '1.2.3'],
  ['>=1.2', '1.2.8'],
  ['^1.2.3', '1.8.1'],
  ['^0.1.2', '0.1.2'],
  ['^0.1', '0.1.2'],
  ['^0.0.1', '0.0.1'],
  ['^1.2', '1.4.2'],
  ['^1.2 ^1', '1.4.2'],
  ['^1.2.3-alpha', '1.2.3-pre'],
  ['^1.2.0-alpha', '1.2.0-pre'],
  ['^0.0.1-alpha', '0.0.1-beta'],
  ['^0.0.1-alpha', '0.0.1'],
  ['^0.1.1-alpha', '0.1.1-beta'],
  ['^x', '1.2.3'],
  ['x - 1.0.0', '0.9.7'],
  ['x - 1.x', '0.9.7'],
  ['1.0.0 - x', '1.9.7'],
  ['1.x - x', '1.9.7'],
  ['<=7.x', '7.9.9'],
  ['2.x', '2.0.0-pre.0', { includePrerelease: true }],
  ['2.x', '2.1.0-pre.0', { includePrerelease: true }],
  ['1.1.x', '1.1.0-a', { includePrerelease: true }],
  ['1.1.x', '1.1.1-a', { includePrerelease: true }],
  ['*', '1.0.0-rc1', { includePrerelease: true }],
  ['^1.0.0-0', '1.0.1-rc1', { includePrerelease: true }],
  ['^1.0.0-rc2', '1.0.1-rc1', { includePrerelease: true }],
  ['^1.0.0', '1.0.1-rc1', { includePrerelease: true }],
  ['^1.0.0', '1.1.0-rc1', { includePrerelease: true }],
  ['1 - 2', '2.0.0-pre', { includePrerelease: true }],
  ['1 - 2', '1.0.0-pre', { includePrerelease: true }],
  ['1.0 - 2', '1.0.0-pre', { includePrerelease: true }],

  ['=0.7.x', '0.7.0-asdf', { includePrerelease: true }],
  ['>=0.7.x', '0.7.0-asdf', { includePrerelease: true }],
  ['<=0.7.x', '0.7.0-asdf', { includePrerelease: true }],

  ['>=1.0.0 <=1.1.0', '1.1.0-pre', { includePrerelease: true }],
];
