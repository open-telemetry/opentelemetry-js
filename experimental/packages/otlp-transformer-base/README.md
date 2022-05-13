# OpenTelemetry Protocol

[![NPM Published Version][npm-img]][npm-url]
[![Apache License][license-image]][license-image]

**NOTE: This package is intended for internal use only.**

This package provides everything needed to serialize [OpenTelemetry SDK][sdk] structures that are shared between signals
to [OpenTelemetry Protocol][otlp] format using [protocol buffers][protobuf] or JSON.

## Quick Start

To get started you will need to install a compatible OpenTelemetry API.

### Install Peer Dependencies

```sh
npm install @opentelemetry/api
 ```

## Useful links

- For more information on OpenTelemetry, visit: <https://opentelemetry.io/>
- For more about OpenTelemetry JavaScript: <https://github.com/open-telemetry/opentelemetry-js>
- For help or feedback on this project, join us in [GitHub Discussions][discussions-url]

## License

Apache 2.0 - See [LICENSE][license-url] for more information.

[discussions-url]: https://github.com/open-telemetry/opentelemetry-js/discussions
[license-url]: https://github.com/open-telemetry/opentelemetry-js/blob/main/LICENSE
[license-image]: https://img.shields.io/badge/license-Apache_2.0-green.svg?style=flat
[npm-url]: https://www.npmjs.com/package/@opentelemetry/otlp-transformer
[npm-img]: https://badge.fury.io/js/%40opentelemetry%otlp-transformer.svg

[sdk]: https://github.com/open-telemetry/opentelemetry-js
[otlp]: https://github.com/open-telemetry/opentelemetry-proto

[protobuf]: https://developers.google.com/protocol-buffers
[grpc]: https://grpc.io/

[protobufjs]: https://www.npmjs.com/package/protobufjs
[grpc-js]: https://www.npmjs.com/package/@grpc/grpc-js
