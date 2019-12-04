import { ConsoleSpanExporter, SimpleSpanProcessor } from '@opentelemetry/tracing';
import { WebTracer } from '@opentelemetry/web';
import { DocumentLoad } from '@opentelemetry/plugin-document-load';
import { ZoneScopeManager } from '@opentelemetry/scope-zone';
import { CollectorExporter } from '@opentelemetry/exporter-collector'

const webTracer = new WebTracer({
  plugins: [
    new DocumentLoad()
  ]
});
webTracer.addSpanProcessor(new SimpleSpanProcessor(new ConsoleSpanExporter()));

const webTracerWithZone = new WebTracer({
  scopeManager: new ZoneScopeManager(),
  plugins: [
    new DocumentLoad()
  ]
});
webTracerWithZone.addSpanProcessor(new SimpleSpanProcessor(new ConsoleSpanExporter()));
webTracerWithZone.addSpanProcessor(new SimpleSpanProcessor(new CollectorExporter()));

console.log('Current span is window', webTracerWithZone.getCurrentSpan() === window);

// example of keeping track of scope between async operations
const prepareClickEvent = () => {
  const url1 = 'https://raw.githubusercontent.com/open-telemetry/opentelemetry-js/master/package.json';
  const url2 = 'https://raw.githubusercontent.com/open-telemetry/opentelemetry-js/master/packages/opentelemetry-web/package.json';

  const element = document.getElementById('button1');
  let mainSpan = webTracerWithZone.startSpan('main-span');
  webTracerWithZone.bind(element, mainSpan);

  const onClick = () => {
    const span1 = webTracerWithZone.startSpan(`files-series-info-1`, {
      parent: webTracerWithZone.getCurrentSpan()
    });

    const span2 = webTracerWithZone.startSpan(`files-series-info-2`, {
      parent: webTracerWithZone.getCurrentSpan()
    });

    webTracerWithZone.withSpan(span1, () => {
      getData(url1).then((data) => {
        console.log('current span is span1', webTracerWithZone.getCurrentSpan() === span1);
        console.log('info from package.json', data.description, data.version);
        webTracerWithZone.getCurrentSpan().addEvent('fetching-span1-completed');
        span1.end();
      });
    });

    webTracerWithZone.withSpan(span2, () => {
      getData(url2).then((data) => {
        setTimeout(() => {
          console.log('current span is span2', webTracerWithZone.getCurrentSpan() === span2);
          console.log('info from package.json', data.description, data.version);
          webTracerWithZone.getCurrentSpan().addEvent('fetching-span2-completed');
          span2.end();
        }, 100);
      });
    });
  };
  element.addEventListener('click', onClick);
};

const getData = (url) => {
  return new Promise(async (resolve, reject) => {
    const req = new XMLHttpRequest();
    req.open('GET', url, true);
    req.send();
    req.onload = function () {
      let json;
      try {
        json = JSON.parse(req.responseText);
      } catch (e) {
        reject(e);
      }
      resolve(json);
    };
  });
};

window.addEventListener('load', () => {
  prepareClickEvent();
});
