# OpenTelemetry Browser Detector

**Note: This is an experimental package under active development. New releases may include breaking changes.**

This module provides detector for browser environments

## Installation

```bash
npm install --save @opentelemetry/opentelemetry-browser-detector
```

## Usage

```js
import { resourceFromAttributes, detectResources } from '@opentelemetry/resources';
import { ATTR_SERVICE_NAME } from '@opentelemetry/semantic-conventions';
import { browserDetector } from '@opentelemetry/opentelemetry-browser-detector';

async function start(){
  let resource = resourceFromAttributes({
    [ATTR_SERVICE_NAME]: 'Test App Name',
  });
  let detectedResources= await detectResources({detectors:[browserDetector]});
  resource=resource.merge(detectedResources);
  const provider = new WebTracerProvider({
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

  provider.register({
    // Changing default contextManager to use ZoneContextManager - supports asynchronous operations - optional
    contextManager: new ZoneContextManager(),
  });

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
