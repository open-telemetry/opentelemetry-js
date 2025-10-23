# Configuration Generation Scripts

This directory contains scripts for generating TypeScript types from the OpenTelemetry Configuration Schema.

## Overview

1. **`generate-config.js`** - Main generation script that:
   - Runs `generate_config.sh` to clone the repository and generate types
   - Post-processes the generated file by adding OpenTelemetry license header and auto-generation notices

2. **`generate_config.sh`** - Bash script that:
   - Clones the [opentelemetry-configuration](https://github.com/open-telemetry/opentelemetry-configuration) repository
   - Uses [json-schema-to-typescript](https://www.npmjs.com/package/json-schema-to-typescript) to generate TypeScript types from the JSON schema
   - Outputs generated types to `experimental/packages/opentelemetry-configuration/src/generated/`

## Usage

### From root directory:

```bash
node scripts/config/generate-config.js
```

### From the configuration package:

```bash
cd experimental/packages/opentelemetry-configuration
npm run generate:config
```

## Updating Schema Version

To update to a newer version of the configuration schema:

1. Check available versions: `https://github.com/open-telemetry/opentelemetry-configuration/tags`
2. Update `CONFIG_VERSION` in `generate.sh`
3. Run the generation script
4. Test compilation and verify generated types
