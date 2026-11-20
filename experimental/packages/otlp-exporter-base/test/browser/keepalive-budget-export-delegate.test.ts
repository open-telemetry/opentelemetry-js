/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import * as sinon from 'sinon';
import * as assert from 'assert';
import { ExportResultCode } from '@opentelemetry/core';
import type { ISerializer } from '@opentelemetry/otlp-transformer';
import type { IOtlpExportDelegate } from '../../src/otlp-export-delegate';
import type { ExporterMetrics } from '../../src/ExporterMetrics';
import { createKeepaliveBudgetExportDelegate } from '../../src/platform/browser/keepalive-budget-export-delegate';
import { registerMockDiagLogger } from '../common/test-utils';

interface Item {
  id: number;
}

// 60KB is the max cumulative body size for keepalive
const BUDGET = 60 * 1024;
const BYTES_PER_ITEM = 1000;
const FITTING_ITEMS = Math.floor(BUDGET / BYTES_PER_ITEM);

const serializer: ISerializer<Item[], unknown> = {
  serializeRequest: items => new Uint8Array(items.length * BYTES_PER_ITEM),
  deserializeResponse: () => undefined,
};

function makeItems(count: number): Item[] {
  return Array.from({ length: count }, (_, id) => ({ id }));
}

function setVisibility(state: DocumentVisibilityState) {
  Object.defineProperty(document, 'visibilityState', {
    configurable: true,
    get: () => state,
  });
}

describe('KeepaliveBudgetExportDelegate', function () {
  let inner: {
    export: sinon.SinonStub;
    forceFlush: sinon.SinonStub;
    shutdown: sinon.SinonStub;
    setMetrics: sinon.SinonStub;
  };
  let finishExport: sinon.SinonStub;
  let metrics: { startExport: sinon.SinonStub };

  function create() {
    return createKeepaliveBudgetExportDelegate(
      inner as IOtlpExportDelegate<Item[]>,
      serializer,
      metrics as unknown as ExporterMetrics<Item[]>
    );
  }

  beforeEach(function () {
    inner = {
      export: sinon.stub(),
      forceFlush: sinon.stub().resolves(),
      shutdown: sinon.stub().resolves(),
      setMetrics: sinon.stub(),
    };
    finishExport = sinon.stub();
    metrics = { startExport: sinon.stub().returns(finishExport) };
    registerMockDiagLogger();
  });

  afterEach(function () {
    delete (document as { visibilityState?: unknown }).visibilityState;
    sinon.restore();
  });

  it('passes the batch through while the page is visible', function () {
    const items = makeItems(FITTING_ITEMS + 20);
    const callback = sinon.stub();

    create().export(items, callback);

    sinon.assert.calledOnceWithExactly(inner.export, items, callback);
    sinon.assert.notCalled(metrics.startExport);
  });

  it('passes a batch that fits the budget through while the page is hidden', function () {
    setVisibility('hidden');
    const items = makeItems(FITTING_ITEMS);
    const callback = sinon.stub();

    create().export(items, callback);

    sinon.assert.calledOnceWithExactly(inner.export, items, callback);
    sinon.assert.notCalled(metrics.startExport);
  });

  it('keeps whole items in input order up to the budget and counts the rest', function () {
    setVisibility('hidden');
    const items = makeItems(FITTING_ITEMS + 20);
    const callback = sinon.stub();

    create().export(items, callback);

    sinon.assert.calledOnce(inner.export);
    const sent = inner.export.firstCall.args[0] as Item[];
    assert.deepStrictEqual(sent, items.slice(0, FITTING_ITEMS));
    assert.strictEqual(inner.export.firstCall.args[1], callback);

    sinon.assert.calledOnce(metrics.startExport);
    assert.deepStrictEqual(
      metrics.startExport.firstCall.args[0],
      items.slice(FITTING_ITEMS)
    );
    const reason = finishExport.firstCall.args[0] as Error;
    assert.strictEqual(reason.name, 'keepalive_budget_exhausted');
  });

  it('fails the export and counts every item when no budget is left', function () {
    setVisibility('hidden');
    const spy = sinon.stub();
    const items = makeItems(3);
    const tiny: ISerializer<Item[], unknown> = {
      serializeRequest: () => new Uint8Array(BUDGET + 1),
      deserializeResponse: () => undefined,
    };

    createKeepaliveBudgetExportDelegate(
      inner as IOtlpExportDelegate<Item[]>,
      tiny,
      metrics as unknown as ExporterMetrics<Item[]>
    ).export(items, spy);

    sinon.assert.notCalled(inner.export);
    sinon.assert.calledWith(metrics.startExport, items);
    sinon.assert.calledOnce(spy);
    assert.strictEqual(spy.firstCall.args[0].code, ExportResultCode.FAILED);
  });

  it('warns about the dropped items', function () {
    setVisibility('hidden');
    const { warn } = registerMockDiagLogger();

    create().export(makeItems(FITTING_ITEMS + 20), sinon.stub());

    sinon.assert.calledWithMatch(warn, /dropping 20/);
  });

  it('does not partition a batch that is not a list of items', function () {
    setVisibility('hidden');
    const batch = { resourceMetrics: [] };
    const callback = sinon.stub();
    const delegate = createKeepaliveBudgetExportDelegate(
      inner as unknown as IOtlpExportDelegate<typeof batch>,
      {
        serializeRequest: () => new Uint8Array(BUDGET + 1),
        deserializeResponse: () => undefined,
      },
      metrics as unknown as ExporterMetrics<typeof batch>
    );

    delegate.export(batch, callback);

    sinon.assert.calledOnceWithExactly(inner.export, batch as never, callback);
  });

  it('forwards setMetrics, forceFlush and shutdown', async function () {
    const delegate = create();
    const other = {} as ExporterMetrics<Item[]>;

    delegate.setMetrics(other);
    await delegate.forceFlush();
    await delegate.shutdown();

    sinon.assert.calledWith(inner.setMetrics, other);
    sinon.assert.calledOnce(inner.forceFlush);
    sinon.assert.calledOnce(inner.shutdown);
  });
});
