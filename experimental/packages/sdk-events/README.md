# OpenTelemetry Events SDK

[![NPM Published Version][npm-img]][npm-url]
[![Apache License][license-image]][license-image]

**Note: This is an experimental package under active development. New releases may include breaking changes.**

This package provides an experimental Events SDK implementation. The Events SDK is implemented on top of the Logs SDK.

## Installation

```bash
npm install --save @opentelemetry/api-logs
npm install --save @opentelemetry/api-events
npm install --save @opentelemetry/sdk-events
```

## Usage

Here is an example of configuring and using the Events SDK:

```js
const { logs } = require('@opentelemetry/api-logs');
const { events } = require('@opentelemetry/api-events');
const { EventLoggerProvider } = require('@opentelemetry/sdk-events');
const {
  LoggerProvider,
  SimpleLogRecordProcessor,
  ConsoleLogRecordExporter,
} = require('@opentelemetry/sdk-logs');

// The Events SDK has a dependency on the Logs SDK
// Any processing of events (e.g. export) is done through the Logs SDK.
const loggerProvider = new LoggerProvider();
loggerProvider.addLogRecordProcessor(
  new SimpleLogRecordProcessor(new ConsoleLogRecordExporter())
);
logs.setGlobalLoggerProvider(loggerProvider);

// Register a global EventLoggerProvider -
// This would be used by instrumentations, similar to how the global TracerProvider,
// LoggerProvider and MeterProvider work.
const eventLoggerProvider = new EventLoggerProvider();
events.setGlobalEventLoggerProvider(eventLoggerProvider);

// get an EventLogger from the global EventLoggerProvider
const eventLogger = events.getEventLogger('default');

// emit an event
eventLogger.emit({
  name: 'myEvent',
  data: {
    field1: 'abc',
    field2: 123
  }
});
```

Alternatively, `EventLoggerProvider` can also be instantiated without registering a global
`LoggerProvider`.

```js
const loggerProvider = new LoggerProvider();
const eventLoggerProvider = new EventLoggerProvider({
  loggerProvider: loggerProvider
});
```

## Example

See [examples/events](https://github.com/open-telemetry/opentelemetry-js/tree/main/experimental/examples/events)

## Useful links

- For more information on OpenTelemetry, visit: <https://opentelemetry.io/>
- For more about OpenTelemetry JavaScript: <https://github.com/open-telemetry/opentelemetry-js>
- For help or feedback on this project, join us in [GitHub Discussions][discussions-url]

## License

Apache 2.0 - See [LICENSE][license-url] for more information.

[discussions-url]: https://github.com/open-telemetry/opentelemetry-js/discussions
[license-url]: https://github.com/open-telemetry/opentelemetry-js/blob/main/LICENSE
[license-image]: https://img.shields.io/badge/license-Apache_2.0-green.svg?style=flat
[npm-url]: https://www.npmjs.com/package/@opentelemetry/sdk-logs
[npm-img]: https://badge.fury.io/js/%40opentelemetry%2Fsdk%2Dlogs.svg
