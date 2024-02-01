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

import * as sinon from 'sinon';
import { diag } from '@opentelemetry/api';
import { createMetricsPartialSuccessHandler } from '../../src';

describe('metrics partial success handler', function () {
  beforeEach(function () {
    sinon.restore();
  });
  it('does not log when response is empty', () => {
    const spyLoggerWarn = sinon.stub(diag, 'warn');
    const handler = createMetricsPartialSuccessHandler();

    handler.handleResponse({});
    handler.handleResponse({
      partialSuccess: {},
    });

    sinon.assert.notCalled(spyLoggerWarn);
  });

  it('does log when response has rejections', () => {
    const spyLoggerWarn = sinon.stub(diag, 'warn');
    const handler = createMetricsPartialSuccessHandler();

    handler.handleResponse({
      partialSuccess: {
        errorMessage: 'sample error',
        rejectedDataPoints: 42,
      },
    });

    sinon.assert.calledOnceWithExactly(
      spyLoggerWarn,
      'Export succeeded partially, rejected data points: 42, message:\nsample error'
    );
  });
});
