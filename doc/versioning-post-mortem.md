# Current state

Current published versions have specified following ranges on the API:
```
┌─────────┬──────────┬───────────────────────────────────────────────────┬──────────────────┬──────────┐
│ (index) │ version  │                       name                        │     apiPeer      │  apiDev  │
├─────────┼──────────┼───────────────────────────────────────────────────┼──────────────────┼──────────┤
│    0    │ '1.1.0'  │               '@opentelemetry/api'                │       null       │   null   │
│    1    │ '1.1.1'  │       '@opentelemetry/context-async-hooks'        │ '>=1.0.0 <1.2.0' │ '~1.1.0' │
│    2    │ '1.1.1'  │      '@opentelemetry/context-zone-peer-dep'       │ '>=1.0.0 <1.2.0' │ '~1.1.0' │
│    3    │ '1.1.1'  │           '@opentelemetry/context-zone'           │       null       │   null   │
│    4    │ '1.1.1'  │               '@opentelemetry/core'               │ '>=1.0.0 <1.2.0' │ '~1.1.0' │
│    5    │ '1.1.1'  │         '@opentelemetry/exporter-jaeger'          │     '^1.0.3'     │ '^1.1.0' │
│    6    │ '1.1.1'  │         '@opentelemetry/exporter-zipkin'          │     '^1.0.3'     │ '^1.1.0' │
│    7    │ '1.1.1'  │          '@opentelemetry/propagator-b3'           │ '>=1.0.0 <1.2.0' │ '~1.1.0' │
│    8    │ '1.1.1'  │        '@opentelemetry/propagator-jaeger'         │ '>=1.0.0 <1.2.0' │ '~1.1.0' │
│    9    │ '1.1.1'  │            '@opentelemetry/resources'             │ '>=1.0.0 <1.2.0' │ '~1.1.0' │
│   10    │ '1.1.1'  │          '@opentelemetry/sdk-trace-base'          │ '>=1.1.0 <1.2.0' │ '~1.1.0' │
│   11    │ '1.1.1'  │          '@opentelemetry/sdk-trace-node'          │ '>=1.1.0 <1.2.0' │ '~1.1.0' │
│   12    │ '1.1.1'  │          '@opentelemetry/sdk-trace-web'           │ '>=1.1.0 <1.2.0' │ '~1.1.0' │
│   13    │ '1.1.1'  │       '@opentelemetry/semantic-conventions'       │       null       │   null   │
│   14    │ '1.1.1'  │         '@opentelemetry/shim-opentracing'         │ '>=1.0.0 <1.2.0' │ '~1.1.0' │
│   15    │ '0.26.2' │ '@opentelemetry/resource-detector-alibaba-cloud'  │     '^1.0.2'     │ '1.0.2'  │
│   16    │ '1.0.3'  │      '@opentelemetry/resource-detector-aws'       │     '^1.0.2'     │ '1.0.2'  │
│   17    │ '0.26.2' │      '@opentelemetry/resource-detector-gcp'       │     '^1.0.2'     │ '1.0.2'  │
│   18    │ '0.26.1' │     '@opentelemetry/resource-detector-github'     │     '^1.0.2'     │ '1.0.2'  │
│   19    │ '0.28.0' │    '@opentelemetry/auto-instrumentations-node'    │     '^1.0.2'     │ '1.0.2'  │
│   20    │ '0.27.2' │    '@opentelemetry/auto-instrumentations-web'     │     '^1.0.2'     │ '1.0.2'  │
│   21    │ '0.27.1' │           '@opentelemetry/host-metrics'           │     '^1.0.2'     │ '1.0.2'  │
│   22    │ '1.0.1'  │      '@opentelemetry/id-generator-aws-xray'       │     '^1.0.2'     │ '1.0.2'  │
│   23    │ '0.27.0' │        '@opentelemetry/propagation-utils'         │     '^1.0.1'     │ '1.0.1'  │
│   24    │ '0.29.0' │        '@opentelemetry/contrib-test-utils'        │     '^1.0.2'     │ '1.0.2'  │
│   25    │ '0.28.0' │     '@opentelemetry/instrumentation-amqplib'      │     '^1.0.1'     │ '1.0.1'  │
│   26    │ '0.2.0'  │        '@opentelemetry/instrumentation-fs'        │     '^1.0.4'     │ '1.0.4'  │
│   27    │ '0.1.0'  │     '@opentelemetry/instrumentation-tedious'      │     '^1.0.2'     │ '1.0.2'  │
│   28    │ '0.30.0' │    '@opentelemetry/instrumentation-aws-lambda'    │     '^1.0.2'     │ '1.0.2'  │
│   29    │ '0.6.0'  │     '@opentelemetry/instrumentation-aws-sdk'      │     '^1.0.1'     │ '1.0.1'  │
│   30    │ '0.27.1' │      '@opentelemetry/instrumentation-bunyan'      │     '^1.0.2'     │ '1.0.2'  │
│   31    │ '0.27.1' │ '@opentelemetry/instrumentation-cassandra-driver' │     '^1.0.2'     │ '1.0.2'  │
│   32    │ '0.27.1' │     '@opentelemetry/instrumentation-connect'      │     '^1.0.2'     │ '1.0.2'  │
│   33    │ '0.27.1' │       '@opentelemetry/instrumentation-dns'        │     '^1.0.2'     │ '1.0.2'  │
│   34    │ '0.28.0' │     '@opentelemetry/instrumentation-express'      │     '^1.0.2'     │ '1.0.2'  │
│   35    │ '0.26.0' │     '@opentelemetry/instrumentation-fastify'      │     '^1.0.2'     │ '1.0.2'  │
│   36    │ '0.27.2' │   '@opentelemetry/instrumentation-generic-pool'   │     '^1.0.2'     │ '1.0.2'  │
│   37    │ '0.27.4' │     '@opentelemetry/instrumentation-graphql'      │     '^1.0.2'     │ '1.0.2'  │
│   38    │ '0.27.1' │       '@opentelemetry/instrumentation-hapi'       │     '^1.0.2'     │ '1.0.2'  │
│   39    │ '0.28.0' │     '@opentelemetry/instrumentation-ioredis'      │     '^1.0.2'     │ '1.0.2'  │
│   40    │ '0.27.1' │       '@opentelemetry/instrumentation-knex'       │     '^1.0.2'     │ '1.0.2'  │
│   41    │ '0.28.1' │       '@opentelemetry/instrumentation-koa'        │     '^1.0.2'     │ '1.0.2'  │
│   42    │ '0.27.1' │    '@opentelemetry/instrumentation-memcached'     │     '^1.0.2'     │ '1.0.2'  │
│   43    │ '0.29.0' │     '@opentelemetry/instrumentation-mongodb'      │     '^1.0.2'     │ '1.0.2'  │
│   44    │ '0.28.0' │      '@opentelemetry/instrumentation-mysql'       │     '^1.0.2'     │ '1.0.2'  │
│   45    │ '0.29.0' │      '@opentelemetry/instrumentation-mysql2'      │     '^1.0.2'     │ '1.0.2'  │
│   46    │ '0.28.3' │   '@opentelemetry/instrumentation-nestjs-core'    │     '^1.0.2'     │ '1.0.2'  │
│   47    │ '0.27.1' │       '@opentelemetry/instrumentation-net'        │     '^1.0.2'     │ '1.0.2'  │
│   48    │ '0.28.0' │        '@opentelemetry/instrumentation-pg'        │     '^1.0.2'     │ '1.0.2'  │
│   49    │ '0.28.1' │       '@opentelemetry/instrumentation-pino'       │     '^1.0.2'     │ '1.0.2'  │
│   50    │ '0.29.0' │      '@opentelemetry/instrumentation-redis'       │     '^1.0.2'     │ '1.0.2'  │
│   51    │ '0.27.2' │     '@opentelemetry/instrumentation-restify'      │     '^1.0.2'     │ '1.0.2'  │
│   52    │ '0.27.1' │      '@opentelemetry/instrumentation-router'      │     '^1.0.2'     │ '1.0.2'  │
│   53    │ '0.27.3' │     '@opentelemetry/instrumentation-winston'      │     '^1.0.2'     │ '1.0.2'  │
│   54    │ '0.27.1' │  '@opentelemetry/instrumentation-document-load'   │     '^1.0.2'     │ '1.0.2'  │
│   55    │ '0.28.0' │    '@opentelemetry/instrumentation-long-task'     │     '^1.0.2'     │ '1.0.2'  │
│   56    │ '0.28.1' │ '@opentelemetry/instrumentation-user-interaction' │     '^1.0.2'     │ '1.0.2'  │
│   57    │ '0.26.1' │        '@opentelemetry/plugin-react-load'         │     '^1.0.2'     │ '1.0.2'  │
│   58    │ '1.0.1'  │       '@opentelemetry/propagator-aws-xray'        │     '^1.0.2'     │ '1.0.2'  │
│   59    │ '0.25.1' │  '@opentelemetry/propagator-grpc-census-binary'   │     '^1.0.2'     │ '1.0.2'  │
│   60    │ '0.25.1' │       '@opentelemetry/propagator-ot-trace'        │     '^1.0.2'     │ '1.0.2'  │
└─────────┴──────────┴───────────────────────────────────────────────────┴──────────────────┴──────────┘
```

- We never directly depend on the API and push that decision to the end user.
- From the API's perspective there are broadly two types of packages: implementing package(implements an abstract interface; like `core` etc) and "using" package(calls API's methods; like an instrumentation (1)).
- Upper limit on peer deps are set on packages(`sdk-trace-node` etc) which **implement** an abstract interface(any other cases?) from the API. Reason being that when the abstract interface in the API gets a new abstract field, the implementing package build would break if they already do not implement that field.
- The consensus until now has been that such implementing packages would have to validate their compatibility every time the API is released and update the peerDep range for the API acordingly. It's perhaps a bit obvious, but really important to note that in order to do that, they have to release a new verison with that new peerDep range and thus force all users that need to use a newer API to update that dependency of implementing package as well.


Footnotes:

1. That would clearly be the case if a library(let's say `express`) would natively implement OTel support. Our instrumentations technically "implement" by extending, but the abstraction is created and implemented in `instrumentation` package and thus doesn't cause the same kind of situation as widely as the API does.

# What happened

1. Contrib packages were depending on the latest API as were all their dependencies so API version was locked down to a minor version(`1.0.x`).
2. New API version(`1.1.x`) was released. Nothing happened(I think, it's really difficult to test without publishing few mock packages and trying it out with different versions of npm) because the peer dependencies were on the same page: `1.1.x` API should not be allowed because of the implementing packages in the dependency tree.
3. New versions of core packages were released. Now, since contrib packages expect semver rules to be followed and specify `sdk-trace-node@^1.0.0` as a dependency for example, `sdk-trace-web@1.1.0` will be installed.
4. `sdk-trace-node@1.1.x` changes the minimum allowed API version going from `>=1.0.0 <1.1.0` to `>=1.1.0 <1.2.0` essentially, breaking backwards compatibility through that and violating the semver. In this case, breakage happens not because of the increased upper bound, but because of the increased lower bound.

In essence, we only version the API from the perspective of "using" package not an implementing one. Ignoring that have caused the problems and will continue to do so in the future.

# Conclusion

#### Core package versioning

Decreasing range of API support should be considered a breaking change, semver major bump for a **core package**, because it will break well-meaning users.

#### API versioning

**Changing** abstract interfaces in the API should be considered a breaking change, a semver major bump for the API, because it will break well-meaning SDK implementors.
The work-around of setting upper-bounds to the supported API in implementing packages is exactly what major versions is used for in semver. Trying to force those changes into minor version bumps is causing us the problems.

#### Avoiding interfaces or their changes

Another way to avoid changes that are essentially API major bumps is to never change the interfaces. If we needed to update those a new one should be created instead. That's not something I've thought out yet.

#### Legacy peer deps isn't our friend

We've turned on legacy peer deps in our CI builds to let Lerna hoist deps and not have npm cause issues while it's doing so.

When legacy peed deps is turned on. npm install works without problems, but the build fails:

```
node_modules/@opentelemetry/sdk-trace-base/build/src/BasicTracerProvider.d.ts:1:29 - error TS2614: Module '"@opentelemetry/api"' has no exported member 'TracerOptions'. Did you mean to use 'import TracerOptions from "@opentelemetry/api"' instead?

1 import { TextMapPropagator, TracerOptions, TracerProvider } from '@opentelemetry/api';
                              ~~~~~~~~~~~~~

node_modules/@opentelemetry/sdk-trace-base/build/src/BasicTracerProvider.d.ts:1:29 - error TS2614: Module '"@opentelemetry/api"' has no exported member 'TracerOptions'. Did you mean to use 'import TracerOptions from "@opentelemetry/api"' instead?

1 import { TextMapPropagator, TracerOptions, TracerProvider } from '@opentelemetry/api';
```

Further investigation makes it clear, why:

```
❯ npm list @opentelemetry/api
@opentelemetry/instrumentation-document-load@0.27.1 /home/rauno/projects/splunk/opentelemetry-js-contrib/plugins/web/opentelemetry-instrumentation-document-load
├── @opentelemetry/api@1.0.2
├─┬ @opentelemetry/core@1.1.1
│ └── @opentelemetry/api@1.0.2 deduped
├─┬ @opentelemetry/instrumentation@0.27.0
│ └── @opentelemetry/api@1.0.2 deduped
├─┬ @opentelemetry/sdk-trace-base@1.1.1
│ ├── @opentelemetry/api@1.0.2 deduped invalid: ">=1.1.0 <1.2.0" from node_modules/@opentelemetry/sdk-trace-base
│ └─┬ @opentelemetry/resources@1.1.1
│   └── @opentelemetry/api@1.0.2 deduped invalid: ">=1.1.0 <1.2.0" from node_modules/@opentelemetry/sdk-trace-base, ">=1.1.0 <1.2.0" from node_modules/@opentelemetry/sdk-trace-web
└─┬ @opentelemetry/sdk-trace-web@1.1.1
  └── @opentelemetry/api@1.0.2 deduped invalid: ">=1.1.0 <1.2.0" from node_modules/@opentelemetry/sdk-trace-base, ">=1.1.0 <1.2.0" from node_modules/@opentelemetry/sdk-trace-web

npm ERR! code ELSPROBLEMS
npm ERR! invalid: @opentelemetry/api@1.0.2 /home/rauno/projects/splunk/opentelemetry-js-contrib/plugins/web/opentelemetry-instrumentation-document-load/node_modules/@opentelemetry/api

npm ERR! A complete log of this run can be found in:
npm ERR!     /home/rauno/.npm/_logs/2022-03-25T13_08_12_623Z-debug.log
```

The behavior would be a little different if we would **not** turn legacy peer deps on - we'd get an error during npm install:

```
❯ npm i
npm ERR! code ERESOLVE
npm ERR! ERESOLVE unable to resolve dependency tree
npm ERR! 
npm ERR! While resolving: @opentelemetry/instrumentation-document-load@0.27.1
npm ERR! Found: @opentelemetry/api@1.0.2
npm ERR! node_modules/@opentelemetry/api
npm ERR!   dev @opentelemetry/api@"1.0.2" from the root project
npm ERR! 
npm ERR! Could not resolve dependency:
npm ERR! peer @opentelemetry/api@">=1.1.0 <1.2.0" from @opentelemetry/sdk-trace-base@1.1.1
npm ERR! node_modules/@opentelemetry/sdk-trace-base
npm ERR!   @opentelemetry/sdk-trace-base@"^1.0.0" from the root project
npm ERR! 
npm ERR! Fix the upstream dependency conflict, or retry
npm ERR! this command with --force, or --legacy-peer-deps
npm ERR! to accept an incorrect (and potentially broken) dependency resolution.
npm ERR! 
npm ERR! See /home/rauno/.npm/eresolve-report.txt for a full report.

npm ERR! A complete log of this run can be found in:
npm ERR!     /home/rauno/.npm/_logs/2022-03-25T13_09_21_795Z-debug.log
```

That's much more clear for an user and would be helpful in our CI as well, because we cannot just "log into GHA" and start investigating around.

## References

- https://github.com/open-telemetry/opentelemetry-specification/issues/2018
- https://github.com/open-telemetry/opentelemetry-specification/issues/1457
