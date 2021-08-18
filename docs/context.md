# Context

In order for OpenTelemetry to work, it must store and propagate important telemetry data.
For example, when a request is received and a span is started it must be available to a component which creates its child span.
To solve this problem, OpenTelemetry stores the span in the Context.
This document describes the OpenTelemetry context API for JavaScript and how it is used.

_Context Specification: <https://github.com/open-telemetry/opentelemetry-specification/blob/v1.6.0/specification/context/context.md>_

_Context API Reference: <https://open-telemetry.github.io/opentelemetry-js-api/classes/contextapi.html>_

- [Context Manager](#context-manager)
- [Root Context](#root-context)
- [Context Keys](#context-keys)
- [Basic Operations](#basic-operations)
  - [Get Entry](#get-entry)
  - [Set Entry](#set-entry)
  - [Delete Entry](#delete-entry)
- [Active Context](#active-context)
  - [Get Active Context](#get-active-context)
  - [Set Active Context](#set-active-context)
  - [Example](#example)

## Context Manager

The context API depends on a context manager to work.
The examples in this document will assume you have already configured a context manager.
Typically the context manager is provided by your SDK, however it is possible to register one directly like this:

```typescript
import * as api from "@opentelemetry/api";
import { AsyncHooksContextManager } from "@opentelemetry/context-async-hooks";

const contextManager = new AsyncHooksContextManager();
context.Manager.enable();
api.context.setGlobalContextManager(contextManager);
```

## Root Context

The `ROOT_CONTEXT` is the empty context.
If no context is active, the `ROOT_CONTEXT` is active.
Active context is explained below [Active Context](#active-context).

## Context Keys

Context entries are key-value pairs.
Keys can be created by calling `api.createContextKey(description)`.

```typescript
import * as api from "@opentelemetry/api";

const key1 = api.createContextKey("My first key");
const key2 = api.createContextKey("My second key");
```

## Basic Operations

### Get Entry

Entries are accessed using the `context.getValue(key)` method.

```typescript
import * as api from "@opentelemetry/api";

const key = api.createContextKey("some key");
// ROOT_CONTEXT is the empty context
const ctx = api.ROOT_CONTEXT;

const value = ctx.getValue(key);
```

### Set Entry

Entries are created by using the `context.setValue(key, value)` method.
Setting a context entry creates a new context with all the entries of the previous context, but with the new entry.
Setting a context entry does not modify the previous context.

```typescript
import * as api from "@opentelemetry/api";

const key = api.createContextKey("some key");
const ctx = api.ROOT_CONTEXT;

// add a new entry
const ctx2 = ctx.setValue(key, "context 2");

// ctx2 contains the new entry
console.log(ctx2.getValue(key)) // "context 2"

// ctx is unchanged
console.log(ctx.getValue(key)) // undefined
```

### Delete Entry

Entries are removed by calling `context.deleteValue(key)`.
Deleting a context entry creates a new context with all the entries of the previous context, but without the entry identified by the key.
Deleting a context entry does not modify the previous context.

```typescript
import * as api from "@opentelemetry/api";

const key = api.createContextKey("some key");
const ctx = api.ROOT_CONTEXT;
const ctx2 = ctx.setValue(key, "context 2");

// remove the entry
const ctx3 = ctx.deleteValue(key);

// ctx3 does not contain the entry
console.log(ctx3.getValue(key)) // undefined

// ctx2 is unchanged
console.log(ctx2.getValue(key)) // "context 2"
// ctx is unchanged
console.log(ctx.getValue(key)) // undefined
```

## Active Context

**IMPORTANT**: This assumes you have configured a Context Manager.
Without one, `api.context.active()` will _ALWAYS_ return the `ROOT_CONTEXT`.

The active context is the context which is returned by `api.context.active()`.
The context object contains entries which allow tracing components which are tracing a single thread of execution to communicate with each other and ensure the trace is successfully created.
For example, when a span is created it may be added to the context.
Later, when another span is created it may use the span from the context as its parent span.
This is accomplished through the use of mechanisms like [async_hooks](https://nodejs.org/api/async_hooks.html) or [AsyncLocalStorage](https://nodejs.org/api/async_context.html#async_context_class_asynclocalstorage) in node, or [zone.js](https://github.com/angular/zone.js/) on the web in order to propagate the context through a single execution.
If no context is active, the `ROOT_CONTEXT` is returned, which is just the empty context object.

### Get Active Context

The active context is the context which is returned by `api.context.active()`.

```typescript
import * as api from "@opentelemetry/api";

// Returns the active context
// If no context is active, the ROOT_CONTEXT is returned
const ctx =  api.context.active(); 
```

### Set Active Context

A context can be made active by use of `api.context.with(ctx, callback)`.
During execution of the `callback`, the context passed to `with` will be returned by `context.active`.

```typescript
import * as api from "@opentelemetry/api";

const key = api.createContextKey("Key to store a value");
const ctx = api.context.active();

api.context.with(ctx.setValue(key, "context 2"), async () => {
  // "context 2" is active
  console.log(api.context.active().getValue(key)) // "context 2"
});
```

The return value of `api.context.with(context, callback)` is the return value of the callback.
The callback is always called synchronously.

```typescript
import * as api from "@opentelemetry/api";

const name = await api.context.with(api.context.active(), async () => {
  const row = await db.getSomeValue();
  return row["name"];
});

console.log(name); // name returned by the db
```

Active context executions may be nested.

```typescript
import * as api from "@opentelemetry/api";

const key = api.createContextKey("Key to store a value");
const ctx = api.context.active();

// No context is active
console.log(api.context.active().getValue(key)); // undefined

api.context.with(ctx.setValue(key, "context 2"), () => {
  // "context 2" is active
  console.log(api.context.active().getValue(key)) // "context 2"
  api.context.with(ctx.setValue(key, "context 3"), () => {
    // "context 3" is active
    console.log(api.context.active().getValue(key)) // "context 3"
  });
  // "context 2" is active
  console.log(api.context.active().getValue(key)) // "context 2"
});

// No context is active
console.log(api.context.active().getValue(key)); // undefined
```

### Example

This more complex example illustrates how the context is not modified, but new context objects are created.

```typescript
import * as api from "@opentelemetry/api";

const key = api.createContextKey("Key to store a value");

const ctx =  api.context.active(); // Returns ROOT_CONTEXT when no context is active
const ctx2 = ctx.setValue(key, "context 2"); // does not modify ctx

console.log(ctx.getValue(key)) //? undefined
console.log(ctx2.getValue(key)) //? "context 2"

const ret = api.context.with(ctx2, () => {
    const ctx3 = api.context.active().setValue(key, "context 3");

    console.log(api.context.active().getValue(key)); //? "context 2"
    console.log(ctx.getValue(key)) //? undefined
    console.log(ctx2.getValue(key)) //? "context 2"
    console.log(ctx3.getValue(key)) //? "context 3"

    api.context.with(ctx3, () => {
        console.log(api.context.active().getValue(key)); //? "context 3"
    });
    console.log(api.context.active().getValue(key)); //? "context 2"

    return "return value"
});

// The value returned by the callback is returned to the caller
console.log(ret); //? "return value"
```
