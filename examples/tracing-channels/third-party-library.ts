import { trace } from '@opentelemetry/api';

const tracer = trace.getTracer('third-party-library');

export async function validateInsert() {
  await tracer.startActiveSpan('db.query.INSERT.validate', async (validateSpan) => {
    console.log('  [Nested Span] Validating INSERT operation...');
    validateSpan.setAttribute('validation.result', 'success');
    await new Promise(resolve => setTimeout(resolve, 5));
    validateSpan.end();
  });
}
