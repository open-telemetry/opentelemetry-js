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
  Session,
  SessionManager,
  DefaultIdGenerator,
  LocalStorageSessionStore
} = require('@opentelemetry/web-common');

// session manager
const sessionManager = await createSessionManager({
  sessionIdGenerator: new DefaultIdGenerator(),
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

// configure tracer
const provider = new WebTracerProvider();
provider.addSpanProcessor(createSessionSpanProcessor(sessionManager));
provider.addSpanProcessor(new SimpleSpanProcessor(new ConsoleSpanExporter()));
provider.register();
const tracer = provider.getTracer('example');

// configure logger
const loggerProvider = new LoggerProvider();
loggerProvider.addLogRecordProcessor(createSessionLogRecordProcessor(sessionManager));
loggerProvider.addLogRecordProcessor(
  new SimpleLogRecordProcessor(new ConsoleLogRecordExporter())
);
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
