# OpenTelemetry Browser Detector

> [!NOTE]
> `@opentelemetry/opentelemetry-browser-detector` is deprecated.
> Vendors and users should plan moving to [the browser detector being developed in the opentelemetry-browser repository](https://github.com/open-telemetry/opentelemetry-browser/tree/main/packages/sdk#browser-resource-detection),
> specifically `@opentelemetry/browser-sdk/browser-detector`.

This module provides detector for browser environments

## Installation

```bash
npm install --save @opentelemetry/opentelemetry-browser-detector
```

## Usage

```js
import { context, trace } from '@opentelemetry/api';
import { TracerProvider } from '@opentelemetry/trace-sdk';
import { ZoneContextManager } = from '@opentelemetry/context-zone';
import { resourceFromAttributes, detectResources } from '@opentelemetry/resources';
import { ATTR_SERVICE_NAME } from '@opentelemetry/semantic-conventions';
import { browserDetector } from '@opentelemetry/opentelemetry-browser-detector';

async function start(){
  let resource = resourceFromAttributes({
    [ATTR_SERVICE_NAME]: 'Test App Name',
  });
  let detectedResources = await detectResources({detectors:[browserDetector]});
  resource = resource.merge(detectedResources);
  const provider = new TracerProvider({
    resource,
    spanProcessors: [
      new BatchSpanProcessor(
        new OTLPTraceExporter({ url:CONF.url, headers: {} }),
        {
          exportTimeoutMillis: CONF.timeOutMillis,
          scheduledDelayMillis:CONF.delayMillis
        }
      )
    ]
  });

  // Changing default contextManager to use ZoneContextManager - supports asynchronous operations - optional
  context.setGlobalContextManager(new ZoneContextManager().enable());
  trace.setGlobalTracerProvider(provider);

  // Registering instrumentations
  registerInstrumentations({
    instrumentations: [
      new DocumentLoadInstrumentation(),
      new XMLHttpRequestInstrumentation(),
      new FetchInstrumentation(),
    ],
  });
}


start().then(()=> console.log("Instrumentation started"));

```

The browser identification attributes will be added to the resource spans when traces are created.
These attributes include platform, brands, mobile, language if the browser supports
the userAgentData api, otherwise it will contain only the user_agent information
