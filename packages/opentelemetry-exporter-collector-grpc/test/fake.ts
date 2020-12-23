import * as protoLoader from '@grpc/proto-loader';
import { collectorTypes } from '@opentelemetry/exporter-collector';
import { ConsoleLogger, LogLevel } from '@opentelemetry/core';
import {
  BasicTracerProvider,
  SimpleSpanProcessor,
} from '@opentelemetry/tracing';

// import * as assert from 'assert';
import * as fs from 'fs';
import * as grpc from '@grpc/grpc-js';
import * as path from 'path';
import * as sinon from 'sinon';
import { CollectorTraceExporter } from '../src';

import {
  // ensureExportedSpanIsCorrect,
  // ensureMetadataIsCorrect,
  // ensureResourceIsCorrect,
  mockedReadableSpan,
} from './helper';

const traceServiceProtoPath =
  'opentelemetry/proto/collector/trace/v1/trace_service.proto';
const includeDirs = [path.resolve(__dirname, '../protos')];

const address = 'localhost:1501';

const metadata = new grpc.Metadata();
metadata.set('k', 'v');

let collectorExporter: CollectorTraceExporter;
let server: grpc.Server;
let exportedData:
  | collectorTypes.opentelemetryProto.trace.v1.ResourceSpans
  | undefined;
let reqMetadata: grpc.Metadata | undefined;

const setup = async () => {
  const params = {
    useTLS: false,
    metadata
  }
  server = new grpc.Server();
  const packageDefinition = await protoLoader.load(traceServiceProtoPath, {
    keepCase: false,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true,
    includeDirs,
  })
  const packageObject: any = grpc.loadPackageDefinition(
    packageDefinition
  );
  server.addService(
    packageObject.opentelemetry.proto.collector.trace.v1.TraceService
      .service,
    {
        Export: (data: {
          request: collectorTypes.opentelemetryProto.collector.trace.v1.ExportTraceServiceRequest;
          metadata: grpc.Metadata;
        }) => {
          try {
            console.log('try')
            exportedData = data.request.resourceSpans[0];
            reqMetadata = data.metadata;
            console.log('try ok')
          } catch (e) {
            console.log('catch')
            exportedData = undefined;
          }
        },
      }
  );
  const credentials = params.useTLS
    ? grpc.ServerCredentials.createSsl(
      fs.readFileSync('./test/certs/ca.crt'),
      [
        {
          cert_chain: fs.readFileSync('./test/certs/server.crt'),
          private_key: fs.readFileSync('./test/certs/server.key'),
        },
      ]
    )
    : grpc.ServerCredentials.createInsecure();
  await server.bindAsync(address, credentials, (err) => {
    if (err) {
      console.log('XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX')
      throw err
    }
    server.start();
  });

  // const credentials = params.useTLS
  //   ? grpc.credentials.createSsl(
  //     fs.readFileSync('./test/certs/ca.crt'),
  //     fs.readFileSync('./test/certs/client.key'),
  //     fs.readFileSync('./test/certs/client.crt')
  //   )
  //   : undefined;
  collectorExporter = new CollectorTraceExporter({
    serviceName: 'basic-service',
    url: address,
    // credentials,
    credentials: undefined,
    metadata: params.metadata,
  });

  const provider = new BasicTracerProvider();
  provider.addSpanProcessor(new SimpleSpanProcessor(collectorExporter));
}

const main =  async () => {
  await setup()
  const responseSpy = sinon.spy();
  const spans = [Object.assign({}, mockedReadableSpan)];
  await collectorExporter.export(spans, responseSpy);
  console.log('ok')
}

main()
