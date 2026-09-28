# OpenTelemetry Web Utils

[![NPM Published Version][npm-img]][npm-url]
[![Apache License][license-image]][license-image]

**Note: This is an experimental package under active development. New releases may include breaking changes.**

This package contains classes and utils that are common for web use cases.

## Installation

```bash
npm install --save @opentelemetry/web-common
```

## Sessions

Sessions correlate multiple traces, events and logs that happen within a given time period. Sessions are represented as span/log attributes prefixed with the `session.` namespace. For additional information, see [documentation in semantic conventions](https://github.com/open-telemetry/semantic-conventions/blob/main/docs/general/session.md).

We provide a default implementation of managing sessions that:

- abstracts persisting sessions across page loads, with default implementation based on LocalStorage
- abstracts generating session IDs
- provides a mechanism for resetting the active session after maximum defined duration
- provides a mechanism for resetting the active session after a defined inactivity duration

Example:

```js
const {
  createSessionSpanProcessor,
  createSessionLogRecordProcessor,
  createDefaultSessionIdGenerator,
  createSessionManager,
  SessionManager,
  DefaultIdGenerator,
  LocalStorageSessionStore
} = require('@opentelemetry/web-common');

// session manager
const sessionManager = createSessionManager({
  sessionIdGenerator: createDefaultSessionIdGenerator(),
  sessionStore: new LocalStorageSessionStore(),
  maxDuration: 7200, // 4 hours
  inactivityTimeout: 1800 // 30 minutes
});

// restore or start session
sessionManager.start();

// configure tracer
const tracerProvider = new WebTracerProvider({
  spanProcessors: [
    createSessionSpanProcessor(sessionManager),
  ]
});

// configure logger
const loggerProvider = new LoggerProvider({
  processors: [
    createSessionLogRecordProcessor(sessionManager),
  ]
});
```

The above implementation can be customized by providing different implementations of SessionStore and SessionIdGenerator.

### Observing sessions

The SessionManager class provides a mechanism for observing sessions. This is useful when other components should be notified when a session is started or ended.

```js
sessionManager.addObserver({
  onSessionStarted: (newSession, previousSession) => {
    console.log('Session started', newSession, previousSession);
  },
  onSessionEnded: (session) => {
    console.log('Session ended', session);
  }
});
```

### Custom implementation of managing sessions

If you require a completely custom solution for managing sessions, you can still use the processors that attach attributes to spans/logs. Here is an example:

```js
function getSessionId() {
  return 'abcd1234';
}

// configure tracer
const tracerProvider = new WebTracerProvider({
  spanProcessors: [
    createSessionSpanProcessor({
      getSessionId: getSessionId
    }),
  ]
});

// configure logger
const loggerProvider = new LoggerProvider({
  processors: [
    createSessionLogRecordProcessor({
      getSessionId: getSessionId
    }),
  ]
});
```

## Useful links

- For more information on OpenTelemetry, visit: <https://opentelemetry.io/>
- For more about OpenTelemetry JavaScript: <https://github.com/open-telemetry/opentelemetry-js>
- For help or feedback on this project, join us in [GitHub Discussions][discussions-url]

## License

Apache 2.0 - See [LICENSE][license-url] for more information.

[discussions-url]: https://github.com/open-telemetry/opentelemetry-js/discussions
[license-url]: https://github.com/open-telemetry/opentelemetry-js/blob/main/LICENSE
[license-image]: https://img.shields.io/badge/license-Apache_2.0-green.svg?style=flat
[npm-url]: https://www.npmjs.com/package/@opentelemetry/web-common
[npm-img]: https://badge.fury.io/js/@opentelemetry%2Fweb-common.svg
