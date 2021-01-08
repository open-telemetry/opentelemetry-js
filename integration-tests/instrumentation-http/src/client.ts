require("./tracing").setup('client.json');

import { get } from 'http';
import axios from 'axios';
import got from 'got';
import * as request from 'request';
import * as superagent from 'superagent';


function getHttp() {
    return new Promise((resolve, reject) => {
        get(`http://localhost:${process.env.PORT}/integration/http?arg=yes`, (res) => {
            res.resume();
            res.on('end', () => {
                resolve();
            })
        });
    })
}

function getRequest() {
    return new Promise((resolve) => {
        request.get(`http://localhost:${process.env.PORT}/integration/request?arg=yes`, () => {
            resolve();
        })
    })
}

async function main() {
    await getHttp();
    await axios.get(`http://localhost:${process.env.PORT}/integration/axios?arg=yes`);
    await got.get(`http://localhost:${process.env.PORT}/integration/got?arg=yes`);
    await getRequest();
    await superagent.get(`http://localhost:${process.env.PORT}/integration/superagent?arg=yes`);
}

main();