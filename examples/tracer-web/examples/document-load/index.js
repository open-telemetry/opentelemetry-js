import { ConsoleSpanExporter, SimpleSpanProcessor } from '@opentelemetry/tracing';
import { WebTracerProvider } from '@opentelemetry/web';
import { DocumentLoad } from '@opentelemetry/plugin-document-load';
import { ZoneContextManager } from '@opentelemetry/context-zone';
import { CollectorTraceExporter } from '@opentelemetry/exporter-collector';

const provider = new WebTracerProvider({
  plugins: [
    new DocumentLoad(),
  ],
});
provider.addSpanProcessor(new SimpleSpanProcessor(new ConsoleSpanExporter()));
provider.addSpanProcessor(new SimpleSpanProcessor(new CollectorTraceExporter()));

provider.register({
  contextManager: new ZoneContextManager(),
});

const tracer = provider.getTracer('example-tracer-web');

const getData = (url) => new Promise((resolve, reject) => {
  // eslint-disable-next-line no-undef
  const req = new XMLHttpRequest();
  req.open('GET', url, true);
  req.send();
  req.onload = () => {
    let json;
    try {
      json = JSON.parse(req.responseText);
    } catch (e) {
      reject(e);
    }
    resolve(json);
  };
});

// example of keeping track of context between async operations
const prepareClickEvent = () => {
  const url1 = 'https://raw.githubusercontent.com/open-telemetry/opentelemetry-js/master/package.json';
  const url2 = 'https://raw.githubusercontent.com/open-telemetry/opentelemetry-js/master/packages/opentelemetry-web/package.json';

  const element = document.getElementById('button1');

  const onClick = () => {
    let count = 0;

    function finish() {
      count++;
      if (count === 2) {
        mainSpan.end();
      }
    }

    const mainSpan = tracer.startSpan('click button');
    tracer.withSpan(mainSpan, () => {
      const span1 = tracer.startSpan('files-series-info-1', {
        parent: tracer.getCurrentSpan(),
      });

      const span2 = tracer.startSpan('files-series-info-2', {
        parent: tracer.getCurrentSpan(),
      });

      tracer.withSpan(span1, () => {
        getData(url1).then((data) => {
          console.log('current span is span1', tracer.getCurrentSpan() === span1);
          console.log('info from package.json', data.description, data.version);
          tracer.getCurrentSpan().addEvent('fetching-span1-completed');
          span1.end();
          finish();
        });
      });

      tracer.withSpan(span2, () => {
        getData(url2).then((data) => {
          setTimeout(() => {
            console.log('current span is span2', tracer.getCurrentSpan() === span2);
            console.log('info from package.json', data.description, data.version);
            tracer.getCurrentSpan().addEvent('fetching-span2-completed');
            span2.end();
            finish();
          }, 100);
        });
      });
    });
  };
  element.addEventListener('click', onClick);
};

window.addEventListener('load', prepareClickEvent);
