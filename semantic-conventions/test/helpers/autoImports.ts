/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import * as fs from 'fs';
import * as path from 'path';

export interface IAutoImports {
  getGroups: () => Array<string>;
  getGroupValues: (name: string) => Array<string>;
  getImportGroup: (name: string) => string;
  getDebug: () => string;
}

interface IImports {
  file: string;
  groups: { [key: string]: IAutoImportDef };
}

interface IAutoImportDef {
  match: Array<RegExp>;
  values: Array<string>;
}

const theImports: Array<IImports> = [
  {
    file: './src/trace/SemanticAttributes.ts',
    groups: {
      all: {
        match: [/export\s+const\s+([\w]+)\s*[:=]+/g],
        values: ['SemanticAttributes'],
      },
      namespace: {
        match: [],
        values: ['SemanticAttributes'],
      },
      allStrings: {
        match: [/export\s+const\s+([\w]+)\s*=+/g],
        values: [],
      },
      http: {
        match: [
          /export\s+const\s+(SEMATTRS_HTTP_[\w]+)\s*=+/g,
          /export\s+const\s+(HTTP[\w]+)\s*=+/g,
        ],
        values: [],
      },
      net: {
        match: [
          /export\s+const\s+(SEMATTRS_NET_[\w]+)\s*=+/g,
          /export\s+const\s+(NET[\w]+)\s*=+/g,
        ],
        values: [],
      },
      messaging: {
        match: [
          /export\s+const\s+(SEMATTRS_MESSAGING_[\w]+)\s*=+/g,
          /export\s+const\s+(MESSAGING[\w]+)\s*=+/g,
        ],
        values: [],
      },
    },
  },
  {
    file: './src/resource/SemanticResourceAttributes.ts',
    groups: {
      all: {
        match: [/export\s+const\s+([\w]+)\s*[:=]+/g],
        values: ['SemanticResourceAttributes'],
      },
      namespace: {
        match: [],
        values: ['SemanticResourceAttributes'],
      },
      allStrings: {
        match: [/export\s+const\s+([\w]+)\s*=+/g],
        values: [],
      },
      http: {
        match: [
          /export\s+const\s+(SEMRESATTRS_HTTP_[\w]+)\s*=+/g,
          /export\s+const\s+(HTTP[\w]+)\s*=+/g,
        ],
        values: [],
      },
      net: {
        match: [
          /export\s+const\s+(SEMRESATTRS_NET_[\w]+)\s*=+/g,
          /export\s+const\s+(NET[\w]+)\s*=+/g,
        ],
        values: [],
      },
      telemetry: {
        match: [
          /export\s+const\s+(SEMRESATTRS_TELEMETRY_[\w]+)\s*=+/g,
          /export\s+const\s+(TELEMETRY[\w]+)\s*=+/g,
        ],
        values: [],
      },
    },
  },
];

interface IImportValues {
  first: boolean;
  added: Array<string>;
  result: string;
}

const _addImport = (theImport: string, state: IImportValues) => {
  if (!state.added.includes(theImport)) {
    if (!state.first) {
      state.result += ', ';
    }

    state.result += theImport;
    state.added.push(theImport);
    state.first = false;

    return true;
  }

  return false;
};

export const getAutoImports = (): IAutoImports => {
  // eslint-disable-next-line no-console
  console.log('Resolving Auto Imports');

  const importValues: { [key: string]: IImportValues } = {};

  // Process each Import
  theImports.forEach(imp => {
    // eslint-disable-next-line no-console
    console.log(' -- ' + imp.file);

    const filePath = path.resolve('.', imp.file);
    const fileContent = fs.readFileSync(filePath, 'utf8');

    // Process each group
    Object.keys(imp.groups).forEach(groupName => {
      // eslint-disable-next-line no-console
      console.log(' ---- ' + groupName);
      const group = imp.groups[groupName];
      if (!importValues[groupName]) {
        importValues[groupName] = {
          first: true,
          added: [],
          result: '',
        };
      }

      // Add each pre-defined export
      group.values.forEach(value => {
        if (!_addImport(value, importValues[groupName])) {
          // eslint-disable-next-line no-console
          console.log(' ------ ' + value + ' already added value');
        }
      });

      if (fileContent) {
        // Process each match
        group.match.forEach(match => {
          let matches: RegExpExecArray | null;
          while ((matches = match.exec(fileContent)) && matches.length > 1) {
            if (!_addImport(matches[1], importValues[groupName])) {
              // eslint-disable-next-line no-console
              console.log(' ------ ' + matches[1] + ' already added match');
            }
          }
        });
      }
    });
  });

  return {
    getGroups: () => {
      return Object.keys(importValues);
    },
    getGroupValues: (name: string) => {
      return (importValues[name] || {}).added || [];
    },
    getImportGroup: (name: string) => {
      return '{ ' + ((importValues[name] || {}).result || '') + ' }';
    },
    getDebug: () => {
      return JSON.stringify(importValues, null, 2);
    },
  };
};
