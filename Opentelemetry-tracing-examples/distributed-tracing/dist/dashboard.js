"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const tracing_1 = __importDefault(require("./tracing"));
const { sdk } = (0, tracing_1.default)('dashboard-service');
const api = __importStar(require("@opentelemetry/api"));
const express_1 = __importDefault(require("express"));
const app = (0, express_1.default)();
const port = 3001;
//app.use(cors());
const getUrlContents = (url, fetch) => {
    return new Promise((resolve, reject) => {
        fetch(url, resolve, reject)
            .then(res => res.text())
            .then(body => resolve(body));
    });
};
//app.get('/dashboard',cors(), async (req, res) => {
app.get('/dashboard', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        //fetch data running from second service
        const books = yield getUrlContents('http://localhost:3000/books', require('node-fetch'));
        res.type('json');
        res.send(JSON.stringify({ dashboard: books }));
    }
    catch (e) {
        const activeSpan = api.trace.getSpan(api.context.active());
        console.error(`Critical error`, { traceId: activeSpan.spanContext().traceId });
        activeSpan.recordException(e.message);
        res.sendStatus(500);
    }
}));
app.listen(port, () => { console.log(`Listening at http://localhost:${port}`); });
