# Plugin Developer Guide

The `NodeTracerProvider` or `Node-SDK` is driven by a set of plugins that describe how to patch a module to generate trace spans when that module is used. We provide out-of-the-box instrumentation for many popular frameworks and libraries by using a plugin system (see [builtin plugins][builtin-plugins]), and provide a means for developers to create their own.

We strongly recommended to create a dedicated package for newly added plugin, example: `@opentelemetry/plugin-xxx`.

Each plugin must extend the abstract class [BasePlugin][base-plugin] implementing the below methods:

- `patch`: A function describing how the module exports for a given file should be modified.

- `unpatch`: A function describing how the module exports for a given file should be unpatched. This should generally mirror the logic in `patch`; for example, if `patch` wraps a method, `unpatch` should unwrap it.

The core `PluginLoader` class is responsible for loading the instrumented plugins that use a patch mechanism to enable automatic tracing for specific target modules. In order to load new plugin, it should export `plugin` identifier.

```typescript
export const plugin = new HttpPlugin(...);
```

> Example of simple module plugin created and used in the tests.
<https://github.com/open-telemetry/opentelemetry-js/blob/master/packages/opentelemetry-node/test/instrumentation/node_modules/%40opentelemetry/plugin-simple-module/simple-module.js>

After the plugin is created, it must be added in the [list of default supported plugins][DEFAULT_INSTRUMENTATION_PLUGINS].

```typescript
export const DEFAULT_INSTRUMENTATION_PLUGINS: Plugins = {
  http: {
    enabled: true,
    path: '@opentelemetry/plugin-http',
  },
  grpc: {
    enabled: true,
    path: '@opentelemetry/plugin-grpc',
  },
  // [ADD NEW PLUGIN HERE]
  xxx: {
    enabled: true,
    // You may use a package name or absolute path to the file.
    path: '@opentelemetry/plugin-xxx',
  }
};
```

We recommend using [`shimmer`][shimmer] to modify function properties on objects.

Please refer to the [HTTP instrumentation][http-plugin] or [gRPC instrumentation][grpc-plugin] for more comprehensive examples.

[shimmer]: https://github.com/othiym23/shimmer
[builtin-plugins]: https://github.com/open-telemetry/opentelemetry-js#plugins
[base-plugin]: https://github.com/open-telemetry/opentelemetry-js/blob/master/packages/opentelemetry-core/src/platform/node/BasePlugin.ts
[http-plugin]: https://github.com/open-telemetry/opentelemetry-js/blob/master/packages/opentelemetry-plugin-http/src/http.ts#L44
[grpc-plugin]: https://github.com/open-telemetry/opentelemetry-js/blob/master/packages/opentelemetry-plugin-grpc/src/grpc.ts#L52
[DEFAULT_INSTRUMENTATION_PLUGINS]: https://github.com/open-telemetry/opentelemetry-js/blob/master/packages/opentelemetry-node/src/config.ts#L29
