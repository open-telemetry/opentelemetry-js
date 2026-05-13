# Diagnostic logging

This document provides notes primarily for OpenTelemetry JS *implementors* of the SDK and instrumentations. It shows how to do and use diagnostic logging in OTel JS code.

> [!NOTE]
> Though the term "logging" and "logger" is being used here, the OTel JS `diag`nostic logging system is **distinct from support for the OpenTelemetry logs signal**.

## Basics

The OTel JS API (`@opentelemetry/api`) provides a `diag` API for configuring and emitting diagnostic logging.

First, typically an SDK (e.g. using `@opentelemetry/sdk-node` or `@opentelemetry/auto-instrumentations-node`) will configure a diagnostic logger. Without this step, the default is a no-op logger that will not emit anything. E.g.:

```js
import { diag, DiagLogLevel, DiagConsoleLogger } from '@opentelemetry/api';
diag.setLogger(new DiagConsoleLogger(), { logLevel: DiagLogLevel.INFO });
```

Then, SDK code can emit diagnostics logs:

```js
import { diag } from '@opentelemetry/api';
diag.error('boom');
diag.warn('thar be dragons');
diag.info('doing a thing');
diag.debug('general debug message', someData);
diag.verbose('very detailed data');
```

Instrumentations (subclasses of `InstrumentationBase`) have a `this._diag` logger that can be used. This is a "component" diag logger that includes the instrumentation name in emitted logs.

## Logging recommendations

Be sparing in your use of `diag` logging. Ideally the user of OTel JS need not see much, if any, log output from the OTel SDK unless (a) something is wrong or (b) they have explicitly configure debug-level diag log output.

See the recommended usage of each diag log level [in the comments of `DiagConsoleLogger`](https://github.com/open-telemetry/opentelemetry-js/blob/67c1e891f1298be2bef5a12e85fb18c7022e52e2/api/src/diag/consoleLogger.ts#L78-L109).

## Pretty-printing of SDK objects

Some SDK implementation classes include a [custom inspection method](https://nodejs.org/api/util.html#custom-inspection-functions-on-objects) for pretty-printing with Node.js' `console.log`, `util.inspect`, and OTel JS's `DiagConsoleLogger`. These provide a more convenient output for development/debugging by OTel JS implementors.

For example, it means that `diag.debug('this is my span:', span)` shows this:

```js
this is my span: SpanImpl {
  name: 'a-span',
  kind: 0,
  spanContext: {
    traceId: 'dd82d11790e4732e128770bf11929f27',
    spanId: '8c62ca36da4ccf49',
    traceFlags: 1,
    traceState: undefined
  },
  parentSpanContext: undefined,
  status: { code: 0 },
  startTime: [ 1778710295, 917000000 ],
  endTime: [ 1778710295, 917162000 ],
  duration: [ 0, 162000 ],
  ended: true,
  attributes: { anAttr: 'aValue' },
  events: [],
  links: [],
  droppedAttributesCount: 0,
  droppedEventsCount: 0,
  droppedLinksCount: 0,
  instrumentationScope: { name: 'default', version: undefined, schemaUrl: undefined },
  resource: { attributes: [Object] }
}
```

<details>
<summary>rather than this verbose dump with internal details</summary>

```js
this is my span: SpanImpl {
  _spanContext: {
    traceId: '07a7aa9a9b0b5c108bb4c62ea60d276d',
    spanId: 'de1c9b1394e5fcf4',
    traceFlags: 1,
    traceState: undefined
  },
  kind: 0,
  parentSpanContext: undefined,
  attributes: { anAttr: 'aValue' },
  links: [],
  events: [],
  startTime: [ 1778709831, 334000000 ],
  resource: ResourceImpl {
    _rawAttributes: [
      [Array], [Array],
      [Array], [Array],
      [Array], [Array],
      [Array], [Array],
      [Array], [Array],
      [Array], [Array],
      [Array]
    ],
    _asyncAttributesPending: true,
    _schemaUrl: undefined,
    _memoizedAttributes: undefined
  },
  instrumentationScope: { name: 'default', version: undefined, schemaUrl: undefined },
  _droppedAttributesCount: 0,
  _droppedEventsCount: 0,
  _droppedLinksCount: 0,
  _attributesCount: 1,
  name: 'a-span',
  status: { code: 0 },
  endTime: [ 1778709831, 334154250 ],
  _ended: true,
  _duration: [ 0, 154250 ],
  _spanProcessor: MultiSpanProcessor { _spanProcessors: [ [BatchSpanProcessor] ] },
  _spanLimits: {
    attributeValueLengthLimit: Infinity,
    attributeCountLimit: 128,
    linkCountLimit: 128,
    eventCountLimit: 128,
    attributePerEventCountLimit: 128,
    attributePerLinkCountLimit: 128
  },
  _attributeValueLengthLimit: Infinity,
  _recordEndMetrics: [Function (anonymous)],
  _performanceStartTime: 116.817375,
  _performanceOffset: -0.249267578125,
  _startTimeProvided: false
}
```

</details>

> [!TIP]
>
> - Node.js default *depth* of `2` is used. If that hides too much detail for your debugging (e.g. `resource: { attributes: [Object] }` above), then you can bump Node.js's default inspect depth:
>
>     ```js
>     import { inspect } from 'node:util';
>     inspect.defaultOptions.depth = 10;
>     ```
>
> - If you *want* the raw dump with internal properties, use Node.js's `console.dir()`, which bypasses custom inspect methods.

Note that the exact output of these custom inspect methods is **not a promised interface**. A change to format of the inspect string output is not considered a breaking change.
