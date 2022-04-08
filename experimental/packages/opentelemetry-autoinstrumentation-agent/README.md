# OpenTelemetry Auto Instrumentation Agent

This package provides a mechanism that allows you to inject opentelmetry instrumentation into your JavaScript application

## Quick Start

Install the package:

```shell
npm install @opentelemetry/auto-instrumentation-agent
```

Start your node.js application as you are used to it but add a require statement to it:

```shell
node --require '@opentelemetry/auto-instrumentation-agent' app.js
```

For configuration you can provide different environment variables, e.g. if you want to change the log level and the exporter:

```shell
env OTEL_SERVICE=my-app OTEL_LOG_LEVEL=debug OTEL_TRACES_EXPORTER=logger node --require '@opentelemetry/auto-instrumentation-agent' app.js
```

If your `node` is encapsulated in a complex run script, you can also set it via an environment variable.

Let's say you have a `run.sh` that sets up a few things, before running `node` you can add the agent like the following:

```shell
env NODE_OPTIONS="--require @opentelemetry/auto-instrumentation-agent" ./run.sh
```

Of course you can load the agent as requirement in your source code. Put it at the very top of your `js` file

```shell
require('@opentelemetry/auto-instrumentation-agent')
```

## Why?

Think about this package as an equivalent to the [java instrumentation](https://github.com/open-telemetry/opentelemetry-java-instrumentation): It's an easy to use, convenient way to install OpenTelemetry into an existing application. It could simplify lots of things:

### End-users don't have to install multiple packages to get started

Instead of needing to install sdk-node, api, auto-instrumentation-node, otlp-exporters, etc. end-users can just install one package and go with it.

(They still can choose to cobble together the things they want to have)

### End-users don't have to choose manually which instrumentation libraries they need (maybe they don't know!)

Similar to java ([look at this list!](https://github.com/open-telemetry/opentelemetry-java-instrumentation/tree/main/instrumentation)), this agent will include as many instrumentations ootb as possible. Especially when the person adding observability to an app is not the same person who wrote the code, they can just get started!

### Streamlined configuration

Not yet implemented, the auto instrumentation agent can manage environment variables and have the same behavior as other languages, making it super easy for people running
polyglot applications to instrument multiple of them.

The following is probably a bad example / should not be done in reality, but it represents what is possible

```shell
export OTEL_TRACES_EXPORTER="otlp"
export OTEL_EXPORTER_OTLP_PROTOCOL="http/protobuf"
export OTEL_EXPORTER_OTLP_COMPRESSION="gzip"
export OTEL_EXPORTER_OTLP_TRACES_ENDPOINT="https://your-endpoint"
export OTEL_EXPORTER_OTLP_HEADERS="x-api-key=your-api-key"
export OTEL_EXPORTER_OTLP_TRACES_HEADERS="x-api-key=your-api-key"
export OTEL_RESOURCE_ATTRIBUTES="service.namespace=my-namespace"
export OTEL_SERVICE_NAME="client"
export NODE_OPTIONS="--require @opentelemetry/auto-instrumentation-agent"
export JAVA_OPTS="-javaagent:opentelemetry-javaagent.jar"
export PYTHON_OPTIONS="I have no idea how this works in python ..."
export PHP_OPTIONS="tbd"
export DOTNET_OPTIONS="tbd"
# ... you get the gist ...

./run-java-and-node-js-and-python-app.sh
```

### Simplification for auto injection of auto instrumentation

The OpenTelemetry Operator for Kuernetes allows auto instrumentation for node.js, java, python. Java is super simple:

```Dockerfile
FROM busybox
ARG version
ADD https://github.com/open-telemetry/opentelemetry-java-instrumentation/releases/download/v$version/opentelemetry-javaagent.jar /javaagent.jar
RUN chmod -R go+r /javaagent.jar
```

For nodejs it's more complex:

```Dockerfile
FROM node:16 AS build
WORKDIR /operator-build
COPY . .
RUN npm install
FROM busybox
COPY --from=build /operator-build/build/workspace /autoinstrumentation
RUN chmod -R go+r /autoinstrumentation
```

There's additionally a package.json, a tsconfig.json, an autoinstrumentation.ts (which is the base of this package) that need to be loaded (and with that maintained). 

This package could simplify things:

```
<to be defined>
```


## Configuration

(The following is **NOT** implemented, but outlays what is possible)

The agent is highly configurable. Many aspects of the agent's behavior can be configured for your needs, such as exporter choice, exporter config (like where data is sent), trace context propagation headers, and much more.

For example if you want to change the default exporter from console to OTLP, authenticate with your backend and set some resource attributes:

```shell
export OTEL_TRACES_EXPORTER="otlp"
export OTEL_EXPORTER_OTLP_PROTOCOL="http/protobuf"
export OTEL_EXPORTER_OTLP_COMPRESSION="gzip"
export OTEL_EXPORTER_OTLP_TRACES_ENDPOINT="https://your-endpoint"
export OTEL_EXPORTER_OTLP_HEADERS="x-api-key=your-api-key"
export OTEL_EXPORTER_OTLP_TRACES_HEADERS="x-api-key=your-api-key"
export OTEL_RESOURCE_ATTRIBUTES="service.namespace=my-namespace"
export OTEL_SERVICE_NAME="client"
export NODE_OPTIONS="--require @opentelemetry/auto-instrumentation-agent"
node app.js
```

[Click here to see the detailed list of configuration environment variables and system properties.](https://opentelemetry.io/docs/instrumentation/java/automatic/agent-config/)

## Creating agent extensions

(The following is **NOT** implemented, but outlays what is possible. **It is open for debate!**)

Extensions add new features and capabilities to the agent without having to create a separate distribution or to fork this repository. For example, you can create custom samplers or span exporters, set new defaults, and simply load them along with the agent:

```shell
export NODE_OPTIONS="--require @opentelemetry/auto-instrumentation-agent --require @vendor/extensions"
node app.js
```