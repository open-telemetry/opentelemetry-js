/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { dev, webpack }) => {
    // tsdown's rolldown runtime emits `import { createRequire } from "node:module"`
    // for ESM->CJS interop (e.g. protobufjs in @opentelemetry/otlp-transformer).
    // Strip the `node:` prefix and stub the module for browser builds; the
    // createRequire helper isn't reached on browser code paths.
    config.plugins.push(
      new webpack.NormalModuleReplacementPlugin(/^node:/, resource => {
        resource.request = resource.request.replace(/^node:/, '');
      })
    );
    config.resolve = config.resolve || {};
    config.resolve.fallback = {
      ...(config.resolve.fallback || {}),
      module: false,
      path: false,
      fs: false,
      util: false,
      os: false,
    };

    // Treat warnings as errors
    config.plugins.push({
      apply: compiler => {
        compiler.hooks.done.tap('FailOnWarnings', stats => {
          if (stats.compilation.warnings.length > 0) {
            console.error(stats.compilation.warnings.join('\n'));
            throw new Error('Webpack build has warnings');
          }
        });
      },
    });
    return config;
  },
};

export default nextConfig;
