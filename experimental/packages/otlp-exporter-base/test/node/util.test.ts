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
import { configureExporterTimeout, invalidTimeout } from '../../src/util';
import { sendWithHttp } from '../../src/platform/node/util';
import { CompressionAlgorithm} from '../../src/platform/node/types';
import { configureCompression} from '../../src/platform/node/util';
import { diag } from '@opentelemetry/api';
import * as sinon from 'sinon';

import { OTLPExporterNodeBase } from '../../src/platform/node/OTLPExporterNodeBase';
import { OTLPExporterNodeConfigBase } from '../../src/platform/node/types';
import { OTLPExporterError } from '../../src/types';
import { PassThrough } from 'stream';
import * as http from 'http';
import * as zlib from 'zlib';

// Meant to simulate http.IncomingMessage, at least the parts that sendWithHttp cares about
// but make it a PassThrough so we can inspect it for the test
class HttpResponse extends PassThrough {
  statusCode: number;
  statusMessage: string;

  constructor(statusCode = 200, statusMessage = 'OK') {
    super();
    this.statusCode = statusCode;
    this.statusMessage = statusMessage;
  }
}

// Meant to simulate http.ClientRequest, at least the parts that sendWithHttp cares about
// but make it a PassThrough so we can inspect it for the test
class HttpRequest extends PassThrough {
  setHeader(name: string, value: string) {}
}

// Barebones exporter for use by sendWithHttp
type ExporterConfig = OTLPExporterNodeConfigBase;
class Exporter extends OTLPExporterNodeBase<object,object> {
  getDefaultUrl(config: ExporterConfig): string {
    return config.url || '';
  }

  convert(spans: object[]): object {
    return {};
  }
}

describe('configureExporterTimeout', () => {
  const envSource = process.env;
  it('should use timeoutMillis parameter as export timeout value', () => {
    const exporterTimeout = configureExporterTimeout(9000);
    assert.strictEqual(exporterTimeout, 9000);
  });
  it('should use default trace export timeout env variable value when timeoutMillis parameter is undefined', () => {
    const exporterTimeout = configureExporterTimeout(undefined);
    assert.strictEqual(exporterTimeout, 10000);
  });
  it('should use default trace export timeout env variable value when timeoutMillis parameter is negative', () => {
    const exporterTimeout = configureExporterTimeout(-18000);
    assert.strictEqual(exporterTimeout, 10000);
  });
  it('should use trace export timeout value defined in env', () => {
    envSource.OTEL_EXPORTER_OTLP_TRACES_TIMEOUT = '15000';
    const exporterTimeout = configureExporterTimeout(undefined);
    assert.strictEqual(exporterTimeout, 15000);
    delete envSource.OTEL_EXPORTER_OTLP_TRACES_TIMEOUT;
  });
  it('should use default trace export timeout env variable value when trace export timeout value defined in env is negative', () => {
    envSource.OTEL_EXPORTER_OTLP_TRACES_TIMEOUT = '-15000';
    const exporterTimeout = configureExporterTimeout(undefined);
    assert.strictEqual(exporterTimeout, 10000);
    delete envSource.OTEL_EXPORTER_OTLP_TRACES_TIMEOUT;
  });
  it('should use default trace export timeout when timeoutMillis parameter is negative', () => {
    const exporterTimeout = configureExporterTimeout(-15000);
    assert.strictEqual(exporterTimeout, 10000);
  });
  it('should use timeoutMillis parameter over trace export timeout value defined in env', () => {
    envSource.OTEL_EXPORTER_OTLP_TRACES_TIMEOUT = '11000';
    const exporterTimeout = configureExporterTimeout(9000);
    assert.strictEqual(exporterTimeout, 9000);
    delete envSource.OTEL_EXPORTER_OTLP_TRACES_TIMEOUT;
  });
  it('should use default value when both timeoutMillis parameter and export timeout values defined in env are negative', () => {
    envSource.OTEL_EXPORTER_OTLP_TRACES_TIMEOUT = '-11000';
    envSource.OTEL_EXPORTER_OTLP_TIMEOUT = '-9000';
    const exporterTimeout = configureExporterTimeout(-5000);
    assert.strictEqual(exporterTimeout, 10000);
    delete envSource.OTEL_EXPORTER_OTLP_TRACES_TIMEOUT;
    delete envSource.OTEL_EXPORTER_OTLP_TIMEOUT;
  });
  it('should use default value export timeout value defined in env are negative', () => {
    envSource.OTEL_EXPORTER_OTLP_TRACES_TIMEOUT = '-11000';
    envSource.OTEL_EXPORTER_OTLP_TIMEOUT = '-9000';
    const exporterTimeout = configureExporterTimeout(undefined);
    assert.strictEqual(exporterTimeout, 10000);
    delete envSource.OTEL_EXPORTER_OTLP_TRACES_TIMEOUT;
    delete envSource.OTEL_EXPORTER_OTLP_TIMEOUT;
  });
  it('should warn user about invalid timeout', () => {
    const spyLoggerWarn = sinon.stub(diag, 'warn');
    configureExporterTimeout(-15000);
    const args = spyLoggerWarn.args[0];
    assert.strictEqual(args[0], 'Timeout must be greater than 0');
    assert.strictEqual(args[1], -15000);
    sinon.restore();
  });
});

describe('invalidTimeout', () => {
  it('should warn user about invalid timeout', () => {
    const spyLoggerWarn = sinon.stub(diag, 'warn');
    invalidTimeout(-9000, 10000);
    const args = spyLoggerWarn.args[0];
    assert.strictEqual(args[0], 'Timeout must be greater than 0');
    assert.strictEqual(args[1], -9000);
    sinon.restore();
  });
  it('diag warn was called', () => {
    const spyLoggerWarn = sinon.stub(diag, 'warn');
    invalidTimeout(-9000, 10000);
    assert(spyLoggerWarn.calledOnce);
    sinon.restore();
  });
  it('should return default timeout', () => {
    const defaultTimeout = invalidTimeout(-9000, 10000);
    assert.strictEqual(defaultTimeout, 10000);
  });
});

describe('configureCompression', () => {
  const envSource = process.env;
  it('should return none for compression', () => {
    const compression = CompressionAlgorithm.NONE;
    assert.strictEqual(configureCompression(compression), CompressionAlgorithm.NONE);
  });
  it('should return gzip compression defined via env', () => {
    envSource.OTEL_EXPORTER_OTLP_TRACES_COMPRESSION = 'gzip';
    assert.strictEqual(configureCompression(undefined),CompressionAlgorithm.GZIP);
    delete envSource.OTEL_EXPORTER_OTLP_TRACES_COMPRESSION;
  });
  it('should return none for compression defined via env', () => {
    envSource.OTEL_EXPORTER_OTLP_TRACES_COMPRESSION = 'none';
    assert.strictEqual(configureCompression(undefined),CompressionAlgorithm.NONE);
    delete envSource.OTEL_EXPORTER_OTLP_TRACES_COMPRESSION;
  });
  it('should return none for compression when no compression is set', () => {
    assert.strictEqual(configureCompression(undefined),CompressionAlgorithm.NONE);
  });
});

describe('sendWithHttp', () => {
  let exporter: Exporter;
  let httpRequestStub: sinon.SinonStub;
  let mockRequest: HttpRequest;
  let setHeaderSpy: sinon.SinonSpy;

  const spanData: object = {
    'foo': 'bar',
    'bar': 'baz',
  };

  beforeEach(() => {

    // Create stub of http.request (used by sendWithHttp)
    httpRequestStub = sinon.stub(http, 'request');

    // Mock out a request
    mockRequest = new HttpRequest();
    setHeaderSpy = sinon.spy(mockRequest, 'setHeader');

    // Mock out response
    const response = new HttpResponse();
    response.end('OK');

    // Stub out http.request so it calls our callback with the mocked response
    // and also so it returns our mocked request stream so we can observe. We don't
    // really care about the response for the purpose of this test, but we do want
    // to observe the request compression behavior.
    httpRequestStub.returns(mockRequest).callsArgWith(1, response);
  });

  afterEach(function() {
    httpRequestStub.restore();
    setHeaderSpy.restore();
  });

  it('should send with no compression if configured to do so', () => {
    exporter = new Exporter({
      url: 'http://foobar.com',
      compression: CompressionAlgorithm.NONE,
    });
    const data = JSON.stringify(spanData);

    // Show that data is written to the request stream
    let requestData = '';
    mockRequest.on('data', chunk => requestData += chunk);
    mockRequest.on('end', () => {
      assert.strictEqual(requestData, data);
    });

    sendWithHttp(exporter, data, 'application/json', () => {
      // Show that we aren't setting the gzip encoding header
      assert(setHeaderSpy.withArgs('Content-Encoding', 'gzip').notCalled);
    }, (err: OTLPExporterError) => {
      assert.fail(err);
    });
  });

  it('should send with gzip compression if configured to do so', () => {
    exporter = new Exporter({
      url: 'http://foobar.com',
      compression: CompressionAlgorithm.GZIP,
    });

    const data = JSON.stringify(spanData);
    const compressedData = zlib.gzipSync(Buffer.from(data));

    // Show that compressed data is written to the request stream
    const buffers: Buffer[] = [];
    mockRequest.on('data', chunk => buffers.push(Buffer.from(chunk)));
    mockRequest.on('end', () => {
      assert(Buffer.concat(buffers).equals(compressedData));
    });

    sendWithHttp(exporter, data, 'application/json', () => {
      // Show that we are setting the gzip encoding header
      assert(setHeaderSpy.withArgs('Content-Encoding', 'gzip').calledOnce);
    }, (err: OTLPExporterError) => {
      assert.fail(err);
    });
  });

  it('should work with gzip compression enabled even after multiple requests', () => {
    exporter = new Exporter({
      url: 'http://foobar.com',
      compression: CompressionAlgorithm.GZIP,
    });

    const data = JSON.stringify(spanData);
    const compressedData = zlib.gzipSync(Buffer.from(data));

    for (let i = 0; i < 5; i++) {
      mockRequest = new HttpRequest();
      setHeaderSpy.restore();
      setHeaderSpy = sinon.spy(mockRequest, 'setHeader');

      const response = new HttpResponse();
      response.end('OK');

      httpRequestStub.restore();
      httpRequestStub = sinon.stub(http, 'request');
      httpRequestStub.returns(mockRequest).callsArgWith(1, response);

      // Show that compressed data is written to the request stream
      const buffers: Buffer[] = [];
      mockRequest.on('data', chunk => buffers.push(Buffer.from(chunk)));
      mockRequest.on('end', () => {
        assert(Buffer.concat(buffers).equals(compressedData));
      });

      sendWithHttp(exporter, data, 'application/json', () => {
        // Show that we are setting the gzip encoding header
        assert(setHeaderSpy.withArgs('Content-Encoding', 'gzip').calledOnce);
      }, (err: OTLPExporterError) => {
        assert.fail(err);
      });
    }
  });
});
