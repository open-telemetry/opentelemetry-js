# Overview OpenTelemetry GraphQL Plugin

[![NPM Published Version][npm-img]][npm-url]

This example shows how to use 2 popular graphql servers
- [Apollo GraphQL](https://www.npmjs.com/package/apollo-server)
- [GraphQL HTTP Server Middleware](https://www.npmjs.com/package/express-graphql)

and [@opentelemetry/plugin-graphql](https://github.com/open-telemetry/opentelemetry-js/tree/master/packages/opentelemetry-plugin-graphql) to instrument a simple Node.js application.

This plugin should work with any graphql server as it instruments graphql directly.


This example will export spans data simultaneously using [Exporter Collector](https://github.com/open-telemetry/opentelemetry-js/tree/master/packages/opentelemetry-exporter-collector).

## Installation

```shell script
# from this directory
npm install
```

## Run the Application

1. Run docker

    ```shell script
    # from this directory
    npm run docker:start
    ```

2. Run server - depends on your preference

    ```shell script
    # from this directory
    npm run server:express
   // or
    npm run server:apollo
    ```

3. Open page at <http://localhost:9411/zipkin/> -  you should be able to see the spans in zipkin

4. Run example client

    ```shell script
    # from this directory
    npm run client
    ```

5. You can also write your own queries, open page http://localhost:4000/graphql


## Useful links

- For more information on OpenTelemetry, visit: <https://opentelemetry.io/>
- For more information on tracing, visit: <https://github.com/open-telemetry/opentelemetry-js>

## LICENSE

Apache License 2.0
[npm-url]: https://www.npmjs.com/package/@opentelemetry/plugin-graphql
[npm-img]: https://badge.fury.io/js/%40opentelemetry%2Fplugin-graphql.svg
