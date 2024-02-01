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
import {
  AggregationTemporality,
  AggregationTemporalitySelector,
  InstrumentType,
} from '@opentelemetry/sdk-metrics';
import * as sinon from 'sinon';
import * as assert from 'assert';
import { IOLTPExportDelegate } from '@opentelemetry/otlp-exporter-base';
import { createOtlpMetricsExporter } from '../../src';
import { resourceMetrics } from './fixtures/resource-metrics';

describe('createOtlpMetricsExporter', function () {
  beforeEach(() => {
    sinon.restore();
  });

  it('calls shutdown on delegate', async () => {
    const exportDelegateStubs = {
      export: sinon.stub(),
      shutdown: sinon.stub().returns(Promise.resolve()),
      forceFlush: sinon.stub(),
    };
    const mockExportDelegate = exportDelegateStubs as IOLTPExportDelegate<any>;

    const temporalitySelectorStub = sinon.stub();
    const temporalitySelector =
      temporalitySelectorStub as AggregationTemporalitySelector;

    const exporter = createOtlpMetricsExporter(
      mockExportDelegate,
      temporalitySelector
    );

    await exporter.shutdown();

    sinon.assert.calledOnce(exportDelegateStubs.shutdown);
  });

  it('calls forceFlush on delegate', async () => {
    const exportDelegateStubs = {
      export: sinon.stub(),
      shutdown: sinon.stub().returns(Promise.resolve()),
      forceFlush: sinon.stub(),
    };
    const mockExportDelegate = exportDelegateStubs as IOLTPExportDelegate<any>;

    const temporalitySelectorStub = sinon.stub();
    const temporalitySelector =
      temporalitySelectorStub as AggregationTemporalitySelector;

    const exporter = createOtlpMetricsExporter(
      mockExportDelegate,
      temporalitySelector
    );

    await exporter.forceFlush();

    sinon.assert.calledOnce(exportDelegateStubs.forceFlush);
  });

  it('calls export on delegate', () => {
    const exportDelegateStubs = {
      export: sinon.stub(),
      shutdown: sinon.stub().returns(Promise.resolve()),
      forceFlush: sinon.stub(),
    };
    const mockExportDelegate = exportDelegateStubs as IOLTPExportDelegate<any>;

    const temporalitySelectorStub = sinon.stub();
    const temporalitySelector =
      temporalitySelectorStub as AggregationTemporalitySelector;

    const exporter = createOtlpMetricsExporter(
      mockExportDelegate,
      temporalitySelector
    );

    exporter.export(resourceMetrics, () => {});

    sinon.assert.calledOnce(exportDelegateStubs.export);
  });

  it('calls temporality selector', () => {
    const exportDelegateStubs = {
      export: sinon.stub(),
      shutdown: sinon.stub().returns(Promise.resolve()),
      forceFlush: sinon.stub(),
    };
    const mockExportDelegate = exportDelegateStubs as IOLTPExportDelegate<any>;

    const temporalitySelectorStub = sinon
      .stub()
      .returns(AggregationTemporality.DELTA);
    const temporalitySelector =
      temporalitySelectorStub as AggregationTemporalitySelector;

    const exporter = createOtlpMetricsExporter(
      mockExportDelegate,
      temporalitySelector
    );

    const temporality = exporter.selectAggregationTemporality?.(
      InstrumentType.HISTOGRAM
    );

    assert.strictEqual(temporality, AggregationTemporality.DELTA);
    sinon.assert.calledOnceWithExactly(
      temporalitySelectorStub,
      InstrumentType.HISTOGRAM
    );
  });
});
