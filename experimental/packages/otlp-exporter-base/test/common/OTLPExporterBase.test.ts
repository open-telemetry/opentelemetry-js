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
import { IOtlpExportDelegate, OTLPExporterBase } from '../../src';

import * as sinon from 'sinon';

describe('OTLPExporterBase', function () {
  describe('shutdown', function () {
    it('calls delegate shutdown', async function () {
      // arrange
      const exportStub = sinon.stub();
      const forceFlushStub = sinon.stub();
      const shutdownStub = sinon.stub();
      const delegateStubs: IOtlpExportDelegate<string> = {
        export: exportStub,
        forceFlush: forceFlushStub,
        shutdown: shutdownStub,
      };
      const exporterBase = new OTLPExporterBase(delegateStubs);

      // act
      await exporterBase.shutdown();

      // assert
      sinon.assert.calledOnce(shutdownStub);
      // any extra calls on delegate should be handled by the delegate
      sinon.assert.notCalled(exportStub);
      sinon.assert.notCalled(forceFlushStub);
    });
  });

  describe('forceFlush', function () {
    it('calls delegate forceFlush', async function () {
      // arrange
      const exportStub = sinon.stub();
      const forceFlushStub = sinon.stub();
      const shutdownStub = sinon.stub();
      const delegateStubs: IOtlpExportDelegate<string> = {
        export: exportStub,
        forceFlush: forceFlushStub,
        shutdown: shutdownStub,
      };
      const exporterBase = new OTLPExporterBase(delegateStubs);

      // act
      await exporterBase.forceFlush();

      // assert
      sinon.assert.calledOnce(forceFlushStub);
      // any extra calls on delegate should be handled by the delegate
      sinon.assert.notCalled(exportStub);
      sinon.assert.notCalled(shutdownStub);
    });
  });

  describe('export', function () {
    it('calls delegate export', function () {
      // arrange
      const exportStub = sinon.stub();
      const forceFlushStub = sinon.stub();
      const shutdownStub = sinon.stub();
      const delegateStubs: IOtlpExportDelegate<string> = {
        export: exportStub,
        forceFlush: forceFlushStub,
        shutdown: shutdownStub,
      };
      const exporterBase = new OTLPExporterBase(delegateStubs);
      const expectedExportItem = 'sample-export-item';
      const expectedCallback = sinon.stub();

      // act
      exporterBase.export(expectedExportItem, expectedCallback);

      // assert
      sinon.assert.calledOnceWithExactly(
        exportStub,
        expectedExportItem,
        expectedCallback
      );
      // should not do anything with the callback, any interaction with it should happen on the delegate
      sinon.assert.notCalled(expectedCallback);
      // any extra calls on delegate should be handled by the delegate
      sinon.assert.notCalled(forceFlushStub);
      sinon.assert.notCalled(shutdownStub);
    });
  });
});
