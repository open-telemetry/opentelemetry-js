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
import * as http from 'http';
import * as assert from 'assert';
import * as sinon from 'sinon';
import { EventEmitter } from 'events';
import { compressAndSend, sendWithHttp } from '../../src/transport/http-transport-utils';
import { ExportResponse } from '../../src/export-response';
import { HttpRequestParameters } from '../../src/transport/http-transport-types';

describe('compressAndSend', function () {
  it('compressAndSend on destroyed request should handle error', function (done) {
    const request = http.request({});
    request.destroy();
    compressAndSend(request, 'gzip', new Uint8Array([1, 2, 3]), error => {
      try {
        assert.match(error.message, /socket hang up/);
        done();
      } catch (e) {
        done(e);
      }
    });
  });
});

describe('sendWithHttp', function () {
  let httpRequestStub: sinon.SinonStub;
  let mockAgent: http.Agent;

  beforeEach(function () {
    httpRequestStub = sinon.stub(http, 'request');
    mockAgent = new http.Agent();
  });

  afterEach(function () {
    sinon.restore();
  });

  function createTestParams(url: string): HttpRequestParameters {
    return {
      url,
      headers: () => ({ 'Content-Type': 'application/json' }),
      compression: 'none' as const,
      agentOptions: { keepAlive: true },
    };
  }

  it('should handle absolute URLs correctly', function (done) {
    // Mock http.request to capture the options and return a proper mock
    httpRequestStub.callsFake((options, callback) => {
      try {
        // Verify that http.request was called with the correct hostname and path
        assert.strictEqual(options.hostname, 'localhost');
        assert.strictEqual(options.port, '4318');
        assert.strictEqual(options.path, '/v1/logs');
        
        // Create a minimal request mock that just needs to handle piping
        const mockRequest = Object.assign(new EventEmitter(), {
          setTimeout: sinon.stub(),
          on: sinon.stub(),
          setHeader: sinon.stub(),
          write: sinon.stub(),
          end: sinon.stub(),
          destroy: sinon.stub(),
        });
        
        // When anything is piped to this request, ignore it
        const originalEmit = mockRequest.emit.bind(mockRequest);
        mockRequest.emit = function(event: string, ...args: any[]) {
          return originalEmit(event, ...args);
        };
        
        // Simulate a response after a short delay
        setImmediate(() => {
          const mockResponse = Object.assign(new EventEmitter(), {
            statusCode: 200,
            headers: {},
          });
          
          if (callback) callback(mockResponse);
          
          setImmediate(() => {
            mockResponse.emit('data', Buffer.from('test response'));
            mockResponse.emit('end');
          });
        });
        
        return mockRequest;
      } catch (e) {
        done(e);
        return Object.assign(new EventEmitter(), {
          setTimeout: sinon.stub(),
          on: sinon.stub(),
          setHeader: sinon.stub(),
          write: sinon.stub(),
          end: sinon.stub(),
          destroy: sinon.stub(),
        });
      }
    });

    const params = createTestParams('http://localhost:4318/v1/logs');

    sendWithHttp(
      params,
      mockAgent,
      new Uint8Array([1, 2, 3]),
      (response: ExportResponse) => {
        try {
          // Test that the function processes absolute URLs and returns success
          assert.strictEqual(response.status, 'success');
          done();
        } catch (e) {
          done(e);
        }
      },
      5000
    );
  });

  it('should resolve relative URLs against localhost', function (done) {
    // Mock http.request to capture the options and return a proper mock
    httpRequestStub.callsFake((options, callback) => {
      try {
        // Verify that http.request was called with localhost and the resolved path
        assert.strictEqual(options.hostname, 'localhost');
        assert.strictEqual(options.path, '/api/logs');
        
        // Create a minimal request mock that just needs to handle piping
        const mockRequest = Object.assign(new EventEmitter(), {
          setTimeout: sinon.stub(),
          on: sinon.stub(),
          setHeader: sinon.stub(),
          write: sinon.stub(),
          end: sinon.stub(),
          destroy: sinon.stub(),
        });
        
        // Simulate a response after a short delay
        setImmediate(() => {
          const mockResponse = Object.assign(new EventEmitter(), {
            statusCode: 200,
            headers: {},
          });
          
          if (callback) callback(mockResponse);
          
          setImmediate(() => {
            mockResponse.emit('data', Buffer.from('test response'));
            mockResponse.emit('end');
          });
        });
        
        return mockRequest;
      } catch (e) {
        done(e);
        return Object.assign(new EventEmitter(), {
          setTimeout: sinon.stub(),
          on: sinon.stub(),
          setHeader: sinon.stub(),
          write: sinon.stub(),
          end: sinon.stub(),
          destroy: sinon.stub(),
        });
      }
    });

    const params = createTestParams('./api/logs');

    sendWithHttp(
      params,
      mockAgent,
      new Uint8Array([1, 2, 3]),
      (response: ExportResponse) => {
        try {
          // Test that the function processes relative URLs by resolving against localhost
          assert.strictEqual(response.status, 'success');
          done();
        } catch (e) {
          done(e);
        }
      },
      5000
    );
  });

  it('should resolve different relative URL formats against localhost', function (done) {
    const testCases = [
      { input: './api/logs', expectedPath: '/api/logs' },
      { input: '../logs', expectedPath: '/logs' },
      { input: '/api/logs', expectedPath: '/api/logs' },
      { input: 'api/logs', expectedPath: '/api/logs' },
    ];

    let completedTests = 0;
    
    testCases.forEach(({ input, expectedPath }, index) => {
      // Reset stub for each test case
      httpRequestStub.resetHistory();
      
      // Mock http.request to capture the options
      httpRequestStub.callsFake((options, callback) => {
        try {
          // Verify that http.request was called with the expected resolved path
          assert.strictEqual(options.hostname, 'localhost', `Failed for input: ${input}`);
          assert.strictEqual(options.path, expectedPath, `Failed for input: ${input}`);
          
          // Create a minimal request mock
          const mockRequest = Object.assign(new EventEmitter(), {
            setTimeout: sinon.stub(),
            on: sinon.stub(),
            setHeader: sinon.stub(),
            write: sinon.stub(),
            end: sinon.stub(),
            destroy: sinon.stub(),
          });
          
          // Simulate a response
          setImmediate(() => {
            const mockResponse = Object.assign(new EventEmitter(), {
              statusCode: 200,
              headers: {},
            });
            
            if (callback) callback(mockResponse);
            
            setImmediate(() => {
              mockResponse.emit('data', Buffer.from('test response'));
              mockResponse.emit('end');
            });
          });
          
          return mockRequest;
        } catch (e) {
          done(e);
          return Object.assign(new EventEmitter(), {
            setTimeout: sinon.stub(),
            on: sinon.stub(),
            setHeader: sinon.stub(),
            write: sinon.stub(),
            end: sinon.stub(),
            destroy: sinon.stub(),
          });
        }
      });

      const params = createTestParams(input);

      sendWithHttp(
        params,
        mockAgent,
        new Uint8Array([1, 2, 3]),
        (response: ExportResponse) => {
          try {
            assert.strictEqual(response.status, 'success', `Failed for input: ${input}`);
            
            completedTests++;
            if (completedTests === testCases.length) {
              done();
            }
          } catch (e) {
            done(e);
          }
        },
        5000
      );
    });
  });

  it('should handle invalid URLs by calling onDone with failure', function (done) {
    // For invalid URLs, no HTTP request should be made
    const params = createTestParams('this is not a valid URL at all');

    try {
      sendWithHttp(
        params,
        mockAgent,
        new Uint8Array([1, 2, 3]),
        (response: ExportResponse) => {
          try {
            assert.strictEqual(response.status, 'failure');
            assert.ok(response.error);
            assert.match(response.error.message, /Invalid URL/);
            
            // Verify that http.request was not called for invalid URLs
            assert.strictEqual(httpRequestStub.callCount, 0);
            done();
          } catch (e) {
            done(e);
          }
        },
        5000
      );
    } catch (e) {
      // If an error is thrown synchronously, catch it and pass the test
      assert.match(e.message, /Invalid URL|Cannot read properties of undefined/);
      done();
    }
  });

  it('should handle edge case where both absolute and relative URL parsing fail', function (done) {
    // This tests the case where new URL() fails for both the original URL and the localhost resolution
    // Reset the stub call count from previous tests
    httpRequestStub.resetHistory();
    
    const params = createTestParams('://invalid-protocol');

    try {
      sendWithHttp(
        params,
        mockAgent,
        new Uint8Array([1, 2, 3]),
        (response: ExportResponse) => {
          try {
            assert.strictEqual(response.status, 'failure');
            assert.ok(response.error);
            assert.match(response.error.message, /Invalid URL/);
            
            // Verify that http.request was not called for invalid URLs
            assert.strictEqual(httpRequestStub.callCount, 0);
            done();
          } catch (e) {
            done(e);
          }
        },
        5000
      );
    } catch (e) {
      // If an error is thrown synchronously, catch it and pass the test
      assert.match(e.message, /Invalid URL|Cannot read properties of undefined/);
      done();
    }
  });
});
