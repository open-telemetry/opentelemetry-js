import { ConsoleSpanExporter, SimpleSpanProcessor } from '@opentelemetry/tracing';
import { WebTracerRegistry } from '@opentelemetry/web';
import { DocumentLoad } from '@opentelemetry/plugin-document-load';
import { ZoneScopeManager } from '@opentelemetry/scope-zone';
import { CollectorExporter } from '@opentelemetry/exporter-collector'

const registry = new WebTracerRegistry({
  plugins: [
    new DocumentLoad()
  ]
});
registry.addSpanProcessor(new SimpleSpanProcessor(new ConsoleSpanExporter()));

const registryWithZone = new WebTracerRegistry({
  scopeManager: new ZoneScopeManager(),
  plugins: [
    new DocumentLoad()
  ]
});
registryWithZone.addSpanProcessor(new SimpleSpanProcessor(new ConsoleSpanExporter()));
registryWithZone.addSpanProcessor(new SimpleSpanProcessor(new CollectorExporter()));

const tracerWithZone = registryWithZone.getTracer('example-tracer-web');
console.log('Current span is window', tracerWithZone.getCurrentSpan() === window);

// example of keeping track of scope between async operations
const prepareClickEvent = () => {
  const url1 = 'https://raw.githubusercontent.com/open-telemetry/opentelemetry-js/master/package.json';
  const url2 = 'https://raw.githubusercontent.com/open-telemetry/opentelemetry-js/master/packages/opentelemetry-web/package.json';

  const element = document.getElementById('button1');
  let mainSpan = tracerWithZone.startSpan('main-span');
  tracerWithZone.bind(element, mainSpan);

  const onClick = () => {
    const span1 = tracerWithZone.startSpan(`files-series-info-1`, {
      parent: tracerWithZone.getCurrentSpan()
    });

    const span2 = tracerWithZone.startSpan(`files-series-info-2`, {
      parent: tracerWithZone.getCurrentSpan()
    });

    tracerWithZone.withSpan(span1, () => {
      getData(url1).then((data) => {
        console.log('current span is span1', tracerWithZone.getCurrentSpan() === span1);
        console.log('info from package.json', data.description, data.version);
        tracerWithZone.getCurrentSpan().addEvent('fetching-span1-completed');
        span1.end();
      });
    });

    tracerWithZone.withSpan(span2, () => {
      getData(url2).then((data) => {
        setTimeout(() => {
          console.log('current span is span2', tracerWithZone.getCurrentSpan() === span2);
          console.log('info from package.json', data.description, data.version);
          tracerWithZone.getCurrentSpan().addEvent('fetching-span2-completed');
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

window.addEventListener('load', prepareClickEvent);
