import { trace } from '@opentelemetry/api';

const tracer = trace.getTracer('third-party-library');

export async function thirdPartyLibraryOperation() {
  await tracer.startActiveSpan('thirdPartyLibraryOperation', async (thirdPartyLibSpan) => {
    await new Promise(resolve => setTimeout(resolve, 5));
    thirdPartyLibSpan.end();
  });
}
