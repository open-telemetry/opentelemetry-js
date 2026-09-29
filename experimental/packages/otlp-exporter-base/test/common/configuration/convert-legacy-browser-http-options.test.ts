/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import { diag } from '@opentelemetry/api';
import * as assert from 'assert';
import * as sinon from 'sinon';
import { convertLegacyBrowserHttpOptions } from '../../../src/configuration/convert-legacy-browser-http-options';
import { CompressionAlgorithm } from '../../../src/configuration/legacy-node-configuration';

describe('convertLegacyBrowserHttpOptions', function () {
  afterEach(function () {
    sinon.restore();
  });

  it('warns that gzip compression is ignored', function () {
    const warnStub = sinon.spy(diag, 'warn');
    convertLegacyBrowserHttpOptions(
      { compression: CompressionAlgorithm.GZIP },
      'v1/traces',
      {}
    );
    sinon.assert.calledOnce(warnStub);
    assert.match(String(warnStub.firstCall.args[0]), /"gzip" is not supported/);
  });

  it('does not warn without compression or with none', function () {
    const warnStub = sinon.spy(diag, 'warn');
    convertLegacyBrowserHttpOptions({}, 'v1/traces', {});
    convertLegacyBrowserHttpOptions(
      { compression: CompressionAlgorithm.NONE },
      'v1/traces',
      {}
    );
    sinon.assert.notCalled(warnStub);
  });
});
