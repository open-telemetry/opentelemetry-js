# Contributing

Read OpenTelemetry project [contributing
guide](https://github.com/open-telemetry/community/blob/master/CONTRIBUTING.md)
for general information about the project.

## Prerequisites

- Protocol Buffers compiler `protoc`.
- Protocol Buffers Go compiler `protoc-gen-go`.

Install manually or use:

- `install-proto.sh` (if on Linux).
    - Requires: `bash`, `wget`, `unzip`, `go`, and `sudo`.
    - The default install directory is `/usr/local` for all downloaded binaries and libraries.
      This location can be overridden by passing an alternate location to the script.
      For example installing artifacts in `/opt`:
      ```
      ./install-proto.sh /opt
      ```
- `install-proto-osx.sh` (for mac).

## Making changes to the .proto files

Non-backward compatible changes to .proto files are permitted until protocol schema is
declared complete.

After making any changes to .proto files make sure to generate Go implementation by
running `make gen-go`. Generated files must be included in the same commit as the .proto
files.
