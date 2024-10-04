# Scope Manager Omission

In the OpenTelemetry shim for OpenTracing, a "scope manager" was initially intended to be implemented. However, this feature was never added. As a result, there is no support for a scope manager in this shim.

If your project relies on scope management, you may need to explore alternative solutions or contribute further to this part of the project. Currently, the omission of this feature is by design, and it is documented here to avoid confusion for developers who may expect this functionality.

