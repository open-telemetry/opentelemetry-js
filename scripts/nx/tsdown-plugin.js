const { existsSync } = require('fs');
const { join } = require('path');

/**
 * Nx plugin that infers compile targets for packages using tsdown.
 *
 * If a package has a tsdown.config.ts file, this plugin adds:
 * - A compile target that runs tsdown and tsc for declarations
 */
exports.createNodesV2 = [
  '**/tsdown.config.ts',
  (configFiles, options, context) => {
    return configFiles.map((configFile) => {
      const projectRoot = configFile.replace('/tsdown.config.ts', '');
      const packageJsonPath = join(context.workspaceRoot, projectRoot, 'package.json');

      if (!existsSync(packageJsonPath)) {
        return [configFile, {}];
      }

      return [
        configFile,
        {
          projects: {
            [projectRoot]: {
              targets: {
                compile: {
                  executor: 'nx:run-commands',
                  options: {
                    commands: [
                      'npx tsc -p tsconfig.dts.json',
                      'npx tsdown',
                    ],
                    cwd: projectRoot,
                    parallel: false,
                  },
                  inputs: [
                    '{projectRoot}/src/**/*.ts',
                    '{projectRoot}/tsdown.config.ts',
                    '{projectRoot}/tsconfig.dts.json',
                  ],
                  outputs: ['{projectRoot}/build'],
                },
              },
            },
          },
        },
      ];
    });
  },
];
