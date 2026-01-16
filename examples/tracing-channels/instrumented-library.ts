import { tracingChannel } from 'diagnostics_channel';
import { validateInsert } from './third-party-library.ts';

// This file simulates a library that is instrumented with tracing channels. It has no direct knowledge of OpenTelemetry
// or any other tracing implementation.

// Our library is so kind as to provide type definitions for the messages it publishes to the tracing channel,
// making it easier for instrumentation authors to create rich spans based on the message content.
export interface DbTracingChannelMessage {
  operation: string;
  sql: string;
}
export const DbTracingChannelName = 'db.query';

// Actual implementation of the library:
const dbChannel = tracingChannel<DbTracingChannelMessage>(DbTracingChannelName);

// Simulate a database query using TracingChannel
export async function queryDatabase(operation: string, sql: string): Promise<object> {
  const message: DbTracingChannelMessage = { operation, sql };

  return dbChannel.tracePromise(async () => {
    // Simulate async database work - we're not actually doing anything here.
    await new Promise(resolve => setTimeout(resolve, 10));
    console.log(`Executed: ${sql}`);

    // some operations may use third-party libraries that are "traditionally" instrumented with patching + OTel,
    // but we still want them to be part of the same trace and parented to the currently active span.
    // This simulates such a case.
    if (operation === 'INSERT') {
      await validateInsert();
    }

    return { rows: [] };
  }, message);
}
