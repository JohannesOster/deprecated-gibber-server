"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var http_1 = require("http");
var websockets_1 = require("./websockets");
var server = http_1.createServer();
websockets_1.createSocketServer(server);
exports.default = server;
