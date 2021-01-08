require("./tracing").setup('client.json');

import { get } from 'http';

get('http://localhost:' + process.env.PORT + '/some/path?arg=yes', (res) => {
    res.resume();
});
