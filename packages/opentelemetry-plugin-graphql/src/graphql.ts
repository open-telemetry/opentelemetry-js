/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
// is moving to instrumentation
import { isWrapped } from '@opentelemetry/core';

import {
  InstrumentationBase,
  InstrumentationConfig,
  InstrumentationNodeModuleDefinition,
  InstrumentationNodeModuleFile,
  safeExecuteInTheMiddle,
} from '@opentelemetry/instrumentation';
import { Maybe } from 'graphql/jsutils/Maybe';
import type * as graphqlTypes from 'graphql';
import { GraphQLFieldResolver } from 'graphql/type/definition';
import { SpanAttributes, SpanNames } from './enum';
import { OTEL_GRAPHQL_DATA_SYMBOL, OTEL_SPAN_SYMBOL } from './symbols';

import {
  executeFunctionWithObj,
  executeArgumentsArray,
  executeType,
  parseType,
  validateType,
  GraphQLPluginConfig,
  GraphQLPluginParsedConfig,
  OtelExecutionArgs,
  ObjectWithGraphQLData,
  ObjectWithOtelSpan,
  OPERATION_NOT_SUPPORTED,
} from './types';
import {
  addSpanSource,
  endSpan,
  getOperation,
  wrapFieldResolver,
  wrapFields,
} from './utils';

import { VERSION } from './version';
import * as api from '@opentelemetry/api';
import type { PromiseOrValue } from 'graphql/jsutils/PromiseOrValue';

const DEFAULT_CONFIG: GraphQLPluginConfig = {
  mergeItems: false,
  depth: -1,
  allowValues: false,
};

export class GraphQLPlugin extends InstrumentationBase {
  constructor(config: GraphQLPluginConfig & InstrumentationConfig = {}) {
    super('graphql', VERSION, Object.assign({}, DEFAULT_CONFIG, config));
  }

  private _getConfig(): GraphQLPluginParsedConfig {
    return this._config as GraphQLPluginParsedConfig;
  }

  setConfig(config: GraphQLPluginConfig & InstrumentationConfig = {}) {
    this._config = Object.assign({}, DEFAULT_CONFIG, config);
  }

  protected init() {
    const module = new InstrumentationNodeModuleDefinition<typeof graphqlTypes>(
      'graphql',
      ['15.*']
    );
    module.files.push(this._addPatchingExecute());
    module.files.push(this._addPatchingParser());
    module.files.push(this._addPatchingValidate());

    return module;
  }

  private _addPatchingExecute(): InstrumentationNodeModuleFile<
    typeof graphqlTypes
  > {
    const file = new InstrumentationNodeModuleFile<typeof graphqlTypes>(
      'graphql/execution/execute.js',
      // cannot make it work with appropriate type as execute function has 2
      //types and/cannot import function but only types
      (moduleExports: any) => {
        if (isWrapped(moduleExports.execute)) {
          this._unwrap(moduleExports, 'execute');
        }
        this._wrap(
          moduleExports,
          'execute',
          this._patchExecute(moduleExports.defaultFieldResolver)
        );
        return moduleExports;
      },
      moduleExports => {
        if (moduleExports) {
          this._unwrap(moduleExports, 'execute');
        }
      }
    );
    return file;
  }

  private _addPatchingParser(): InstrumentationNodeModuleFile<
    typeof graphqlTypes
  > {
    const file = new InstrumentationNodeModuleFile<typeof graphqlTypes>(
      'graphql/language/parser.js',
      moduleExports => {
        if (isWrapped(moduleExports.execute)) {
          this._unwrap(moduleExports, 'parse');
        }
        this._wrap(moduleExports, 'parse', this._patchParse());
        return moduleExports;
      },
      moduleExports => {
        if (moduleExports) {
          this._unwrap(moduleExports, 'parse');
        }
      }
    );
    return file;
  }

  private _addPatchingValidate(): InstrumentationNodeModuleFile<
    typeof graphqlTypes
  > {
    const file = new InstrumentationNodeModuleFile<typeof graphqlTypes>(
      'graphql/validation/validate.js',
      moduleExports => {
        if (isWrapped(moduleExports.execute)) {
          this._unwrap(moduleExports, 'validate');
        }
        this._wrap(moduleExports, 'validate', this._patchValidate());
        return moduleExports;
      },
      moduleExports => {
        if (moduleExports) {
          this._unwrap(moduleExports, 'validate');
        }
      }
    );
    return file;
  }

  private _patchExecute(
    defaultFieldResolved: GraphQLFieldResolver<any, any>
  ): (original: executeType) => executeType {
    const plugin = this;
    return function execute(original) {
      return function patchExecute(
        this: executeType
      ): PromiseOrValue<graphqlTypes.ExecutionResult> {
        let processedArgs: OtelExecutionArgs;

        // case when apollo server is used for example
        if (arguments.length >= 2) {
          const args = (arguments as unknown) as executeArgumentsArray;
          processedArgs = plugin._wrapExecuteArgs(
            args[0],
            args[1],
            args[2],
            args[3],
            args[4],
            args[5],
            args[6] || defaultFieldResolved,
            args[7]
          );
        } else {
          const args = arguments[0] as graphqlTypes.ExecutionArgs;
          processedArgs = plugin._wrapExecuteArgs(
            args.schema,
            args.document,
            args.rootValue,
            args.contextValue,
            args.variableValues,
            args.operationName,
            args.fieldResolver || defaultFieldResolved,
            args.typeResolver
          );
        }

        const operation = getOperation(
          processedArgs.document,
          processedArgs.operationName
        );

        const span = plugin._createExecuteSpan(operation, processedArgs);

        processedArgs.contextValue[OTEL_GRAPHQL_DATA_SYMBOL] = {
          source: processedArgs.document
            ? processedArgs.document ||
              (processedArgs.document as ObjectWithGraphQLData)[
                OTEL_GRAPHQL_DATA_SYMBOL
              ]
            : undefined,
          span,
          fields: {},
        };

        return plugin.tracer.withSpan(span, () => {
          return safeExecuteInTheMiddle<
            PromiseOrValue<graphqlTypes.ExecutionResult>
          >(
            () => {
              return (original as executeFunctionWithObj).apply(this, [
                processedArgs,
              ]);
            },
            err => {
              endSpan(span, err);
            }
          );
        });
      };
    };
  }

  private _patchParse(): (original: parseType) => parseType {
    const plugin = this;
    return function parse(original) {
      return function patchParse(
        this: parseType,
        source: string | graphqlTypes.Source,
        options?: graphqlTypes.ParseOptions
      ): graphqlTypes.DocumentNode {
        return plugin._parse(this, original, source, options);
      };
    };
  }

  private _patchValidate(): (original: validateType) => validateType {
    const plugin = this;
    return function validate(original: validateType) {
      return function patchValidate(
        this: validateType,
        schema: graphqlTypes.GraphQLSchema,
        documentAST: graphqlTypes.DocumentNode,
        rules?: ReadonlyArray<graphqlTypes.ValidationRule>,
        typeInfo?: graphqlTypes.TypeInfo,
        options?: { maxErrors?: number }
      ): ReadonlyArray<graphqlTypes.GraphQLError> {
        return plugin._validate(
          this,
          original,
          schema,
          documentAST,
          rules,
          typeInfo,
          options
        );
      };
    };
  }

  private _parse(
    obj: parseType,
    original: parseType,
    source: string | graphqlTypes.Source,
    options?: graphqlTypes.ParseOptions
  ): graphqlTypes.DocumentNode {
    const config = this._getConfig();
    const span = this.tracer.startSpan(SpanNames.PARSE);

    return this.tracer.withSpan(span, () => {
      return safeExecuteInTheMiddle<
        graphqlTypes.DocumentNode & ObjectWithGraphQLData
      >(
        () => {
          return original.call(obj, source, options);
        },
        (err, result) => {
          if (result) {
            (result as ObjectWithOtelSpan)[OTEL_SPAN_SYMBOL] = span;
            const operation = getOperation(result);
            if (!operation) {
              span.updateName(SpanNames.SCHEMA_PARSE);
            } else if (result.loc) {
              addSpanSource(span, result.loc, config.allowValues);
            }
          }
          endSpan(span, err);
        }
      );
    });
  }

  private _validate(
    obj: validateType,
    original: validateType,
    schema: graphqlTypes.GraphQLSchema,
    documentAST: graphqlTypes.DocumentNode,
    rules?: ReadonlyArray<graphqlTypes.ValidationRule>,
    typeInfo?: graphqlTypes.TypeInfo,
    options?: { maxErrors?: number }
  ): ReadonlyArray<graphqlTypes.GraphQLError> {
    const document = documentAST as ObjectWithOtelSpan;
    const span = this.tracer.startSpan(SpanNames.VALIDATE, {
      parent: document[OTEL_SPAN_SYMBOL],
    });
    document[OTEL_SPAN_SYMBOL] = span;

    return this.tracer.withSpan(span, () => {
      return safeExecuteInTheMiddle<ReadonlyArray<graphqlTypes.GraphQLError>>(
        () => {
          return original.call(
            obj,
            schema,
            documentAST,
            rules,
            typeInfo,
            options
          );
        },
        (err, errors) => {
          if (!documentAST.loc) {
            span.updateName(SpanNames.SCHEMA_VALIDATE);
          }
          if (errors && errors.length) {
            span.recordException({
              name: SpanAttributes.ERROR_VALIDATION_NAME,
              message: JSON.stringify(errors),
            });
          }
          endSpan(span, err);
        }
      );
    });
  }

  private _createExecuteSpan(
    operation: graphqlTypes.DefinitionNode | undefined,
    processedArgs: graphqlTypes.ExecutionArgs
  ): api.Span {
    const config = this._getConfig();
    const document = processedArgs.document as ObjectWithOtelSpan;
    const span = this.tracer.startSpan(SpanNames.EXECUTE, {
      parent: document[OTEL_SPAN_SYMBOL],
    });
    if (operation) {
      const name = (operation as graphqlTypes.OperationDefinitionNode)
        .operation;
      if (name) {
        span.setAttribute(SpanAttributes.OPERATION, name);
      }
    } else {
      let operationName = ' ';
      if (processedArgs.operationName) {
        operationName = ` "${processedArgs.operationName}" `;
      }
      operationName = OPERATION_NOT_SUPPORTED.replace(
        '$operationName$',
        operationName
      );
      span.setAttribute(SpanAttributes.OPERATION, operationName);
    }

    if (processedArgs.document?.loc) {
      addSpanSource(span, processedArgs.document.loc, config.allowValues);
    }

    if (processedArgs.variableValues && config.allowValues) {
      Object.entries(processedArgs.variableValues).forEach(([key, value]) => {
        span.setAttribute(`${SpanAttributes.VARIABLES}${String(key)}`, value);
      });
    }

    return span;
  }

  private _wrapExecuteArgs(
    schema: graphqlTypes.GraphQLSchema,
    document: graphqlTypes.DocumentNode,
    rootValue: any,
    contextValue: any,
    variableValues: Maybe<{ [key: string]: any }>,
    operationName: Maybe<string>,
    fieldResolver: Maybe<graphqlTypes.GraphQLFieldResolver<any, any>>,
    typeResolver: Maybe<graphqlTypes.GraphQLTypeResolver<any, any>>
  ): OtelExecutionArgs {
    if (!contextValue) {
      contextValue = {};
    }
    if (contextValue[OTEL_GRAPHQL_DATA_SYMBOL]) {
      return {
        schema,
        document,
        rootValue,
        contextValue,
        variableValues,
        operationName,
        fieldResolver,
        typeResolver,
      };
    }
    fieldResolver = wrapFieldResolver(
      this.tracer,
      this._getConfig.bind(this),
      fieldResolver
    );

    if (schema) {
      wrapFields(
        schema.getQueryType(),
        this.tracer,
        this._getConfig.bind(this)
      );
      wrapFields(
        schema.getMutationType(),
        this.tracer,
        this._getConfig.bind(this)
      );
    }

    return {
      schema,
      document,
      rootValue,
      contextValue,
      variableValues,
      operationName,
      fieldResolver,
      typeResolver,
    };
  }
}
