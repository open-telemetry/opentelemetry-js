/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import * as assert from 'assert';
import * as sinon from 'sinon';
import { ExportResult, ExportResultCode } from '../../../src';
import * as suppress from '../../../src/trace/suppress-tracing';
import { _export } from '../../../src/internal/exporter';

describe('exporter', () => {
  const sandbox = sinon.createSandbox();

  afterEach(() => {
    sandbox.restore();
  });

  class TestExporter {
    export(arg: any, resultCallback: (result: ExportResult) => void) {
      resultCallback({ code: ExportResultCode.SUCCESS });
    }
  }

  it('_export should suppress tracing', async () => {
    const suppressSpy = sandbox.spy(suppress, 'suppressTracing');
    const exporter = new TestExporter();
    const result = await _export(exporter, ['Test1']);
    assert.strictEqual(result.code, ExportResultCode.SUCCESS);
    assert.ok(suppressSpy.calledOnce);
  });
});
