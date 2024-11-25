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
import { createLoggingPartialSuccessResponseHandler } from '../../src/logging-response-handler';
import * as sinon from 'sinon';
import { IExportTraceServiceResponse } from '@opentelemetry/otlp-transformer';
import { registerMockDiagLogger } from './test-utils';

describe('loggingResponseHandler', function () {
  afterEach(function () {
    sinon.restore();
  });

  it('should diag warn if a partial success is passed', function () {
    // arrange
    const { warn } = registerMockDiagLogger();
    const handler =
      createLoggingPartialSuccessResponseHandler<IExportTraceServiceResponse>();
    const partialSuccessResponse: IExportTraceServiceResponse = {
      partialSuccess: {
        errorMessage: 'error',
        rejectedSpans: 10,
      },
    };

    // act
    handler.handleResponse(partialSuccessResponse);

    //assert
    sinon.assert.calledOnceWithExactly(
      warn,
      'Received Partial Success response:',
      JSON.stringify(partialSuccessResponse.partialSuccess)
    );
  });

  it('should not warn when a response is undefined', function () {
    // arrange
    const { warn } = registerMockDiagLogger();
    const handler = createLoggingPartialSuccessResponseHandler();

    // act
    handler.handleResponse(undefined);

    //assert
    sinon.assert.notCalled(warn);
  });

  it('should not warn when a response is defined but partialSuccess is undefined', function () {
    // arrange
    const { warn } = registerMockDiagLogger();
    const handler = createLoggingPartialSuccessResponseHandler();

    // act
    handler.handleResponse({ partialSuccess: undefined });

    //assert
    sinon.assert.notCalled(warn);
  });

  it('should not warn when a response is defined but partialSuccess is empty object', function () {
    // note: this is the common case for the OTel collector's OTLP receiver, client should treat is as full success
    // arrange
    const { warn } = registerMockDiagLogger();
    const handler = createLoggingPartialSuccessResponseHandler();
    const response = { partialSuccess: {} };

    // act
    handler.handleResponse(response);

    //assert
    sinon.assert.notCalled(warn);
  });
});
