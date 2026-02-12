import { tracingChannel } from 'diagnostics_channel';
import { SpanStatusCode, trace } from '@opentelemetry/api';

// note: a neat feature of tracing channel instrumentation is that we can import stuff from the instrumented library
// without it being loaded affecting instrumentation. This way we can not only use types, but even constants easily.
import {
  type LibraryOperationsMessage,
  LIBRARY_CHANNEL_NAME
} from './instrumented-library.ts';
import {
  isEnding,
  subscriberWithContextManagement,
} from './tracing-channel-helpers.ts';

// INSTRUMENTATION: this is where we subscribe to the tracing channel and create spans based on the messages.
// With subscriberWithContextManagement, context attach/detach is handled automatically, though the option remains to
// handle things manually. In this example the wrapper allows us to focus on span creation and attributes.
export function libraryOperationInstrumentation() {
  const libraryChannel = tracingChannel<LibraryOperationsMessage>(
    LIBRARY_CHANNEL_NAME
  );
  const tracer = trace.getTracer('any-operation-tracing-channel-tracer');

  libraryChannel.subscribe(
    subscriberWithContextManagement({
      onStart(message, span) {
        console.log(
          `[TracingChannel] instrumenting start for operation with message:`,
          message,
        );
        // Return existing span if available, or create a new one
        // The wrapper will automatically handle context management
        // note: in reality, what we're doing here would be more exciting - like determining attributes etc.
        // but for this example, we're just taking the name and put it directly on the span.
        return span ?? tracer.startSpan(message.opName ?? `unknownOperation`);
      },
      onAsyncStart(message, span) {
        console.log(
          `[TracingChannel] instrumenting async start for operation with message:`,
          message,
        );
        // Return existing span if available, or create a new one
        // The wrapper will automatically handle async context management
        return span ?? tracer.startSpan(message.opName ?? `unknownOperation`);
      },
      onEnd(message, span) {
        console.log(
          `[TracingChannel] instrumenting async start for operation with message:`,
          message,
        );
        // End the span - context restoration is handled automatically by the wrapper
        if (isEnding(message)) {
          span?.end()
        }
      },
      onAsyncEnd(message, span) {
        console.log(
          `[TracingChannel] async end for async operation with message:`,
          message,
        );
        // End the span - context restoration is handled automatically by the wrapper
        // whenever async end is called, we're sure that the span should be ended.
        span?.end();
      },
      onError(message, span) {
        console.log(
          `[TracingChannel] error for async operation with message:`,
          message,
        );
        // Record the error on the span
        if (span) {
          span.recordException(message.error as Error);
          span.setStatus({
            code: SpanStatusCode.ERROR,
            message: (message.error as Error).message,
          });
        }
      },
    })
  );
}
