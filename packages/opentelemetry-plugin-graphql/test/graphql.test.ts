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

import {
  BasicTracerProvider,
  InMemorySpanExporter,
  ReadableSpan,
  SimpleSpanProcessor,
} from '@opentelemetry/tracing';
import * as assert from 'assert';
import { GraphQLPlugin } from '../src';
import { SpanAttributes, SpanNames } from '../src/enum';
import { GraphQLPluginConfig } from '../src/types';
import { assertResolveSpan } from './helper';

const defaultConfig: GraphQLPluginConfig = {};
const graphQLPlugin = new GraphQLPlugin(defaultConfig);
graphQLPlugin.enable();
graphQLPlugin.disable();

// now graphql can be required

import { buildSchema } from './schema';
import { graphql } from 'graphql';
// Construct a schema, using GraphQL schema language
const schema = buildSchema();

const sourceList1 = `
  query {
    books {
      name
    }
  }
`;

const sourceBookById = `
  query {
    book(id: 0) {
      name
    }
  }
`;

const sourceAddBook = `
  mutation {
    addBook(
      name: "Fifth Book"
      authorIds: "0,2"
    ) {
      id
    }
  }
`;

const sourceFindUsingVariable = `
  query Query1 ($id: Int!) {
    book(id: $id) {
      name
    }
  }
`;

const badQuery = `
  query foo bar
`;

const queryInvalid = `
  query {
    book(id: "a") {
      name
    }
  }
`;

const exporter = new InMemorySpanExporter();
const provider = new BasicTracerProvider();
provider.addSpanProcessor(new SimpleSpanProcessor(exporter));
graphQLPlugin.setTracerProvider(provider);

describe('graphql', () => {
  function create(config: GraphQLPluginConfig = {}) {
    graphQLPlugin.setConfig(config);
    graphQLPlugin.enable();
  }

  describe('when depth is not set', () => {
    describe('AND source is query to get a list of books', () => {
      let spans: ReadableSpan[];
      beforeEach(async () => {
        create({});
        await graphql(schema, sourceList1);
        spans = exporter.getFinishedSpans();
      });

      afterEach(() => {
        exporter.reset();
        graphQLPlugin.disable();
        spans = [];
      });

      it('should have 7 spans', () => {
        assert.deepStrictEqual(spans.length, 7);
      });

      it('should instrument parse', () => {
        const parseSpan = spans[0];
        assert.deepStrictEqual(
          parseSpan.attributes[SpanAttributes.SOURCE],
          '\n' +
            '  query {\n' +
            '    books {\n' +
            '      name\n' +
            '    }\n' +
            '  }\n'
        );
        assert.deepStrictEqual(parseSpan.name, SpanNames.PARSE);
      });

      it('should instrument validate', () => {
        const parseSpan = spans[0];
        const validateSpan = spans[1];

        assert.deepStrictEqual(validateSpan.name, SpanNames.VALIDATE);
        assert.deepStrictEqual(
          validateSpan.parentSpanId,
          parseSpan.spanContext.spanId
        );
      });

      it('should instrument execute', () => {
        const executeSpan = spans[3];
        const validateSpan = spans[1];

        assert.deepStrictEqual(
          executeSpan.attributes[SpanAttributes.SOURCE],
          '\n' +
            '  query {\n' +
            '    books {\n' +
            '      name\n' +
            '    }\n' +
            '  }\n'
        );
        assert.deepStrictEqual(
          executeSpan.attributes[SpanAttributes.OPERATION],
          'query'
        );
        assert.deepStrictEqual(executeSpan.name, SpanNames.EXECUTE);
        assert.deepStrictEqual(
          executeSpan.parentSpanId,
          validateSpan.spanContext.spanId
        );
      });

      it('should instrument resolvers', () => {
        const executeSpan = spans[3];
        const resolveParentSpan = spans[2];
        const span1 = spans[4];
        const span2 = spans[5];
        const span3 = spans[6];

        assertResolveSpan(
          resolveParentSpan,
          'books',
          'books',
          '[Book]',
          'books {\n' + '      name\n' + '    }',
          executeSpan.spanContext.spanId
        );
        const parentId = resolveParentSpan.spanContext.spanId;
        assertResolveSpan(
          span1,
          'name',
          'books.0.name',
          'String',
          'name',
          parentId
        );
        assertResolveSpan(
          span2,
          'name',
          'books.1.name',
          'String',
          'name',
          parentId
        );
        assertResolveSpan(
          span3,
          'name',
          'books.2.name',
          'String',
          'name',
          parentId
        );
      });
    });
    describe('AND source is query with param', () => {
      let spans: ReadableSpan[];

      beforeEach(async () => {
        create({});
        await graphql(schema, sourceBookById);
        spans = exporter.getFinishedSpans();
      });

      afterEach(() => {
        exporter.reset();
        graphQLPlugin.disable();
        spans = [];
      });

      it('should have 5 spans', () => {
        assert.deepStrictEqual(spans.length, 5);
      });

      it('should instrument parse', () => {
        const parseSpan = spans[0];
        assert.deepStrictEqual(
          parseSpan.attributes[SpanAttributes.SOURCE],
          '\n' +
            '  query {\n' +
            '    book(id: *) {\n' +
            '      name\n' +
            '    }\n' +
            '  }\n'
        );
        assert.deepStrictEqual(parseSpan.name, SpanNames.PARSE);
      });

      it('should instrument validate', () => {
        const parseSpan = spans[0];
        const validateSpan = spans[1];

        assert.deepStrictEqual(validateSpan.name, SpanNames.VALIDATE);
        assert.deepStrictEqual(
          validateSpan.parentSpanId,
          parseSpan.spanContext.spanId
        );
      });

      it('should instrument execute', () => {
        const executeSpan = spans[3];
        const validateSpan = spans[1];

        assert.deepStrictEqual(
          executeSpan.attributes[SpanAttributes.SOURCE],
          '\n' +
            '  query {\n' +
            '    book(id: *) {\n' +
            '      name\n' +
            '    }\n' +
            '  }\n'
        );
        assert.deepStrictEqual(
          executeSpan.attributes[SpanAttributes.OPERATION],
          'query'
        );
        assert.deepStrictEqual(executeSpan.name, SpanNames.EXECUTE);
        assert.deepStrictEqual(
          executeSpan.parentSpanId,
          validateSpan.spanContext.spanId
        );
      });

      it('should instrument resolvers', () => {
        const executeSpan = spans[3];
        const resolveParentSpan = spans[2];
        const span1 = spans[4];

        assertResolveSpan(
          resolveParentSpan,
          'book',
          'book',
          'Book',
          'book(id: *) {\n' + '      name\n' + '    }',
          executeSpan.spanContext.spanId
        );
        const parentId = resolveParentSpan.spanContext.spanId;
        assertResolveSpan(
          span1,
          'name',
          'book.name',
          'String',
          'name',
          parentId
        );
      });
    });
    describe('AND source is query with param and variables', () => {
      let spans: ReadableSpan[];

      beforeEach(async () => {
        create({});
        await graphql(schema, sourceFindUsingVariable, null, null, {
          id: 2,
        });
        spans = exporter.getFinishedSpans();
      });

      afterEach(() => {
        exporter.reset();
        graphQLPlugin.disable();
        spans = [];
      });

      it('should have 5 spans', () => {
        assert.deepStrictEqual(spans.length, 5);
      });

      it('should instrument parse', () => {
        const parseSpan = spans[0];
        assert.deepStrictEqual(
          parseSpan.attributes[SpanAttributes.SOURCE],
          '\n' +
            '  query Query1 ($id: Int!) {\n' +
            '    book(id: $id) {\n' +
            '      name\n' +
            '    }\n' +
            '  }\n'
        );
        assert.deepStrictEqual(parseSpan.name, SpanNames.PARSE);
      });

      it('should instrument validate', () => {
        const parseSpan = spans[0];
        const validateSpan = spans[1];

        assert.deepStrictEqual(validateSpan.name, SpanNames.VALIDATE);
        assert.deepStrictEqual(
          validateSpan.parentSpanId,
          parseSpan.spanContext.spanId
        );
      });

      it('should instrument execute', () => {
        const executeSpan = spans[3];
        const validateSpan = spans[1];

        assert.deepStrictEqual(
          executeSpan.attributes[SpanAttributes.SOURCE],
          '\n' +
            '  query Query1 ($id: Int!) {\n' +
            '    book(id: $id) {\n' +
            '      name\n' +
            '    }\n' +
            '  }\n'
        );
        assert.deepStrictEqual(
          executeSpan.attributes[SpanAttributes.OPERATION],
          'query'
        );
        assert.deepStrictEqual(
          executeSpan.attributes[`${SpanAttributes.VARIABLES}id`],
          undefined
        );
        assert.deepStrictEqual(executeSpan.name, SpanNames.EXECUTE);
        assert.deepStrictEqual(
          executeSpan.parentSpanId,
          validateSpan.spanContext.spanId
        );
      });

      it('should instrument resolvers', () => {
        const executeSpan = spans[3];
        const resolveParentSpan = spans[2];
        const span1 = spans[4];

        assertResolveSpan(
          resolveParentSpan,
          'book',
          'book',
          'Book',
          'book(id: $id) {\n' + '      name\n' + '    }',
          executeSpan.spanContext.spanId
        );
        const parentId = resolveParentSpan.spanContext.spanId;
        assertResolveSpan(
          span1,
          'name',
          'book.name',
          'String',
          'name',
          parentId
        );
      });
    });
  });

  describe('when depth is set to 0', () => {
    describe('AND source is query to get a list of books', () => {
      let spans: ReadableSpan[];
      beforeEach(async () => {
        create({
          depth: 0,
        });
        await graphql(schema, sourceList1);
        spans = exporter.getFinishedSpans();
      });

      afterEach(() => {
        exporter.reset();
        graphQLPlugin.disable();
        spans = [];
      });

      it('should have 3 spans', () => {
        assert.deepStrictEqual(spans.length, 3);
      });

      it('should instrument parse', () => {
        const parseSpan = spans[0];
        assert.deepStrictEqual(
          parseSpan.attributes[SpanAttributes.SOURCE],
          '\n' +
            '  query {\n' +
            '    books {\n' +
            '      name\n' +
            '    }\n' +
            '  }\n'
        );
        assert.deepStrictEqual(parseSpan.name, SpanNames.PARSE);
      });

      it('should instrument validate', () => {
        const parseSpan = spans[0];
        const validateSpan = spans[1];

        assert.deepStrictEqual(validateSpan.name, SpanNames.VALIDATE);
        assert.deepStrictEqual(
          validateSpan.parentSpanId,
          parseSpan.spanContext.spanId
        );
      });

      it('should instrument execute', () => {
        const executeSpan = spans[2];
        const validateSpan = spans[1];

        assert.deepStrictEqual(
          executeSpan.attributes[SpanAttributes.SOURCE],
          '\n' +
            '  query {\n' +
            '    books {\n' +
            '      name\n' +
            '    }\n' +
            '  }\n'
        );
        assert.deepStrictEqual(
          executeSpan.attributes[SpanAttributes.OPERATION],
          'query'
        );
        assert.deepStrictEqual(executeSpan.name, SpanNames.EXECUTE);
        assert.deepStrictEqual(
          executeSpan.parentSpanId,
          validateSpan.spanContext.spanId
        );
      });
    });
  });

  describe('when mergeItems is set to true', () => {
    describe('AND source is query to get a list of books', () => {
      let spans: ReadableSpan[];
      beforeEach(async () => {
        create({
          mergeItems: true,
        });
        await graphql(schema, sourceList1);
        spans = exporter.getFinishedSpans();
      });

      afterEach(() => {
        exporter.reset();
        graphQLPlugin.disable();
        spans = [];
      });

      it('should have 5 spans', () => {
        assert.deepStrictEqual(spans.length, 5);
      });

      it('should instrument parse', () => {
        const parseSpan = spans[0];
        assert.deepStrictEqual(
          parseSpan.attributes[SpanAttributes.SOURCE],
          '\n' +
            '  query {\n' +
            '    books {\n' +
            '      name\n' +
            '    }\n' +
            '  }\n'
        );
        assert.deepStrictEqual(parseSpan.name, SpanNames.PARSE);
      });

      it('should instrument validate', () => {
        const parseSpan = spans[0];
        const validateSpan = spans[1];

        assert.deepStrictEqual(validateSpan.name, SpanNames.VALIDATE);
        assert.deepStrictEqual(
          validateSpan.parentSpanId,
          parseSpan.spanContext.spanId
        );
      });

      it('should instrument execute', () => {
        const executeSpan = spans[3];
        const validateSpan = spans[1];

        assert.deepStrictEqual(
          executeSpan.attributes[SpanAttributes.SOURCE],
          '\n' +
            '  query {\n' +
            '    books {\n' +
            '      name\n' +
            '    }\n' +
            '  }\n'
        );
        assert.deepStrictEqual(
          executeSpan.attributes[SpanAttributes.OPERATION],
          'query'
        );
        assert.deepStrictEqual(executeSpan.name, SpanNames.EXECUTE);
        assert.deepStrictEqual(
          executeSpan.parentSpanId,
          validateSpan.spanContext.spanId
        );
      });
    });

    describe('AND depth is set to 0', () => {
      let spans: ReadableSpan[];
      beforeEach(async () => {
        create({
          mergeItems: true,
          depth: 0,
        });
        await graphql(schema, sourceList1);
        spans = exporter.getFinishedSpans();
      });

      afterEach(() => {
        exporter.reset();
        graphQLPlugin.disable();
        spans = [];
      });

      it('should have 3 spans', () => {
        assert.deepStrictEqual(spans.length, 3);
      });
    });
  });

  describe('when allowValues is set to true', () => {
    describe('AND source is query with param', () => {
      let spans: ReadableSpan[];

      beforeEach(async () => {
        create({
          allowValues: true,
        });
        await graphql(schema, sourceBookById);
        spans = exporter.getFinishedSpans();
      });

      afterEach(() => {
        exporter.reset();
        graphQLPlugin.disable();
        spans = [];
      });

      it('should have 5 spans', () => {
        assert.deepStrictEqual(spans.length, 5);
      });

      it('should instrument parse', () => {
        const parseSpan = spans[0];
        assert.deepStrictEqual(
          parseSpan.attributes[SpanAttributes.SOURCE],
          '\n' +
            '  query {\n' +
            '    book(id: 0) {\n' +
            '      name\n' +
            '    }\n' +
            '  }\n'
        );
        assert.deepStrictEqual(parseSpan.name, SpanNames.PARSE);
      });

      it('should instrument validate', () => {
        const parseSpan = spans[0];
        const validateSpan = spans[1];

        assert.deepStrictEqual(validateSpan.name, SpanNames.VALIDATE);
        assert.deepStrictEqual(
          validateSpan.parentSpanId,
          parseSpan.spanContext.spanId
        );
      });

      it('should instrument execute', () => {
        const executeSpan = spans[3];
        const validateSpan = spans[1];

        assert.deepStrictEqual(
          executeSpan.attributes[SpanAttributes.SOURCE],
          '\n' +
            '  query {\n' +
            '    book(id: 0) {\n' +
            '      name\n' +
            '    }\n' +
            '  }\n'
        );
        assert.deepStrictEqual(
          executeSpan.attributes[SpanAttributes.OPERATION],
          'query'
        );
        assert.deepStrictEqual(executeSpan.name, SpanNames.EXECUTE);
        assert.deepStrictEqual(
          executeSpan.parentSpanId,
          validateSpan.spanContext.spanId
        );
      });

      it('should instrument resolvers', () => {
        const executeSpan = spans[3];
        const resolveParentSpan = spans[2];
        const span1 = spans[4];

        assertResolveSpan(
          resolveParentSpan,
          'book',
          'book',
          'Book',
          'book(id: 0) {\n' + '      name\n' + '    }',
          executeSpan.spanContext.spanId
        );
        const parentId = resolveParentSpan.spanContext.spanId;
        assertResolveSpan(
          span1,
          'name',
          'book.name',
          'String',
          'name',
          parentId
        );
      });
    });
    describe('AND mutation is called', () => {
      let spans: ReadableSpan[];

      beforeEach(async () => {
        create({
          allowValues: true,
        });
        await graphql(schema, sourceAddBook);
        spans = exporter.getFinishedSpans();
      });

      afterEach(() => {
        exporter.reset();
        graphQLPlugin.disable();
        spans = [];
      });

      it('should have 5 spans', () => {
        assert.deepStrictEqual(spans.length, 5);
      });

      it('should instrument parse', () => {
        const parseSpan = spans[0];
        assert.deepStrictEqual(
          parseSpan.attributes[SpanAttributes.SOURCE],
          '\n' +
            '  mutation {\n' +
            '    addBook(\n' +
            '      name: "Fifth Book"\n' +
            '      authorIds: "0,2"\n' +
            '    ) {\n' +
            '      id\n' +
            '    }\n' +
            '  }\n'
        );
        assert.deepStrictEqual(parseSpan.name, SpanNames.PARSE);
      });

      it('should instrument validate', () => {
        const parseSpan = spans[0];
        const validateSpan = spans[1];

        assert.deepStrictEqual(validateSpan.name, SpanNames.VALIDATE);
        assert.deepStrictEqual(
          validateSpan.parentSpanId,
          parseSpan.spanContext.spanId
        );
      });

      it('should instrument execute', () => {
        const executeSpan = spans[3];
        const validateSpan = spans[1];

        assert.deepStrictEqual(
          executeSpan.attributes[SpanAttributes.SOURCE],
          '\n' +
            '  mutation {\n' +
            '    addBook(\n' +
            '      name: "Fifth Book"\n' +
            '      authorIds: "0,2"\n' +
            '    ) {\n' +
            '      id\n' +
            '    }\n' +
            '  }\n'
        );
        assert.deepStrictEqual(
          executeSpan.attributes[SpanAttributes.OPERATION],
          'mutation'
        );
        assert.deepStrictEqual(executeSpan.name, SpanNames.EXECUTE);
        assert.deepStrictEqual(
          executeSpan.parentSpanId,
          validateSpan.spanContext.spanId
        );
      });

      it('should instrument resolvers', () => {
        const executeSpan = spans[3];
        const resolveParentSpan = spans[2];
        const span1 = spans[4];

        assertResolveSpan(
          resolveParentSpan,
          'addBook',
          'addBook',
          'Book',
          'addBook(\n' +
            '      name: "Fifth Book"\n' +
            '      authorIds: "0,2"\n' +
            '    ) {\n' +
            '      id\n' +
            '    }',
          executeSpan.spanContext.spanId
        );
        const parentId = resolveParentSpan.spanContext.spanId;
        assertResolveSpan(span1, 'id', 'addBook.id', 'Int', 'id', parentId);
      });
    });
    describe('AND source is query with param and variables', () => {
      let spans: ReadableSpan[];

      beforeEach(async () => {
        create({
          allowValues: true,
        });
        await graphql(schema, sourceFindUsingVariable, null, null, {
          id: 2,
        });
        spans = exporter.getFinishedSpans();
      });

      afterEach(() => {
        exporter.reset();
        graphQLPlugin.disable();
        spans = [];
      });

      it('should have 5 spans', () => {
        assert.deepStrictEqual(spans.length, 5);
      });

      it('should instrument parse', () => {
        const parseSpan = spans[0];
        assert.deepStrictEqual(
          parseSpan.attributes[SpanAttributes.SOURCE],
          '\n' +
            '  query Query1 ($id: Int!) {\n' +
            '    book(id: $id) {\n' +
            '      name\n' +
            '    }\n' +
            '  }\n'
        );
        assert.deepStrictEqual(parseSpan.name, SpanNames.PARSE);
      });

      it('should instrument validate', () => {
        const parseSpan = spans[0];
        const validateSpan = spans[1];

        assert.deepStrictEqual(validateSpan.name, SpanNames.VALIDATE);
        assert.deepStrictEqual(
          validateSpan.parentSpanId,
          parseSpan.spanContext.spanId
        );
      });

      it('should instrument execute', () => {
        const executeSpan = spans[3];
        const validateSpan = spans[1];

        assert.deepStrictEqual(
          executeSpan.attributes[SpanAttributes.SOURCE],
          '\n' +
            '  query Query1 ($id: Int!) {\n' +
            '    book(id: $id) {\n' +
            '      name\n' +
            '    }\n' +
            '  }\n'
        );
        assert.deepStrictEqual(
          executeSpan.attributes[SpanAttributes.OPERATION],
          'query'
        );
        assert.deepStrictEqual(
          executeSpan.attributes[`${SpanAttributes.VARIABLES}id`],
          2
        );
        assert.deepStrictEqual(executeSpan.name, SpanNames.EXECUTE);
        assert.deepStrictEqual(
          executeSpan.parentSpanId,
          validateSpan.spanContext.spanId
        );
      });

      it('should instrument resolvers', () => {
        const executeSpan = spans[3];
        const resolveParentSpan = spans[2];
        const span1 = spans[4];

        assertResolveSpan(
          resolveParentSpan,
          'book',
          'book',
          'Book',
          'book(id: $id) {\n' + '      name\n' + '    }',
          executeSpan.spanContext.spanId
        );
        const parentId = resolveParentSpan.spanContext.spanId;
        assertResolveSpan(
          span1,
          'name',
          'book.name',
          'String',
          'name',
          parentId
        );
      });
    });
  });

  describe('when mutation is called', () => {
    let spans: ReadableSpan[];

    beforeEach(async () => {
      create({
        // allowValues: true
      });
      await graphql(schema, sourceAddBook);
      spans = exporter.getFinishedSpans();
    });

    afterEach(() => {
      exporter.reset();
      graphQLPlugin.disable();
      spans = [];
    });

    it('should have 5 spans', () => {
      assert.deepStrictEqual(spans.length, 5);
    });

    it('should instrument parse', () => {
      const parseSpan = spans[0];
      assert.deepStrictEqual(
        parseSpan.attributes[SpanAttributes.SOURCE],
        '\n' +
          '  mutation {\n' +
          '    addBook(\n' +
          '      name: "*"\n' +
          '      authorIds: "*"\n' +
          '    ) {\n' +
          '      id\n' +
          '    }\n' +
          '  }\n'
      );
      assert.deepStrictEqual(parseSpan.name, SpanNames.PARSE);
    });

    it('should instrument validate', () => {
      const parseSpan = spans[0];
      const validateSpan = spans[1];

      assert.deepStrictEqual(validateSpan.name, SpanNames.VALIDATE);
      assert.deepStrictEqual(
        validateSpan.parentSpanId,
        parseSpan.spanContext.spanId
      );
    });

    it('should instrument execute', () => {
      const executeSpan = spans[3];
      const validateSpan = spans[1];

      assert.deepStrictEqual(
        executeSpan.attributes[SpanAttributes.SOURCE],
        '\n' +
          '  mutation {\n' +
          '    addBook(\n' +
          '      name: "*"\n' +
          '      authorIds: "*"\n' +
          '    ) {\n' +
          '      id\n' +
          '    }\n' +
          '  }\n'
      );
      assert.deepStrictEqual(
        executeSpan.attributes[SpanAttributes.OPERATION],
        'mutation'
      );
      assert.deepStrictEqual(executeSpan.name, SpanNames.EXECUTE);
      assert.deepStrictEqual(
        executeSpan.parentSpanId,
        validateSpan.spanContext.spanId
      );
    });

    it('should instrument resolvers', () => {
      const executeSpan = spans[3];
      const resolveParentSpan = spans[2];
      const span1 = spans[4];

      assertResolveSpan(
        resolveParentSpan,
        'addBook',
        'addBook',
        'Book',
        'addBook(\n' +
          '      name: "*"\n' +
          '      authorIds: "*"\n' +
          '    ) {\n' +
          '      id\n' +
          '    }',
        executeSpan.spanContext.spanId
      );
      const parentId = resolveParentSpan.spanContext.spanId;
      assertResolveSpan(span1, 'id', 'addBook.id', 'Int', 'id', parentId);
    });
  });

  describe('when query is not correct', () => {
    let spans: ReadableSpan[];

    beforeEach(async () => {
      create({});
      await graphql(schema, badQuery);
      spans = exporter.getFinishedSpans();
    });

    afterEach(() => {
      exporter.reset();
      graphQLPlugin.disable();
      spans = [];
    });

    it('should have 1 span', () => {
      assert.deepStrictEqual(spans.length, 1);
    });

    it('should instrument parse with error', () => {
      const parseSpan = spans[0];
      const event = parseSpan.events[0];

      assert.ok(event);

      assert.deepStrictEqual(
        event.attributes!['exception.type'],
        'GraphQLError'
      );
      assert.ok(event.attributes!['exception.message']);
      assert.ok(event.attributes!['exception.stacktrace']);
      assert.deepStrictEqual(parseSpan.name, SpanNames.PARSE);
    });
  });

  describe('when query is correct but cannot be validated', () => {
    let spans: ReadableSpan[];

    beforeEach(async () => {
      create({});
      await graphql(schema, queryInvalid);
      spans = exporter.getFinishedSpans();
    });

    afterEach(() => {
      exporter.reset();
      graphQLPlugin.disable();
      spans = [];
    });

    it('should have 2 spans', () => {
      assert.deepStrictEqual(spans.length, 2);
    });

    it('should instrument parse with error', () => {
      const parseSpan = spans[0];
      assert.deepStrictEqual(
        parseSpan.attributes[SpanAttributes.SOURCE],
        '\n' +
          '  query {\n' +
          '    book(id: "*") {\n' +
          '      name\n' +
          '    }\n' +
          '  }\n'
      );
      assert.deepStrictEqual(parseSpan.name, SpanNames.PARSE);
    });

    it('should instrument validate', () => {
      const parseSpan = spans[0];
      const validateSpan = spans[1];

      assert.deepStrictEqual(validateSpan.name, SpanNames.VALIDATE);
      assert.deepStrictEqual(
        validateSpan.parentSpanId,
        parseSpan.spanContext.spanId
      );
      const event = validateSpan.events[0];

      assert.deepStrictEqual(event.name, 'exception');
      assert.deepStrictEqual(
        event.attributes!['exception.type'],
        SpanAttributes.ERROR_VALIDATION_NAME
      );
      assert.ok(event.attributes!['exception.message']);
    });
  });

  describe('when query operation is not supported', () => {
    let spans: ReadableSpan[];

    beforeEach(async () => {
      create({});
      await graphql({
        schema,
        source: sourceBookById,
        operationName: 'foo',
      });
      spans = exporter.getFinishedSpans();
    });

    afterEach(() => {
      exporter.reset();
      graphQLPlugin.disable();
      spans = [];
    });

    it('should have 3 spans', () => {
      assert.deepStrictEqual(spans.length, 3);
    });

    it('should instrument parse with error', () => {
      const parseSpan = spans[0];
      assert.deepStrictEqual(
        parseSpan.attributes[SpanAttributes.SOURCE],
        '\n' +
          '  query {\n' +
          '    book(id: *) {\n' +
          '      name\n' +
          '    }\n' +
          '  }\n'
      );
      assert.deepStrictEqual(parseSpan.name, SpanNames.PARSE);
    });

    it('should instrument validate', () => {
      const parseSpan = spans[0];
      const validateSpan = spans[1];

      assert.deepStrictEqual(validateSpan.name, SpanNames.VALIDATE);
      assert.deepStrictEqual(
        validateSpan.parentSpanId,
        parseSpan.spanContext.spanId
      );
      const event = validateSpan.events[0];

      assert.ok(!event);
    });

    it('should instrument execute', () => {
      const executeSpan = spans[2];
      const validateSpan = spans[1];

      assert.deepStrictEqual(
        executeSpan.attributes[SpanAttributes.SOURCE],
        '\n' +
          '  query {\n' +
          '    book(id: *) {\n' +
          '      name\n' +
          '    }\n' +
          '  }\n'
      );
      assert.deepStrictEqual(
        executeSpan.attributes[SpanAttributes.OPERATION],
        'Operation "foo" not supported'
      );
      assert.deepStrictEqual(executeSpan.name, SpanNames.EXECUTE);
      assert.deepStrictEqual(
        executeSpan.parentSpanId,
        validateSpan.spanContext.spanId
      );
    });
  });
});
