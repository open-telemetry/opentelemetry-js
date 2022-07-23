# Zipkin traces and span

![demopic](https://github.com/siddhikhapare/Opentelemetry-tracing-examples/blob/main/tracing/tracingshots/date-zipkin.PNG)


On the right, we have tags that contain relevant information about the trace. For example, an HTTP request would include details about the path, user_agent,remoteEndpoint. On the left, we have tree view of the trace,showing the different spans that happened during the request. In this request, we have 4 spans(1 parent and 3 children). All these spans recorded automatically using by HttpInstrumentation and Expressnstrumentation which configured with opentelemetry.

