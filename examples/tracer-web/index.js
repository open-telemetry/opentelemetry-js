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

const span3 = webTracerWithZone.startSpan('foo1');
webTracerWithZone.withSpan(span3, () => {
  console.log('Current span is span3', webTracerWithZone.getCurrentSpan() === span3);
  setTimeout(() => {
    const span4 = webTracerWithZone.startSpan('foo2');
    console.log('Current span is span3', webTracerWithZone.getCurrentSpan() === span3);
    webTracerWithZone.withSpan(span4, () => {
      console.log('Current span is span4', webTracerWithZone.getCurrentSpan() === span4);
      setTimeout(() => {
        console.log('Current span is span4', webTracerWithZone.getCurrentSpan() === span4);
      }, 500);
    });
    // there is a timeout which still keeps span4 active
    console.log('Current span is span4', webTracerWithZone.getCurrentSpan() === span4);
  }, 490);
  console.log('Current span is span3', webTracerWithZone.getCurrentSpan() === span3);
});

console.log('Current span is window', webTracerWithZone.getCurrentSpan() === window);

// example of keeping track of scope between async operations
const prepareClickEvent = () => {
  const element = document.getElementById('button2');
  let mainSpan = webTracerWithZone.startSpan('main-span');
  webTracerWithZone.bind(element, mainSpan);

  const onClick = () => {
    element.removeEventListener('click', onClick);
    console.log('starting timeout, scope is', webTracerWithZone.getCurrentSpan().name);
    const spanClickAsync = webTracerWithZone.startSpan('span-click-timeout', {
      parent: webTracerWithZone.getCurrentSpan()
    });
    spanClickAsync.addEvent('starting timeout');

    window.setTimeout(() => {
      console.log('timeout finished, scope is', webTracerWithZone.getCurrentSpan().name);
      spanClickAsync.addEvent('timeout finished');
      console.log('ending spans');
      spanClickAsync.end();
      mainSpan.end();
    }, 500);
  };
  element.addEventListener('click', onClick);

};

window.addEventListener('load', () => {
  const element = document.getElementById('button1');
  element.addEventListener('click', prepareClickEvent);
});
