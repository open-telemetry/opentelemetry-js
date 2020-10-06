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

export enum AllowedOperationTypes {
  QUERY = 'query',
  MUTATION = 'mutation',
  SUBSCRIPTION = 'subscription',
}

export enum TokenKind {
  SOF = '<SOF>',
  EOF = '<EOF>',
  BANG = '!',
  DOLLAR = '$',
  AMP = '&',
  PAREN_L = '(',
  PAREN_R = ')',
  SPREAD = '...',
  COLON = ':',
  EQUALS = '=',
  AT = '@',
  BRACKET_L = '[',
  BRACKET_R = ']',
  BRACE_L = '{',
  PIPE = '|',
  BRACE_R = '}',
  NAME = 'Name',
  INT = 'Int',
  FLOAT = 'Float',
  STRING = 'String',
  BLOCK_STRING = 'BlockString',
  COMMENT = 'Comment',
}

export enum SpanAttributes {
  COMPONENT = 'graphql',
  SOURCE = 'graphql.source',
  FIELD_NAME = 'graphql.field.name',
  FIELD_PATH = 'graphql.field.path',
  FIELD_TYPE = 'graphql.field.type',
  OPERATION = 'graphql.operation.name',
  VARIABLES = 'graphql.variables.',
  ERROR_VALIDATION_NAME = 'graphql.validation.error',
}

export enum SpanNames {
  EXECUTE = 'graphql.execute',
  PARSE = 'graphql.parse',
  RESOLVE = 'graphql.resolve',
  VALIDATE = 'graphql.validate',
  SCHEMA_VALIDATE = 'graphql.validateSchema',
  SCHEMA_PARSE = 'graphql.parseSchema',
}
