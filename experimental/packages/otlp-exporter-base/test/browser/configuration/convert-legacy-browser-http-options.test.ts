/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import * as assert from 'assert';
import { convertLegacyBrowserHttpOptions } from '../../../src/configuration/convert-legacy-browser-http-options';
import { CompressionAlgorithm } from '../../../src';

describe('convertLegacyBrowserHttpOptions', function () {
  it('passes the compression option through', function () {
    const options = convertLegacyBrowserHttpOptions(
      { compression: CompressionAlgorithm.GZIP },
      'v1/traces',
      {}
    );

    assert.strictEqual(options.compression, 'gzip');
  });

  it('defaults compression to none', function () {
    const options = convertLegacyBrowserHttpOptions({}, 'v1/traces', {});

    assert.strictEqual(options.compression, 'none');
  });
});
