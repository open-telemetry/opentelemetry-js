# Running the code -
`node --require './tracing_books' books.js`
Open http://localhost:3000/books in your web browser and reload the page a few times, after a while you should see the spans printed in the console by the ConsoleSpanExporter.
## Output -
{
  traceId: '303c61f16423bcdb9d7ab3929176eed0',
  parentId: 'f168e05f3986e6b2',
  name: 'middleware - query',
  id: '93bbc73f282f3a55',
  kind: 0,
  timestamp: 1657029759519498,
  duration: 650,
  attributes: {
    'http.route': '/',
    'express.name': 'query',
    'express.type': 'middleware'
  },
  status: { code: 0 },
  events: [],
  links: []
}
{
  traceId: '303c61f16423bcdb9d7ab3929176eed0',
  parentId: 'f168e05f3986e6b2',
  name: 'middleware - expressInit',
  id: '462263fbeb359d0a',
  kind: 0,
  timestamp: 1657029759521039,
  duration: 256,
  attributes: {
    'http.route': '/',
    'express.name': 'expressInit',
    'express.type': 'middleware'
  },
  status: { code: 0 },
  events: [],
  links: []
}
{
  traceId: '303c61f16423bcdb9d7ab3929176eed0',
  parentId: 'f168e05f3986e6b2',
  name: 'middleware - corsMiddleware',
  id: '2c2bbb024dd97115',
  kind: 0,
  timestamp: 1657029759521505,
  duration: 713,
  attributes: {
    'http.route': '/',
    'express.name': 'corsMiddleware',
    'express.type': 'middleware'
  },
  status: { code: 0 },
  events: [],
  links: []
}
{
  traceId: '303c61f16423bcdb9d7ab3929176eed0',
  parentId: 'f168e05f3986e6b2',
  name: 'request handler - /books',
  id: '5c104c7badef5978',
  kind: 0,
  timestamp: 1657029759531105,
  duration: 178,
  attributes: {
    'http.route': '/books',
    'express.name': '/books',
    'express.type': 'request_handler'
  },
  status: { code: 0 },
  events: [],
  links: []
}
{
  traceId: '303c61f16423bcdb9d7ab3929176eed0',
  parentId: undefined,
  name: 'GET /books',
  id: 'f168e05f3986e6b2',
  kind: 1,
  timestamp: 1657029759493624,
  duration: 55760,
  attributes: {
    'http.url': 'http://localhost:3000/books',
    'http.host': 'localhost:3000',
    'net.host.name': 'localhost',
    'http.method': 'GET',
    'http.target': '/books',
    'http.user_agent': 'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:101.0) Gecko/20100101 Firefox/101.0',
    'http.flavor': '1.1',
    'net.transport': 'ip_tcp',
    'net.host.ip': '::ffff:127.0.0.1',
    'net.host.port': 3000,
    'net.peer.ip': '::ffff:127.0.0.1',
    'net.peer.port': 49664,
    'http.status_code': 304,
    'http.status_text': 'NOT MODIFIED',
    'http.route': '/books'
  },
  status: { code: 0 },
  events: [],
  links: []
}
