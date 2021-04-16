"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var server_1 = __importDefault(require("infrastructure/server"));
var port = process.env.port || 3000;
server_1.default.listen(port, function () {
    console.log("Listening on port " + port);
});
