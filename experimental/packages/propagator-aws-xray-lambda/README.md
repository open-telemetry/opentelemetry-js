# OpenTelemetry Propagator AWS X-Ray-Lambda

[![NPM Published Version][npm-img]][npm-url]
[![Apache License][license-image]][license-image]

**Note: This is an experimental package under active development. New releases may include breaking changes.**

The OpenTelemetry Propagator for AWS X-Ray Lambda provides propagation based on the X-Ray `_X_AMZN_TRACE_ID` environment
variable in addition to the AWS X-Ray HTTP headers. This propagator should be used only for an AWS Lambda instrumentation.

## Usage

The preferred method for using this propagator is by using the `OTEL_PROPAGATORS` environment variable. For more details,
see the [semantic conventions specification for AWS Lambda](https://github.com/open-telemetry/semantic-conventions/blob/main/docs/faas/aws-lambda.md).

## Propagator Details

The propagator extracts context from the `_X_AMZN_TRACE_ID` environment variable, except when there is already another
context active. It also automatically uses the [AWS X-Ray propagator](https://github.com/open-telemetry/opentelemetry-js-contrib/tree/main/propagators/opentelemetry-propagator-aws-xray).

## Useful links

- For more information on OpenTelemetry, visit: <https://opentelemetry.io/>
- For more about OpenTelemetry JavaScript: <https://github.com/open-telemetry/opentelemetry-js>
- For help or feedback on this project, join us in [GitHub Discussions][discussions-url]

## License

Apache 2.0 - See [LICENSE][license-url] for more information.

[discussions-url]: https://github.com/open-telemetry/opentelemetry-js/discussions
[license-url]: https://github.com/open-telemetry/opentelemetry-js/blob/main/LICENSE
[license-image]: https://img.shields.io/badge/license-Apache_2.0-green.svg?style=flat
[npm-url]: https://www.npmjs.com/package/@opentelemetry/propagator-aws-xray
[npm-img]: https://badge.fury.io/js/%40opentelemetry%2Fpropagator-aws-xray.svg
