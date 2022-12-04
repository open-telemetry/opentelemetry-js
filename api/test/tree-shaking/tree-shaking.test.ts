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

import * as assert from 'assert';
import * as webpack from 'webpack';
import * as path from 'path';
import { Union } from 'unionfs';
import { fs as mfs } from 'memfs';
import * as realFs from 'fs';

/**
 * Verify that tree-shaking can be properly applied on the @opentelemetry/api package.
 * Unused optional apis should be able to be removed from the final bundle.
 */
describe('tree-shaking', () => {
  const allowedAPIs = ['ContextAPI', 'DiagAPI'];
  const testAPIs = [
    {
      name: 'MetricsAPI',
      export: 'metrics',
    },
    {
      name: 'PropagationAPI',
      export: 'propagation',
    },
    {
      name: 'TraceAPI',
      export: 'trace',
    },
  ];
  const APIMatcher = /(?:class|function) (\w+API)/g;

  const sourceCodePath = path.join(__dirname, 'test.js');
  const outputPath = path.join(__dirname, 'output');
  const outputFilename = path.join(outputPath, 'bundle.js');

  afterEach(() => {
    try {
      mfs.unlinkSync(outputFilename);
    } catch {
      /** ignore */
    }
  });

  for (const testAPI of testAPIs) {
    it(`verify ${testAPI.name}`, async () => {
      const sourceCode = `
        import { ${testAPI.export} } from '../../';
        console.log(${testAPI.export});
      `;
      mfs.mkdirpSync(path.dirname(sourceCodePath));
      mfs.writeFileSync(sourceCodePath, sourceCode, { encoding: 'utf8' });

      const compiler = webpack({
        entry: sourceCodePath,
        output: {
          filename: 'bundle.js',
          path: outputPath,
        },
        mode: 'production',
        optimization: {
          // disable minimization so that we can inspect the output easily.
          minimize: false,
          // disable module concatenation so that variable names will not be mangled.
          concatenateModules: false,
        },
      });

      const fs = new Union();
      fs.use(mfs as any).use(realFs);

      //direct webpack to use unionfs for file input
      compiler.inputFileSystem = fs;
      //direct webpack to output to memoryfs rather than to disk
      compiler.outputFileSystem = {
        ...mfs,
        join: path.join,
      } as any;

      const stats = await new Promise<webpack.Stats>((resolve, reject) => {
        compiler.run((err, stats) => {
          if (err) {
            return reject(err);
          }
          resolve(stats);
        });
      });
      assert.deepStrictEqual(stats.compilation.errors, []);
      assert.deepStrictEqual(stats.compilation.warnings, []);

      const outputFile = mfs.readFileSync(outputFilename, 'utf8') as string;
      const matches = new Set();
      let match;
      do {
        match = APIMatcher.exec(outputFile);
        if (match) {
          matches.add(match[1]);
        }
      } while (match);

      // Remove allowed apis from checking list.
      allowedAPIs.forEach(it => matches.delete(it));

      assert.deepStrictEqual(Array.from(matches), [testAPI.name]);
    });
  }
});
