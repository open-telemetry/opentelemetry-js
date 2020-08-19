import {NodeSDK, api} from '@opentelemetry/sdk-node';
import {ConsoleSpanExporter} from '@opentelemetry/tracing';

const sdk = new NodeSDK({
  traceExporter: new ConsoleSpanExporter(),
  autoDetectResources: false,
});
sdk.start();

api.trace.getTracer('test');
