import { ConsoleSpanExporter, SimpleSpanProcessor } from '@opentelemetry/tracing';
import { WebTracer } from '@opentelemetry/web';
import { XMLHttpRequestPlugin } from '@opentelemetry/plugin-xml-http-request';
import { ZoneScopeManager } from '@opentelemetry/scope-zone';
import { CollectorExporter } from '@opentelemetry/exporter-collector';

const webTracerWithZone = new WebTracer({
  scopeManager: new ZoneScopeManager(),
  plugins: [
    new XMLHttpRequestPlugin({
      ignoreUrls: ['http://localhost:8090/sockjs-node/info'],
      propagateTraceHeaderUrls: [
        'http://localhost:8090'
      ]
    })
  ]
});

webTracerWithZone.addSpanProcessor(new SimpleSpanProcessor(new ConsoleSpanExporter()));
webTracerWithZone.addSpanProcessor(new SimpleSpanProcessor(new CollectorExporter()));

// example of keeping track of scope between async operations
const prepareClickEvent = () => {
  const url1 = 'http://localhost:8090/xml-http-request.js';

  const element = document.getElementById('button1');
  let mainSpan = webTracerWithZone.startSpan('main-span');
  webTracerWithZone.bind(element, mainSpan);

  const onClick = () => {
    const span1 = webTracerWithZone.startSpan(`files-series-info-1`, {
      parent: webTracerWithZone.getCurrentSpan()
    });

    webTracerWithZone.withSpan(span1, () => {
      getData(url1).then((data) => {
        webTracerWithZone.getCurrentSpan().addEvent('fetching-span1-completed');
        span1.end();
      });
    });

  };
  element.addEventListener('click', onClick);
};

const getData = (url) => {
  return new Promise(async (resolve, reject) => {
    const req = new XMLHttpRequest();
    req.open('GET', url, true);
    req.withCredentials = true;
    req.send();
    req.onload = function () {
      resolve();
    };
  });
};

window.addEventListener('load', () => {
  prepareClickEvent();
});
