require('./tracing');
require('./events');
const { setGlobalAttribute } = require('@opentelemetry/shared-attributes');
const { logs } = require('@opentelemetry/api-logs');

setGlobalAttribute('session.id', 'abcd1234');

const logger = logs.getLogger('test');

const getData = (url) => fetch(url, {
  method: 'GET',
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
});

// example of keeping track of context between async operations
const prepareClickEvent = () => {
  const url = 'https://httpbin.org/get';
  const element = document.getElementById('button1');

  const onClick = () => {
    logger.emit({
      url: url
    });

    getData(url)
  };

  element.addEventListener('click', onClick);
};

window.addEventListener('load', prepareClickEvent);
