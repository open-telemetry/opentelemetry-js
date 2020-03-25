# Language Independent Interface Types For OpenTelemetry

The proto files can be consumed as GIT submodule or copied over and built directly in the consumer project.

The compiled files are published to central repositories (Maven, NPM...) from OpenTelemetry client libraries.

See [contribution guidelines](CONTRIBUTING.md) if you would like to make any changes.

## Maturity Level

Component                | Maturity |
-------------------------|----------|
collector/metrics/*      | Alpha    |
collector/trace/*        | Beta     |
common/*                 | Beta     |
metrics/*                | Alpha    |
resource/*               | Beta     |
trace/trace.proto        | Beta     |
trace/trace_config.proto | Alpha    |

(See [maturity-matrix.yaml](https://github.com/open-telemetry/community/blob/47813530864b9fe5a5146f466a58bd2bb94edc72/maturity-matrix.yaml#L57)
for definition of maturity levels).