require('./tracing');
require('./events');
const { context, trace } = require('@opentelemetry/api');
const { setGlobalAttribute, setContextAttribute } = require('@opentelemetry/shared-attributes');
const { logs } = require('@opentelemetry/api-logs');

setGlobalAttribute('session.id', 'abcd1234');
setGlobalAttribute('pageUrl', location.href);

const logger = logs.getLogger('test');
const tracer = trace.getTracer('test');

window.addEventListener('load', bootstrapApp);

// example of keeping track of context between async operations
function bootstrapApp() {
  const element = document.getElementById('button1');
  element.addEventListener('click', startTrace);
  
  const element2 = document.getElementById('button2');
  element2.addEventListener('click', changeUrl);

  window.addEventListener('popstate', () => {
    setGlobalAttribute('pageUrl', location.href);
  });
};

function startTrace() {
  const url = 'https://httpbin.org/get';

  const traceContext = setContextAttribute(context.active(), 'element', event.srcElement.id);
  const rootSpan = tracer.startSpan('click', undefined, traceContext);
  context.with(trace.setSpan(traceContext, rootSpan), () => {
    logger.emit({
      url: url
    });
    
    fetch(url, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      }
    })
    .then(() => {
      rootSpan.end();
    });
  });
};

function changeUrl() {
  const url = new URL(location);
  url.searchParams.set("foo", Math.round(Math.random() * 10));
  history.pushState({}, "", url);

  // update global attribute
  setGlobalAttribute('pageUrl', location.href);
}
