"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createWord = void 0;
var createWord = function (word) {
    return {
        word: word,
        status: 'open',
        score: 1,
        claim: function (userId) {
            this.status = 'claimed';
            this.claimedBy = userId;
        },
        unclaim: function () {
            this.status = 'open';
            delete this.claimedBy;
        },
        challange: function () {
            this.status = 'challanged';
        },
        accept: function () {
            this.score += 1;
        },
        deny: function () {
            this.score -= 1;
        },
    };
};
exports.createWord = createWord;
