/** @type {import('next').NextConfig} */
const nextConfig = {
  // Bundle test verifies OTel compiles for the edge runtime, not user-code lint.
  // Next 15 still runs ESLint at build; root ESLint 10 dropped the eslintrc API
  // its integration needs, breaking JSX parsing. Next 16 dropped this step.
  eslint: { ignoreDuringBuilds: true },
  webpack: (config, { dev }) => {
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
