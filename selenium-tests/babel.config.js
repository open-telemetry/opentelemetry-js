module.exports = function (api) {
  api.cache(true);
  const presets = [
    [
      '@babel/preset-env',
      {
        corejs: {
          version: '3',
          proposals: true,
        },
        useBuiltIns: 'entry',
        targets: {
            // 'edge': 16,
            // 'safari': 9,
            // 'firefox': 57,
            'ie': 11,
            // 'ios': 9,
            // 'chrome': 49,
        },
      },
    ],
  ];
  const plugins = [
    ['@babel/plugin-proposal-decorators', { decoratorsBeforeExport: true }],
    ['@babel/plugin-proposal-class-properties', { 'loose': true }],
    ["@babel/plugin-proposal-private-methods", { "loose": true }],
    ["@babel/plugin-proposal-private-property-in-object", { "loose": true }],
  ];
  return {
    presets,
    plugins,
  };
};