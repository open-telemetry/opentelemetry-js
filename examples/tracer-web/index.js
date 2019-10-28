import { ConsoleSpanExporter, SimpleSpanProcessor } from '@opentelemetry/tracing';
import { WebTracer } from '@opentelemetry/web';
import { DocumentLoad } from '@opentelemetry/plugin-document-load';
import { ZoneScopeManager } from '@opentelemetry/scope-zone';

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

console.log('Current span is window', webTracerWithZone.getCurrentSpan() === window);

const span1 = webTracerWithZone.startSpan('foo1');
webTracerWithZone.withSpan(span1, () => {
  console.log('Current span is span1', webTracerWithZone.getCurrentSpan() === span1);

  setTimeout(() => {
    const span2 = webTracerWithZone.startSpan('foo2');
    console.log('Current span is span1', webTracerWithZone.getCurrentSpan() === span1);
    webTracerWithZone.withSpan(span2, () => {
      console.log('Current span is span2', webTracerWithZone.getCurrentSpan() === span2);
      setTimeout(() => {
        console.log('Current span is span2', webTracerWithZone.getCurrentSpan() === span2);
      }, 500);
    });
    // there is a timeout which still keeps span2 active
    console.log('Current span is span2', webTracerWithZone.getCurrentSpan() === span2);
  }, 500);
  console.log('Current span is span1', webTracerWithZone.getCurrentSpan() === span1);
});

// example of keeping track of scope between async operations
let counter = 0;
const prepareClickEvent = () => {
  const url = 'https://raw.githubusercontent.com/open-telemetry/opentelemetry-js/master/package.json';

  const element = document.getElementById('button1');
  let mainSpan = webTracerWithZone.startSpan('main-span');
  webTracerWithZone.bind(element, mainSpan);

  const onClick = () => {
    counter++;
    const span1 = webTracerWithZone.startSpan(`files-series-info-${counter}`, {
      parent: webTracerWithZone.getCurrentSpan()
    });

    webTracerWithZone.withSpan(span1, ()=> {
      span1.addEvent('fetching-data-1');
      getData(url).then((data)=> {
        console.log(webTracerWithZone.getCurrentSpan().name, data.description, data.version);
        webTracerWithZone.getCurrentSpan().addEvent('fetching-data-1-completed');
        webTracerWithZone.getCurrentSpan().addEvent('fetching-data-2');

        getData(url).then((data)=> {
          console.log(webTracerWithZone.getCurrentSpan().name, data.description, data.version);

          webTracerWithZone.getCurrentSpan().addEvent('fetching-data-2-completed');
          webTracerWithZone.getCurrentSpan().end();
          counter++
          ;const span2 = webTracerWithZone.startSpan(`files-series-info-${counter}`, {
            parent: webTracerWithZone.getCurrentSpan()
          });
          webTracerWithZone.withSpan(span2, ()=> {
            webTracerWithZone.getCurrentSpan().addEvent('fetching-data-3');
            getData(url).then((data)=> {
              console.log(webTracerWithZone.getCurrentSpan().name, data.description, data.version);
              webTracerWithZone.getCurrentSpan().addEvent('fetching-data-3-completed');
              webTracerWithZone.getCurrentSpan().end();
            });
          });
        });
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
