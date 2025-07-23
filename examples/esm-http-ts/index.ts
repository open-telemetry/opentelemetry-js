import { registerInstrumentations } from '@opentelemetry/instrumentation';
import { trace, DiagConsoleLogger, DiagLogLevel, diag } from '@opentelemetry/api';
import { HttpInstrumentation } from '@opentelemetry/instrumentation-http';
import { NodeTracerProvider } from '@opentelemetry/sdk-trace-node';
import {
  ConsoleSpanExporter,
  SimpleSpanProcessor,
} from '@opentelemetry/sdk-trace-base';
import { resourceFromAttributes } from '@opentelemetry/resources';
import { ATTR_SERVICE_NAME } from '@opentelemetry/semantic-conventions';
import http from 'http';

diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.DEBUG);
const exporter = new ConsoleSpanExporter();
const processor = new SimpleSpanProcessor(exporter);

const tracerProvider = new NodeTracerProvider({
  resource: resourceFromAttributes({
    [ATTR_SERVICE_NAME]: 'esm-http-ts-example',
  }),
  spanProcessors: [processor],
});
tracerProvider.register();

registerInstrumentations({
  instrumentations: [new HttpInstrumentation()],
});

const hostname = '0.0.0.0';
const port = 3000;

const server = http.createServer((req, res) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/plain');
  const tracer = trace.getTracer('esm-tracer');
  tracer.startActiveSpan('manual', span => {
    span.end();
  });
  res.end('Hello, World!\n');
});

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});
