/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Test that usage of TypeScript *types* from the configuration package work
 * as expected.
 * This is done by using `tsc` to compile the `test/fixtures/types/*.ts` files.
 * `pass-*.ts` should succeed, `fail-*.ts` should fail.
 */

import * as assert from 'assert';
import { spawnSync } from 'child_process';

describe('types', function () {
  // Running `tsc` in the tests below can be slow in CI, especially on Windows.
  this.timeout(10000);

  it('should tsc compile test/fixtures/types/pass-*.ts files successfully', function () {
    const p = spawnSync(
      'npx',
      ['tsc', '-p', 'test/fixtures/types/tsconfig-pass.json'],
      {
        encoding: 'utf8',
        shell: true, // Use 'shell' so Windows can spawn `npx`.
      }
    );
    assert.strictEqual(p.status, 0);
  });

  it('should FAIL to tsc compile test/fixtures/types/fail-*.ts files', function () {
    const expectedErrs = [
      {
        file: 'fail-span-processor-non-object.ts',
        line: 9,
        msg: "error TS2322: Type 'number' is not assignable to type 'object'.",
      },
    ];

    const p = spawnSync(
      'npx',
      ['tsc', '-p', 'test/fixtures/types/tsconfig-fail.json'],
      {
        encoding: 'utf8',
        shell: true, // Use 'shell' so Windows can spawn `npx`.
      }
    );

    // Parse tsc error output to a structure to compare to `expectedErrs`. E.g.:
    //     test/fixtures/types/fail-2.ts(12,20): error TS2322: Type 'number' is not assignable to type 'object'.
    //     test/fixtures/types/fail-span-processor-non-object.ts(9,20): error TS2322: Type 'number' is not assignable to type 'object'.
    const ERR_RE = /^test\/fixtures\/types\/([^(]*)\((\d+),\d+\): (.*?)$/;
    const actualErrs = p.stdout
      .trim()
      .split(/\n/g)
      .filter(line => line.trim().length > 0)
      .map(line => {
        const match = ERR_RE.exec(line);
        if (!match) {
          throw new Error(
            `could not match 'tsc' output line: ${JSON.stringify(line)}`
          );
        }
        return { file: match[1], line: Number(match[2]), msg: match[3] };
      });

    assert.deepStrictEqual(actualErrs, expectedErrs);
    assert.ok(typeof p.status === 'number' && p.status !== 0);
  });
});
