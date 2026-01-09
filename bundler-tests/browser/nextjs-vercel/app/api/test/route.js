import { defaultResource, defaultServiceName } from '@opentelemetry/resources';
import { trace } from '@opentelemetry/api';
import { BasicTracerProvider } from '@opentelemetry/sdk-trace-base';

export const runtime = 'edge';

export async function GET() {
  const resource = defaultResource();
  const serviceName = defaultServiceName();
  const tracer = trace.getTracer('test');
  const provider = new BasicTracerProvider();

  return Response.json({
    success: true,
    serviceName,
    resourceAttributes: Object.keys(resource.attributes),
    hasTracer: !!tracer,
    hasProvider: !!provider,
  });
}
