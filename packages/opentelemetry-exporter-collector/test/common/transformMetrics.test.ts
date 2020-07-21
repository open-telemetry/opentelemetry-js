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
import * as assert from 'assert';
import * as transform from '../../src/transformMetrics';
import {
  mockCounter,
  mockObserver,
  mockedResources,
  mockedInstrumentationLibraries,
  multiResourceMetrics,
  multiInstrumentationLibraryMetrics,
  ensureCounterIsCorrect,
  ensureObserverIsCorrect,
  mockHistogram,
  ensureHistogramIsCorrect,
  ensureValueRecorderIsCorrect,
  mockValueRecorder,
} from '../helper';
import { hrTimeToNanoseconds } from '@opentelemetry/core';
describe('transformMetrics', () => {
  describe('toCollectorMetric', () => {
    beforeEach(() => {
      // Counter
      mockCounter.aggregator.update(1);

      // Observer
      mockObserver.aggregator.update(10);

      // Histogram
      mockHistogram.aggregator.update(7);
      mockHistogram.aggregator.update(14);

      // ValueRecorder
      mockValueRecorder.aggregator.update(5);
    });

    afterEach(() => {
      mockCounter.aggregator.update(-1); // Reset counter
    });
    it('should convert metric', () => {
      ensureCounterIsCorrect(
        transform.toCollectorMetric(mockCounter, 1592602232694000000),
        hrTimeToNanoseconds(mockCounter.aggregator.toPoint().timestamp)
      );
      ensureObserverIsCorrect(
        transform.toCollectorMetric(mockObserver, 1592602232694000000),
        hrTimeToNanoseconds(mockObserver.aggregator.toPoint().timestamp)
      );
      ensureHistogramIsCorrect(
        transform.toCollectorMetric(mockHistogram, 1592602232694000000),
        hrTimeToNanoseconds(mockHistogram.aggregator.toPoint().timestamp)
      );

      ensureValueRecorderIsCorrect(
        transform.toCollectorMetric(mockValueRecorder, 1592602232694000000),
        hrTimeToNanoseconds(mockValueRecorder.aggregator.toPoint().timestamp)
      );
    });
  });
  describe('toCollectorMetricDescriptor', () => {
    describe('groupMetricsByResourceAndLibrary', () => {
      it('should group by resource', () => {
        const [resource1, resource2] = mockedResources;
        const [library] = mockedInstrumentationLibraries;
        const [metric1, metric2, metric3] = multiResourceMetrics;

        const expected = new Map([
          [resource1, new Map([[library, [metric1, metric3]]])],
          [resource2, new Map([[library, [metric2]]])],
        ]);

        const result = transform.groupMetricsByResourceAndLibrary(
          multiResourceMetrics
        );

        assert.deepStrictEqual(result, expected);
      });

      it('should group by instrumentation library', () => {
        const [resource] = mockedResources;
        const [lib1, lib2] = mockedInstrumentationLibraries;
        const [metric1, metric2, metric3] = multiInstrumentationLibraryMetrics;
        const expected = new Map([
          [
            resource,
            new Map([
              [lib1, [metric1, metric3]],
              [lib2, [metric2]],
            ]),
          ],
        ]);

        const result = transform.groupMetricsByResourceAndLibrary(
          multiInstrumentationLibraryMetrics
        );

        assert.deepStrictEqual(result, expected);
      });
    });
  });
});
