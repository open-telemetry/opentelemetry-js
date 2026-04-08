/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import * as assert from 'assert';
import { vi } from 'vitest';
import { _export } from '../../../src/internal/exporter';
import type { ExportResult } from '../../../src/ExportResult';
import { ExportResultCode } from '../../../src/ExportResult';

// vi.hoisted ensures the spy is available when vi.mock's factory runs
// (vi.mock calls are hoisted to the top of the file).
const { suppressTracingSpy } = vi.hoisted(() => ({
  suppressTracingSpy: vi.fn<(fn: () => unknown) => unknown>(),
}));
// vi.spyOn cannot spy on frozen ESM namespace objects in browser mode,
// so we intercept suppressTracing via vi.mock instead.
vi.mock('../../../src/trace/suppress-tracing', async importOriginal => {
  const mod = await importOriginal<{
    suppressTracing: (fn: () => unknown) => unknown;
  }>();
  suppressTracingSpy.mockImplementation(fn => mod.suppressTracing(fn));
  return { ...mod, suppressTracing: suppressTracingSpy };
});

describe('exporter', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  class TestExporter {
    export(arg: string[], resultCallback: (result: ExportResult) => void) {
      resultCallback({ code: ExportResultCode.SUCCESS });
    }
  }

  it('_export should suppress tracing', async () => {
    const exporter = new TestExporter();
    const result = await _export(exporter, ['Test1']);
    assert.strictEqual(result.code, ExportResultCode.SUCCESS);
    assert.strictEqual(suppressTracingSpy.mock.calls.length, 1);
  });
});
