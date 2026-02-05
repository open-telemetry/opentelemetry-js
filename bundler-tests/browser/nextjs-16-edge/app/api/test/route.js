import { defaultServiceName } from '@opentelemetry/resources';

export const runtime = 'edge';

export function GET(request) {
  const serviceName = defaultServiceName();
  return new Response(JSON.stringify({ serviceName }), {
    headers: { 'Content-Type': 'application/json' },
  });
}
