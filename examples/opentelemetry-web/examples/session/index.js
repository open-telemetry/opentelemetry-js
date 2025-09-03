const { ConsoleSpanExporter, SimpleSpanProcessor } = require( '@opentelemetry/sdk-trace-base');
const { WebTracerProvider } = require( '@opentelemetry/sdk-trace-web');
const {
  LoggerProvider,
  SimpleLogRecordProcessor,
  ConsoleLogRecordExporter,
} = require('@opentelemetry/sdk-logs');
const {
  createSessionSpanProcessor,
  createSessionLogRecordProcessor,
  createSessionManager,
  createDefaultSessionIdGenerator,
  LocalStorageSessionStore
} = require('@opentelemetry/web-common');

// session manager
const sessionManager = createSessionManager({
  sessionIdGenerator: createDefaultSessionIdGenerator(),
  sessionStore: new LocalStorageSessionStore(),
  maxDuration: 20,
  inactivityTimeout: 10
});

sessionManager.addObserver({
  onSessionStarted: (newSession, previousSession) => {
    console.log('Session started', newSession, previousSession);
  },
  onSessionEnded: (session) => {
    console.log('Session ended', session);
  }
});

// restore or start session
sessionManager.start();

// configure tracer
const tracerProvider = new WebTracerProvider({
  spanProcessors: [
    createSessionSpanProcessor(sessionManager),
    new SimpleSpanProcessor(new ConsoleSpanExporter())
  ]
});

tracerProvider.register();
const tracer = tracerProvider.getTracer('example');

// configure logger
const loggerProvider = new LoggerProvider({
  processors: [
    createSessionLogRecordProcessor(sessionManager),
    new SimpleLogRecordProcessor(new ConsoleLogRecordExporter())
  ]
});

const logger = loggerProvider.getLogger('example');

window.addEventListener('load', () => {
  document.getElementById('button1').addEventListener('click', generateSpan);
  document.getElementById('button2').addEventListener('click', generateLog);
});

function generateSpan() {
  const span = tracer.startSpan('foo');
  span.setAttribute('key', 'value');
  span.end();
}

function generateLog() {
  logger.emit({
    attributes: {
      name: 'my-event',
    },
    body: {
      key1: 'val1'
    }
  });
}
