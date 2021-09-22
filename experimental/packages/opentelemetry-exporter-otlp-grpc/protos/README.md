# Language Independent Interface Types For OpenTelemetry

The proto files can be consumed as GIT submodule or copied over and built directly in the consumer project.

The compiled files are published to central repositories (Maven, NPM...) from OpenTelemetry client libraries.

See [contribution guidelines](CONTRIBUTING.md) if you would like to make any changes.

## Maturity Level

Component                            | Maturity |
-------------------------------------|----------|
**Binary Protobuf Encoding**         |          |
collector/metrics/*                  | Alpha    |
collector/trace/*                    | Stable   |
common/*                             | Stable   |
metrics/*                            | Alpha    |
resource/*                           | Stable   |
trace/trace.proto                    | Stable   |
trace/trace_config.proto             | Alpha    |
**JSON encoding**                    |          |
All messages                         | Alpha    |

(See [maturity-matrix.yaml](https://github.com/open-telemetry/community/blob/47813530864b9fe5a5146f466a58bd2bb94edc72/maturity-matrix.yaml#L57)
for definition of maturity levels).

Note that maturity guarantees apply only to wire-level compatibility for the binary
Protobuf serialization. Neither message, field, nor enum names of Protobuf messages
are visible on the wire and are not considered part of the guarantees. We are free
to make change to the names.

In the future when OTLP/JSON is declared stable, field names will also become part of
the maturity guarantees, since field names are visible on the wire for JSON encoding.

## Experiments

In some cases we are trying to experiment with different features. In this case
we recommend using an "experimental" sub-directory instead of adding them to any
protocol version. These protocols should not be used, except for
development/testing purposes.

Another review must be conducted for experimental protocols to join the main project.
