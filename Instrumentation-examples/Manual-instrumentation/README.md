# Manual Instrumentation

[reference](https://opentelemetry.io/docs/concepts/instrumenting/#manual-instrumentation)

To enable manual instrumentation -
1. Import the open telemetry API and SDK.
2. Configure the open telemetry API -
 With the API imported into your code, you can set up a tracer provider or meter provider. You will get a tracer or meter instance from that provider and give it a name and version.
3. Configure the SDK -
configure the SDK with appropriate options for exporting your telemetry data to some analysis backend. 
4. Create telemetry data -
Traces and metric events can then be created through the tracer and meter objects the default provider has created.
5. Export data - 
-  Directly from a process. This approach requires an additional dependency import on one or more exporters, as well as libraries that translate the in-memory span and metric objects into the appropriate format for your analysis tool. It can also be sent to a collector.
-  Proxying through the collector. The collector is a proxy that can receive data in a variety of formats and send it to one or more backends of your choosing.


Tracing API when running node -

Here in this example mentioned below methods -

- Tracer methods: getTracer, startSpan, startActiveSpan
- Span methods: recordException, setStatus, and end.

More information on these :

https://opentelemetry.io/docs/reference/specification/trace/api/

## steps to follow instrument application manually

1. Initialize a tracer -
To start manual tracing, we need to set up trace provider(TracerProvider) is API entry point that holds configuration.


2. creating new span -
To get what is happening in app by creating spans. To do this grab tracer from opentelemetry API to create spans.

```javascript
app.get('/books', async function (req, res) {
  tracer.startActiveSpan('main', span => {
    //...
  }
}
```

3. Accessing current span -
Set active spans in current context to create spans.

```javascript
const activeSpan = opentelemetry.trace.getSpan(opentelemetry.context.active())
```

4. Setting span status -
status of span used to specify that span has not completed. By default status is Unset.

```javascript
activeSpan.setStatus({code : opentelemetry.SpanStatusCode.ERROR, message: String(e)})
```

5. Recording exceptions -
```javascript 
activeSpan.recordException(e.message)
```
More information on these :

https://opentelemetry.io/docs/instrumentation/js/instrumentation/


### Running app -

- npm run books
- npm run dashboard

###  Output-
Refer detailed view of distributed trace using zipkin exporter of this app:
![image](https://github.com/siddhikhapare/opentelemetry-instrumentation-demo/blob/main/Manual-instrumentation/screenshots/dashboard.PNG)


