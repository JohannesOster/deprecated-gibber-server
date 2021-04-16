"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createRoom = void 0;
var uuid_1 = require("uuid");
var createRoom = function (_words, roomId) {
    if (roomId === void 0) { roomId = uuid_1.v4(); }
    return {
        roomId: roomId,
        _words: _words,
        _users: [],
        getUsers: function () {
            return this._users.sort(function (a, b) {
                if (a.score > b.score)
                    return 1;
                if (a.score < b.score)
                    return -1;
                return a.username > b.username ? 1 : -1;
            });
        },
        join: function (user) {
            this._users.push(user);
        },
        leave: function (user) {
            var idx = this._users.findIndex(function (_user) { return _user.userId === user.userId; });
            if (idx === -1)
                return;
            this._users.splice(idx, 1);
            this._words.forEach(function (word) {
                if (word.claimedBy !== user.userId)
                    return;
                word.unclaim();
                word.score = 0;
            });
        },
        claim: function (user, word) {
            this._words.forEach(function (_word) {
                if (_word.claimedBy !== user.userId && _word.word !== word)
                    return;
                _word.word === word ? _word.claim(user.userId) : _word.unclaim();
            });
        },
        unclaim: function (user, word) {
            for (var i = 0; i < this._words.length; i++) {
                if (_words[i].word !== word)
                    continue;
                _words[i].unclaim();
                break;
            }
        },
        open: function (word) {
            for (var i = 0; i < this._words.length; i++) {
                if (_words[i].word !== word)
                    continue;
                _words[i].unclaim();
                break;
            }
        },
        challange: function (user, word) {
            for (var i = 0; i < this._words.length; i++) {
                if (_words[i].word !== word)
                    continue;
                if (_words[i].claimedBy !== user.userId)
                    break;
                _words[i].challange();
                break;
            }
        },
        accept: function (user, word) {
            for (var i = 0; i < this._words.length; i++) {
                if (_words[i].word !== word)
                    continue;
                _words[i].accept();
                break;
            }
        },
        deny: function (user, word) {
            for (var i = 0; i < this._words.length; i++) {
                if (_words[i].word !== word)
                    continue;
                _words[i].deny();
                break;
            }
        },
        getUser: function (userId) {
            return this._users.find(function (_user) { return _user.userId === userId; });
        },
        getWord: function (word) {
            return this._words.find(function (_word) { return _word.word === word; });
        },
    };
};
exports.createRoom = createRoom;
