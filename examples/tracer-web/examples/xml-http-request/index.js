'use strict';

import { ConsoleSpanExporter, SimpleSpanProcessor } from '@opentelemetry/tracing';
import { WebTracer } from '@opentelemetry/web';
import { XMLHttpRequestPlugin } from '@opentelemetry/plugin-xml-http-request';
import { ZoneScopeManager } from '@opentelemetry/scope-zone';
import { CollectorExporter } from '@opentelemetry/exporter-collector';
import { B3Format } from '@opentelemetry/core';

const webTracerWithZone = new WebTracer({
  httpTextFormat: new B3Format(),
  scopeManager: new ZoneScopeManager(),
  plugins: [
    new XMLHttpRequestPlugin({
      ignoreUrls: [/localhost:8090\/sockjs-node/],
      propagateTraceHeaderCorsUrls: [
        'https://httpbin.org/get'
      ]
    })
  ]
});

webTracerWithZone.addSpanProcessor(new SimpleSpanProcessor(new ConsoleSpanExporter()));
webTracerWithZone.addSpanProcessor(new SimpleSpanProcessor(new CollectorExporter()));

// example of keeping track of scope between async operations
const prepareClickEvent = () => {
  const url1 = 'https://httpbin.org/get';

  const element = document.getElementById('button1');

  const onClick = () => {
    for (let i = 0, j = 5; i < j; i++) {
      const span1 = webTracerWithZone.startSpan(`files-series-info-${i}`, {
        parent: webTracerWithZone.getCurrentSpan()
      });
      webTracerWithZone.withSpan(span1, () => {
        getData(url1).then((data) => {
          webTracerWithZone.getCurrentSpan().addEvent('fetching-span1-completed');
          span1.end();
        });
      });
    }
  };
  element.addEventListener('click', onClick);
};

const getData = (url) => {
  return new Promise(async (resolve, reject) => {
    const req = new XMLHttpRequest();
    req.open('GET', url, true);
    req.setRequestHeader('Content-Type', 'application/json');
    req.setRequestHeader('Accept', 'application/json');
    req.send();
    req.onload = function () {
      resolve();
    };
  });
};

window.addEventListener('load', prepareClickEvent);
