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

import * as child_process from 'child_process';
import * as assert from 'assert';
import * as path from 'path';
import * as fs from 'fs';
import { IAutoImports, getAutoImports } from './helpers/autoImports';

const rValues =
  /^\s*(Size|Loading time|Running time|Total time):[^\d]+([\d.]+\s*[\w]+).*$/gm;

const entryPoints = [
  {
    name: 'cjs',
    entry: './build/src/index.js',
  },
  {
    name: 'esm',
    entry: './build/esm/index.js',
  },
  {
    name: 'esnext',
    entry: './build/esnext/index.js',
  },
];

interface ISizeResult {
  raw?: string;
  size?: string;
  loadTime?: string;
  runTime?: string;
  totalTime?: string;
}

describe('size-limits', function () {
  const autoImports: IAutoImports = getAutoImports();
  const results: {
    [key: string]: {
      full?: ISizeResult | null;
      gzip?: ISizeResult | null;
      brotli?: ISizeResult | null;
    };
  } = {};
  const debugPath = path.resolve('./build/size-limit');

  this.timeout(60000);

  const _formatResults = (results?: ISizeResult | null): string => {
    let output = '';
    if (!results) {
      return 'N/A';
    }

    const keys: Array<keyof ISizeResult> = [
      'size',
      'loadTime',
      'runTime',
      'totalTime',
    ];
    keys.forEach(key => {
      output +=
        key.padEnd(8, '.') + ': ' + (results[key] || '').padEnd(12, ' ');
    });

    return output;
  };

  const checkSize = (
    name: string,
    filename: string,
    imports: string,
    gzip: boolean,
    brotli: boolean
  ): ISizeResult | null => {
    const filePath = path.resolve('.', '.size-limit.json');
    try {
      fs.writeFileSync(
        filePath,
        JSON.stringify([
          {
            path: filename,
            import: imports,
            name: name,
            gzip: gzip,
            brotli: brotli,
          },
        ])
      );

      assert.ok(true, 'running');
      const value = child_process.execSync(
        'size-limit --save-bundle build/size-limit/' + name + ' --clean-dir'
      );

      let output = value.toString();
      // remove screen escaping
      // eslint-disable-next-line no-control-regex
      output = output.replace(/\x1b\[\d+m/g, '');
      const result: ISizeResult = {};

      let matches: RegExpExecArray | null;
      while ((matches = rValues.exec(output)) && matches.length > 1) {
        switch (matches[1]) {
          case 'Size':
            result['size'] = matches[2];
            !result.raw && (result.raw = output);
            break;
          case 'Loading time':
            result['loadTime'] = matches[2];
            !result.raw && (result.raw = output);
            break;
          case 'Running time':
            result['runTime'] = matches[2];
            !result.raw && (result.raw = output);
            break;
          case 'Total time':
            result['totalTime'] = matches[2];
            !result.raw && (result.raw = output);
            break;
        }
      }

      assert.ok(
        result && result.size,
        'size not present - ' + JSON.stringify(result.size) + '[' + value + ']'
      );
      assert.ok(
        result && result.loadTime,
        'loading time not present - ' +
          JSON.stringify(result.loadTime) +
          '[' +
          value +
          ']'
      );
      assert.ok(
        result && result.runTime,
        'run time not present - ' +
          JSON.stringify(result.runTime) +
          '[' +
          value +
          ']'
      );
      assert.ok(
        result && result.totalTime,
        'total time not present - ' +
          JSON.stringify(result.totalTime) +
          '[' +
          value +
          ']'
      );
      //assert.ok(result && result.raw, "raw not present - " + JSON.stringify(result.raw) + "[" + value + "]");

      return Object.keys(result).length > 0 ? result : null;
    } finally {
      fs.unlinkSync(filePath);
    }
  };

  before(() => {
    if (!fs.existsSync(debugPath)) {
      fs.mkdirSync(debugPath, { recursive: true });
    }

    fs.writeFileSync(
      path.resolve(debugPath, 'autoImports.debug.txt'),
      autoImports.getDebug()
    );
  });

  after(() => {
    // Log Results to Console
    Object.keys(results).forEach(key => {
      // eslint-disable-next-line no-console
      console.log(
        key.padEnd(16, '.') +
          ': ' +
          JSON.stringify(
            {
              full: _formatResults(results[key].full),
              gzip: _formatResults(results[key].gzip),
              brotli: _formatResults(results[key].brotli),
            },
            null,
            2
          )
      );
    });

    // Generate CSV Results
    let csvResults =
      'Group,Full Size,Full Load Time,Full Run Time,Full Total Time,GZip Size,GZip Load Time,GZip Run Time,GZip Total Time,Brotli Size,Brotli Load Time,Brotli Run Time,Brotli Total Time\n';
    Object.keys(results).forEach(key => {
      csvResults +=
        key +
        ',' +
        results[key].full?.size +
        ',' +
        results[key].full?.loadTime +
        ',' +
        results[key].full?.runTime +
        ',' +
        results[key].full?.totalTime +
        ',' +
        results[key].gzip?.size +
        ',' +
        results[key].gzip?.loadTime +
        ',' +
        results[key].gzip?.runTime +
        ',' +
        results[key].gzip?.totalTime +
        ',' +
        results[key].brotli?.size +
        ',' +
        results[key].brotli?.loadTime +
        ',' +
        results[key].brotli?.runTime +
        ',' +
        results[key].brotli?.totalTime +
        '\n';
    });

    // eslint-disable-next-line no-console
    console.log(
      "Writing results to '" + path.resolve(debugPath, 'results.csv') + "'"
    );
    fs.writeFileSync(path.resolve(debugPath, 'results.csv'), csvResults);

    // Generate JSON Results for debugging
    // eslint-disable-next-line no-console
    console.log(
      "Writing results to '" + path.resolve(debugPath, 'results.json') + "'"
    );
    fs.writeFileSync(
      path.resolve(debugPath, 'results.json'),
      JSON.stringify(results, null, 2)
    );
  });

  entryPoints.forEach(entryPoint => {
    describe('Checking ' + entryPoint.name, function () {
      // eslint-disable-line no-undef
      autoImports.getGroups().forEach(group => {
        describe('Group ' + group, () => {
          // eslint-disable-line no-undef
          const checkResults: {
            full?: ISizeResult | null;
            gzip?: ISizeResult | null;
            brotli?: ISizeResult | null;
          } = {};

          before(() => {
            checkResults.full = checkSize(
              entryPoint.name + '-' + group,
              entryPoint.entry,
              autoImports.getImportGroup(group),
              false,
              false
            );
            checkResults.gzip = checkSize(
              entryPoint.name + '-' + group,
              entryPoint.entry,
              autoImports.getImportGroup(group),
              true,
              false
            );
            checkResults.brotli = checkSize(
              entryPoint.name + '-' + group,
              entryPoint.entry,
              autoImports.getImportGroup(group),
              false,
              true
            );
          });

          it(
            'Calculating ' +
              entryPoint.name +
              '-' +
              group +
              ' (' +
              autoImports.getGroupValues(group).length +
              ')',
            () => {
              assert.ok(
                checkResults.full,
                'full size found - ' + JSON.stringify(checkResults.full)
              );
              assert.ok(
                checkResults.gzip,
                'gZip size found - ' + JSON.stringify(checkResults.gzip)
              );
              assert.ok(
                checkResults.brotli,
                'brotli size found - ' + JSON.stringify(checkResults.brotli)
              );

              results[entryPoint.name + '-' + group] = checkResults;
            }
          );
        });
      });
    });
  });
});
