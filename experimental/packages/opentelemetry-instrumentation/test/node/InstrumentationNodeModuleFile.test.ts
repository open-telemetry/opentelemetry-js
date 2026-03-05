/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import * as assert from 'assert';
import { normalize } from 'path';
import { InstrumentationNodeModuleFile } from '../../src';

describe('InstrumentationNodeModuleFile', function () {
  it('should convert path', function () {
    const tests = ['c:\\\\foo\\\\bar\\aa', '///home//foo/bar///aa'];
    tests.forEach(name => {
      const instrumentationNodeModuleFile = new InstrumentationNodeModuleFile(
        name,
        [],
        () => {},
        () => {}
      );
      assert.strictEqual(instrumentationNodeModuleFile.name, normalize(name));
    });
  });
});
