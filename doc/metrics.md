# Metrics

This quick start is for end users of OpenTelemetry who wish to manually measure their applications. If you are a library author, please see the [Library Authors Guide](library-author.md). If you wish to automatically instrument your application, see the automatic instrumentation documentation for the SDK you wish to use.

For a high-level overview of OpenTelemetry metrics in general and definitions of some common terms, you can refer to the [OpenTelemetry Specification Overview][spec-overview]

_Metrics API Specification: <https://github.com/open-telemetry/opentelemetry-specification/blob/v1.14.0/specification/metrics/api.md>_

_Metrics API Reference: <https://open-telemetry.github.io/opentelemetry-js-api/classes/metricseapi.html>_

- [Acquiring a Meter](#acquiring-a-meter)
- [Starting and Ending a Span](#starting-and-ending-a-span)
- [Describing a Span](#describing-a-span)
  - [Span Relationships](#span-relationships)
  - [Span Attributes](#span-attributes)
  - [Span Kind](#span-kind)
    - [Client](#client)
    - [Server](#server)
    - [Internal](#internal)
    - [Producer](#producer)
    - [Consumer](#consumer)
  - [Semantic Conventions](#semantic-conventions)

## Acquiring a Meter

In OpenTelemetry, Metrics measurement operations are performed using methods on a _meter_. You can get a meter by calling [`getMeter`](https://open-telemetry.github.io/opentelemetry-js-api/classes/metricsapi.html#getmetrics) on the global meter provider. `getMeter` takes the name and version of the application or library acquiring the meter, and provides a meter which can be used to create instruments.

```typescript
import { metrics } from '@opentelemetry/api-metrics';

const meter = metrics.getMeter("my-application", "0.1.0");
```

## Create a metric instrument

In OpenTelemetry, all _metrics_ are composed of [`Instruments`](https://open-telemetry.github.io/opentelemetry-js-api/interfaces/instrument.html). A instrument is responsible for reporting measurements,
there are four types of instruments that can be created:

  - Counter, a synchronous instrument which supports non-negative increments
  - Asynchronous Counter, a asynchronous instrument which supports non-negative increments
  - Histogram,a synchronous instrument which supports arbitrary values that are statistically meaningful, such as histograms, summaries or percentile
  - Asynchronous Gauge, asynchronous instrument which supports non-additive values, such as room temperature
  - UpDownCounter, a synchronous instrument which supports increments and decrements, such as number of active requests
  - Asynchronous UpDownCounter, a asynchronous instrument which supports increments and decrements

You can create a Counter instrument by calling [`Meter#createCounter`](https://open-telemetry.github.io/opentelemetry-js/interfaces/_opentelemetry_api_metrics.Meter.html#createCounter). The only required argument to `createCounter` is the _instrument name_, which should describe the item that is being measurement.

```typescript
const counter = meter.createCounter("events.counter");

// increase the counter
counter.add(1);

```

Most of the time, instruments will be used to measure operations in your application. The following example shows what it might look like to manually measure duration a function.

```typescript
async function myTask() {
  const histogram = meter.createHistogram("taks.duration");
  const startTime = new Date().getTime()
  try {
    // Wait for five seconds bore continueing code execution
    await setTimeout(5_000)
  } catch (err) {
  } finally {
    const endTime = new Date().getTime()
    const executionTime = endTime - startTime

    // Record the duration of the task operation
    histogram.record(executionTime)
  }
}

await myTask()
```

## Describing a instrument measurement

Using attributes, kind, and the related [semantic conventions](https://github.com/open-telemetry/opentelemetry-specification/tree/main/specification/metrics/semantic_conventions), we can more accurately describe the measurement in a way our metrics backend will more easily understand. The following example uses these mechanisms, which are described below.

```typescript
import { NetTransportValues SemanticAttributes } from '@opentelemetry/semantic-conventions';
import { trace, context, SpanKind, SpanStatusCode } from '@opentelemetry/api';

async function onGet(request, response) {
  // HTTP semantic conventions determine the span name and attributes for this span
  const span = tracer.startSpan(`GET /user/:id`, {
    // attributes can be added when the span is started
    attributes: {
      // Attributes from the HTTP trace semantic conventions
      // https://github.com/open-telemetry/opentelemetry-specification/blob/main/specification/trace/semantic_conventions/http.md
      [SemanticAttributes.HTTP_METHOD]: "GET",
      [SemanticAttributes.HTTP_FLAVOR]: "1.1",
      [SemanticAttributes.HTTP_URL]: request.url,
      [SemanticAttributes.NET_PEER_IP]: "192.0.2.5",
    },
    // This span represents a remote incoming synchronous request
    kind: SpanKind.SERVER
  });

  const userId = request.params.id;

  // Create a new context from the current context which has the span "active"
  const ctx = trace.setSpan(context.active(), span);

  // Call getUser with the newly created context
  //
  // context.with calls a function with an associated "active" context. Within
  // the function, calling context.active() returns the currently active context.
  // If there is no active context, the ROOT_CONTEXT will be returned, which
  // has no key-value pairs.
  //
  // context.with requires at least 2 arguments: a context and a function to be called.
  // If a third argument is provided, it will be bound to `this` `this` inside the function.
  // Any additional parameters are used as arguments when calling the function.
  //
  //   Return value is the value returned from getUser
  //    |                         Context to be used as the "active" context
  //    |                         |    Function to be called
  //    |                         |    |        Object assigned to this during function execution
  //    |                         |    |        |          Passed as the first argument to getUser
  //    |                         |    |        |          |
  //    V                         V    V        V          V
  const user = await context.with(ctx, getUser, undefined, userId);

  // Attributes may also be added after the span is started.
  // http.status_code is required by the HTTP trace semantic conventions
  span.setAttribute("http.status_code", 200);

  response.send(user.toJson());
  span.setStatus({
      code: SpanStatusCode.OK,
  });
  span.end();

  // Attributes MAY NOT be added after the span ends
  span.setAttribute("my.attribute", false); // this does nothing
}

async function getUser(userId) {
  // when this span is created, it will automatically use the span from the context as its parent
  const span = tracer.startSpan("SELECT ShopDb.Users", {
    attributes: {
      // Attributes from the database trace semantic conventions
      // https://github.com/open-telemetry/opentelemetry-specification/blob/main/specification/trace/semantic_conventions/database.md
      [SemanticAttributes.DB_SYSTEM]: "mysql",
      [SemanticAttributes.DB_CONNECTION_STRING]: "Server=shopdb.example.com;Database=ShopDb;Uid=billing_user;TableCache=true;UseCompression=True;MinimumPoolSize=10;MaximumPoolSize=50;",
      [SemanticAttributes.DB_USER]: "app_user",
      [SemanticAttributes.NET_PEER_NAME]: "shopdb.example.com",
      [SemanticAttributes.NET_PEER_IP]: "192.0.2.12",
      [SemanticAttributes.NET_PEER_PORT]: 3306,
      [SemanticAttributes.NET_TRANSPORT]: NetTransportValues.IP_TCP,
      [SemanticAttributes.DB_NAME]: "ShopDb",
      [SemanticAttributes.DB_STATEMENT]: `Select * from Users WHERE user_id = ${userId}`,
      [SemanticAttributes.DB_OPERATION]: "SELECT",
      [SemanticAttributes.DB_SQL_TABLE]: "Users",
    },
    kind: SpanKind.CLIENT,
  });
  const user = await db.select("Users", { id: userId });

  span.setStatus({
      code: SpanStatusCode.OK,
  });
  span.end();
  return user;
}

server.on("GET", "/user/:id", onGet);
```

### Span Relationships

One of the most important aspects of spans is their relationships to each other. For instance, if one span describes an incoming request which makes a database call, it is recommended to trace the database call as a separate span which is a child of the original request span. In order to do this, when we create a span we can tell OpenTelemetry which span to use as its parent using a mechanism called _Context_.

Context is a very important part of the OpenTelemetry API which cannot be adequately explained in a single paragraph. To read more about context, see the [context documentation](context.md).

### Span Attributes

While name, start time, end time, and status are the minimum information required to trace an operation, most of the time they will not be enough information on their own to effectively observe an application. To solve this, OpenTelemetry uses _Span Attributes_. Span attributes are an object with string keys and string, number, or boolean values which describe the span. For example, we can use the span attributes to add route and http response code information to the example above.

### Span Kind

When a span is created, it is one of `Client`, `Server`, `Internal`, `Producer`, or `Consumer`. This span kind provides a hint to the tracing backend as to how the trace should be assembled. According to the OpenTelemetry specification, the parent of a server span is always a client span, and the child of a client span is always a server span. Similarly, the parent of a consumer span is always a producer and the child of a producer span is always a consumer. If not provided, the span kind is assumed to be internal.

For more information regarding SpanKind, see <https://github.com/open-telemetry/opentelemetry-specification/blob/main/specification/trace/api.md#spankind>.

#### Client

Client spans represent a synchronous outgoing remote call such as an outgoing HTTP request or database call. Note that in this context, "synchronous" does not refer to `async/await`, but to the fact that it is not queued for later processing.

#### Server

Server spans represent a synchronous incoming remote call such as an incoming HTTP request or remote procedure call.

#### Internal

Internal spans represent operations which do not cross a process boundary. Things like instrumenting a function call or an express middleware may use internal spans.

#### Producer

Producer spans represent the creation of a job which may be asynchronously processed later. It may be a remote job such as one inserted into a job queue or a local job handled by an event listener.

#### Consumer

Consumer spans represent the processing of a job created by a producer and may start long after the producer span has already ended.

### Semantic Conventions

One problem with span names and attributes is recognizing, categorizing, and analyzing them in your tracing backend. Between different applications, libraries, and tracing backends there might be different names and expected values for various attributes. For example, your application may use `http.status` to describe the HTTP status code, but a library you use may use `http.status_code`. In order to solve this problem, OpenTelemetry uses a library of semantic conventions which describe the name and attributes which should be used for specific types of spans. The use of semantic conventions is always recommended where applicable, but they are merely conventions. For example, you may find that some name other than the name suggested by the semantic conventions more accurately describes your span, you may decide not to include a span attribute which is suggested by semantic conventions for privacy reasons, or you may wish to add a custom attribute which isn't covered by semantic conventions. All of these cases are fine, but please keep in mind that if you stray from the semantic conventions, the categorization of spans in your tracing backend may be affected.

_See the current trace semantic conventions in the OpenTelemetry Specification repository: <https://github.com/open-telemetry/opentelemetry-specification/tree/main/specification/trace/semantic_conventions>_

[spec-overview]: https://github.com/open-telemetry/opentelemetry-specification/blob/main/specification/overview.md
