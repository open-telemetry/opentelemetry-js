/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import * as assert from 'assert';
import * as sinon from 'sinon';
import { diag } from '@opentelemetry/api';
import { InstrumentationNodeModuleFile } from '../../src/platform/browser';

describe('InstrumentationNodeModuleFile (browser)', function () {
  afterEach(function () {
    sinon.restore();
  });

  it('keeps the name unchanged and warns', function () {
    const warn = sinon.stub(diag, 'warn');
    const patch = () => {};
    const unpatch = () => {};
    const file = new InstrumentationNodeModuleFile(
      '/tmp/foo/../bar',
      ['^1.0.0'],
      patch,
      unpatch
    );

    assert.strictEqual(file.name, '/tmp/foo/../bar');
    assert.deepStrictEqual(file.supportedVersions, ['^1.0.0']);
    assert.strictEqual(file.patch, patch);
    assert.strictEqual(file.unpatch, unpatch);
    sinon.assert.calledOnce(warn);
  });
});
