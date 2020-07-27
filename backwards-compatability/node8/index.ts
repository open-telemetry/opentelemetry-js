import {NodeSDK, api} from '@opentelemetry/sdk-node';

const sdk = new NodeSDK();
sdk.start();

api.trace.getTracer('test');
