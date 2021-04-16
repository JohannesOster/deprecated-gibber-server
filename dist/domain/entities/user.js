"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createUser = void 0;
var uuid_1 = require("uuid");
var createUser = function (username, userId) {
    if (userId === void 0) { userId = uuid_1.v4(); }
    return {
        username: username,
        userId: userId,
        score: 0,
        increaseScore: function () {
            this.score += 1;
        },
        decreaseScore: function () {
            this.score -= 1;
        },
    };
};
exports.createUser = createUser;
