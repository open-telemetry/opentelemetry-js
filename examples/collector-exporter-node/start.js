'use strict';
const backslash = "\\";
const doubleQuote = '"';
const lineFeed = "\n";
const textN = "n";
const space = " ";
const arr1 = ['one', space, backslash, backslash, doubleQuote, doubleQuote, backslash, textN, backslash, textN, space, 'end', backslash, textN];
const arr2 = ['two', backslash, textN, space, backslash, backslash, doubleQuote, space, backslash, backslash, doubleQuote, space, 'end'];
function replaceSpec(arr) {
  const newArr = [];
  for (let i = 0, j = arr.length; i < j; i++) {
    if (arr[i] === backslash) {
      newArr.push(arr[i]);
      newArr.push(arr[i]);
    } else if (arr[i] === doubleQuote) {
      newArr.push(backslash);
      newArr.push(arr[i]);
    } else if (arr[i] === lineFeed) {
      newArr.push(backslash);
      newArr.push(textN);
    } else {
      newArr.push(arr[i]);
    }
  }
  return newArr;
}
const line1 = arr1.join('');
const line2 = arr2.join('');
const text = line1 + lineFeed + line2;

const shouldBe1 =
  replaceSpec(arr1).join('') +
  replaceSpec([lineFeed]).join('') +
  replaceSpec(arr2).join('');
// ensure the same test with already concatenated chars
const shouldBe2 =
  replaceSpec(line1.split('')).join('') +
  replaceSpec([lineFeed]).join('') +
  replaceSpec(line2.split('')).join('');

// convert existing text
const shouldBe3 =
  replaceSpec(text.split('')).join('');

function escapeString(str) {
  return str.replace(/\n/g, '\\n').replace(/\\(?!n)/g, '\\\\');
}
function escapeLabelValue(str) {
  if (typeof str !== 'string') {
    str = String(str);
  }
  return escapeString(str).replace(/"/g, '\\"');
}
var result = escapeLabelValue(text);
console.log('line1', line1);
console.log('line2', line2);
console.log('text', text);
console.log('result', result);

console.log('shouldBe1', shouldBe1);
console.log('shouldBe2', shouldBe2);
console.log('shouldBe3', shouldBe3);
// both conversion works fine
console.log(shouldBe2 === shouldBe1);
console.log(shouldBe3 === shouldBe1);
console.log(result === shouldBe1);

const opentelemetry = require('@opentelemetry/api');
const { BasicTracerProvider, ConsoleSpanExporter, SimpleSpanProcessor } = require('@opentelemetry/tracing');
const { CollectorTraceExporter, CollectorProtocolNode } = require('@opentelemetry/exporter-collector');

const exporter = new CollectorTraceExporter({
  serviceName: 'basic-service',
  // headers: {
  //   foo: 'bar'
  // },
  // protocolNode: CollectorProtocolNode.HTTP_PROTO,
  protocolNode: CollectorProtocolNode.HTTP_JSON,
});

const provider = new BasicTracerProvider();
provider.addSpanProcessor(new SimpleSpanProcessor(exporter));
provider.addSpanProcessor(new SimpleSpanProcessor(new ConsoleSpanExporter()));
provider.register();

const tracer = opentelemetry.trace.getTracer('example-collector-exporter-node');

// Create a span. A span must be closed.
const parentSpan = tracer.startSpan('main');
for (let i = 0; i < 10; i += 1) {
  doWork(parentSpan);
}
// Be sure to end the span.
parentSpan.end();

// give some time before it is closed
setTimeout(() => {
  // flush and close the connection.
  exporter.shutdown();
}, 2000);

function doWork(parent) {
  // Start another span. In this example, the main method already started a
  // span, so that'll be the parent span, and this will be a child span.
  const span = tracer.startSpan('doWork', {
    parent,
  });

  // simulate some random work.
  for (let i = 0; i <= Math.floor(Math.random() * 40000000); i += 1) {
    // empty
  }
  // Set attributes to the span.
  span.setAttribute('key', 'value');

  span.setAttribute('mapAndArrayValue', [
    0, 1, 2.25, 'otel', {
      foo: 'bar',
      baz: 'json',
      array: [1, 2, 'boom'],
    },
  ]);

  // Annotate our span to capture metadata about our operation
  span.addEvent('invoking doWork');

  // end span
  span.end();
}
