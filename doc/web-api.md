# Web API Usages Guidance

The packages of OpenTelemetry that targeting web platforms should be compatible
with the following web environments:

- [Browsing Context](https://developer.mozilla.org/en-US/docs/Glossary/Browsing_context),
- [Web Worker](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Functions_and_classes_available_to_workers).

As such, the usage of Web API that depends on APIs like [`window`],
[`document`] and [`navigator`] is discouraged.

If the use of the browsing context API is necessary, like adding `onload`
listeners, an alternative code path for Web Worker environment should also be
supported.

It is an exception to above guidance if the package is instrumenting the
browsing context only.

[`window`]: https://developer.mozilla.org/en-US/docs/Web/API/window
[`document`]: https://developer.mozilla.org/en-US/docs/Web/API/Document
[`navigator]: https://developer.mozilla.org/en-US/docs/Web/API/Navigator
