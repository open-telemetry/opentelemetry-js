/** @type {import('next').NextConfig} */
const nextConfig = {
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
