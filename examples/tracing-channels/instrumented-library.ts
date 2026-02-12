import { tracingChannel } from 'diagnostics_channel';
import { thirdPartyLibraryOperation } from './third-party-library.ts';

// This file simulates a library that is instrumented with tracing channels. It has no direct knowledge of OpenTelemetry
// or any other tracing implementation.

// Our library is so kind as to provide type definitions for the messages it publishes to the tracing channel,
// making it easier for instrumentation authors to create rich spans based on the message content.
export interface LibraryOperationsMessage {
  opName?: string;
}
export const LIBRARY_CHANNEL_NAME = 'tracing:@opentelemetry/tracing-channels:instrumented-library:all-ops-operation';

const libraryChannel = tracingChannel(LIBRARY_CHANNEL_NAME);

async function waitSomeTime() {
  return new Promise(resolve => setTimeout(resolve, 10));
}

export async function asyncOperation(): Promise<void> {
  await libraryChannel.tracePromise(async () => {await waitSomeTime()}, { opName: 'asyncOperation' });
}

export async function asyncOperationWithError(): Promise<void> {
  await libraryChannel.tracePromise(async () => {
    await waitSomeTime();
    throw new Error('Something went wrong!');
  }, { opName: 'asyncOperationWithError' });
}

export function syncOperation() {
  libraryChannel.traceSync(() => { /* do some sync work */ }, { opName: 'syncOperation' });
}

export function syncOperationWithError() {
  libraryChannel.traceSync(() => {
    /* do some sync work */
    throw new Error('Something went wrong!');
  });
}

export function recursiveAsyncOperation(depth: number): Promise<void> {
  return libraryChannel.tracePromise(
    async () => {
      if (depth > 0) {
        await recursiveAsyncOperation(depth - 1);
      } else {
        await waitSomeTime();
      }
    },
    { opName: 'recursiveAsyncOperation' }
  );
}

export function recursiveSyncOperation(depth: number): void {
  libraryChannel.traceSync(
    () => {
      if (depth > 0) {
        recursiveSyncOperation(depth - 1);
      } else {
        /* do some sync work */
      }
    },
    { opName: 'recursiveSyncOperation' }
  );
}

async function asyncOperationCallsOTelInstrumentedLibrary(): Promise<void> {
  await libraryChannel.tracePromise(async () => {
    // some operations may use third-party libraries that are "traditionally" instrumented with patching + OTel,
    // but we still want them to be part of the same trace and parented to the currently active span.
    // This simulates such a case.
    await thirdPartyLibraryOperation()
  }, { opName: 'asyncOperationCallsOTelInstrumentedLibrary' });
}

async function asyncOperationErrorsInSyncPart(): Promise<void> {
  await libraryChannel.tracePromise(async () => {
    throw new Error('Error in sync part of async operation');
    await waitSomeTime();
  }, { opName: 'asyncOperationErrorsInSyncPart' });
}


export async function asyncOperationCallsOtherOperations(): Promise<void> {
  await libraryChannel.tracePromise(async () => {
    syncOperation();
    await waitSomeTime();
    await asyncOperation();
    try {
      syncOperationWithError();
    } catch (error) {
      // ignore
    }
    try {
      await asyncOperationWithError();
    } catch (error) {
      // ignore
    }
    recursiveSyncOperation(4);
    await recursiveAsyncOperation(3);
    await asyncOperationCallsOTelInstrumentedLibrary();
  }, { opName: 'asyncOperationCallsOtherOperations' });
}
