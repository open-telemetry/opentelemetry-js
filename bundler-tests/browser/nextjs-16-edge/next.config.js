/** @type {import('next').NextConfig} */
const nextConfig = {
  // Next.js 16 defaults to Turbopack. Turbopack handles `node:module`
  // (and other node built-in scheme imports) natively for browser builds,
  // so no extra config is needed for the rolldown runtime helper that
  // tsdown emits for ESM->CJS interop in @opentelemetry/otlp-transformer.
  turbopack: {},
};

export default nextConfig;
