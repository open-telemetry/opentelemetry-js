import {NodeSDK, api} from '@opentelemetry/sdk-node';
import {ConsoleSpanExporter} from '@opentelemetry/sdk-trace-base';

const sdk = new NodeSDK({
  traceExporter: new ConsoleSpanExporter(),
  autoDetectResources: false,
});
sdk.start();

api.trace.getTracer('test');
