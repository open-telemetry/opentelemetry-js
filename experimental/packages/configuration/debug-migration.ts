import { ConfigurationSchema } from './src/generated/types';
import * as fs from 'fs';
import * as yaml from 'yaml';

process.env.OTEL_ATTRIBUTE_VALUE_LENGTH_LIMIT = '23';
process.env.OTEL_ATTRIBUTE_COUNT_LIMIT = '7';

const file = fs.readFileSync('test/fixtures/sdk-migration-config.yaml', 'utf8');
const rawParsed = yaml.parse(file);

function sub(obj: unknown): unknown {
  if (typeof obj === 'string') {
    return (obj as string).replace(/\$\{([^}:]+)(?::-(.*?))?\}/g, (_m: string, name: string, fallback: string | undefined) => {
      const val = process.env[name];
      if (val !== undefined) return val;
      if (fallback !== undefined) return fallback;
      return '';
    });
  }
  if (Array.isArray(obj)) return (obj as unknown[]).map(sub);
  if (typeof obj === 'object' && obj !== null) return Object.fromEntries(Object.entries(obj as Record<string, unknown>).map(([k, v]) => [k, sub(v)]));
  return obj;
}
const substituted = sub(rawParsed) as Record<string, unknown>;
const result = ConfigurationSchema.safeParse(substituted);
if (!result.success) {
  console.log('ERRORS:', JSON.stringify(result.error.issues.slice(0, 5), null, 2));
} else {
  console.log('OK');
}
