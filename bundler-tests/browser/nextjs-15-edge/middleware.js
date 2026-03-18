import { defaultServiceName } from '@opentelemetry/resources';

export function middleware(request) {
  const serviceName = defaultServiceName();
  console.log('Service name:', serviceName);
  return Response.next();
}

export const config = {
  matcher: '/api/:path*',
};
