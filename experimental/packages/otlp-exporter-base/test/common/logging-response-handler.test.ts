/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
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
