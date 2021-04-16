"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSocketServer = void 0;
var room_1 = require("domain/entities/room");
var user_1 = require("domain/entities/user");
var word_1 = require("domain/entities/word");
var socket_io_1 = require("socket.io");
var createSocketServer = function (httpServer) {
    var socketIOServer = new socket_io_1.Server(httpServer);
    // initialize single room as long as not room management is implemented
    var room = room_1.createRoom([
        word_1.createWord('Apfel'),
        word_1.createWord('Birne'),
        word_1.createWord('Schinken'),
    ]);
    socketIOServer.on('connection', function (socket) {
        var username = socket.handshake.query.username;
        var user = user_1.createUser(username);
        socket.join(room.roomId);
        room.join(user);
        socketIOServer.in(room.roomId).emit('users', room.getUsers());
        socket.emit('connected', user); // successfully connected
        socket.emit('words', room._words);
        socket.on('claim', function (user, word) {
            var _user = user_1.createUser(user.username, user.userId);
            room.claim(_user, word);
            socketIOServer.in(room.roomId).emit('words', room._words);
        });
        socket.on('unclaim', function (user, word) {
            var _user = user_1.createUser(user.username, user.userId);
            room.unclaim(_user, word);
            socketIOServer.in(room.roomId).emit('words', room._words);
        });
        socket.on('challange', function (user, word) {
            room.challange(user_1.createUser(user.username, user.userId), word);
            socketIOServer.in(room.roomId).emit('words', room._words);
            socket.to(room.roomId).emit('challange', word);
            setTimeout(function () {
                var _user = room.getUser(user === null || user === void 0 ? void 0 : user.userId);
                var _word = room.getWord(word);
                if (((_word === null || _word === void 0 ? void 0 : _word.score) || 0) < 1)
                    _user === null || _user === void 0 ? void 0 : _user.decreaseScore();
                else
                    _user === null || _user === void 0 ? void 0 : _user.increaseScore();
                room.open(word);
                socketIOServer.in(room.roomId).emit('words', room._words);
                socketIOServer.in(room.roomId).emit('users', room.getUsers());
            }, 3000);
        });
        socket.on('accept', function (user, word) {
            var _user = user_1.createUser(user.username, user.userId);
            room.accept(_user, word);
        });
        socket.on('deny', function (user, word) {
            var _user = user_1.createUser(user.username, user.userId);
            room.deny(_user, word);
        });
        socket.on('disconnect', function () {
            room.leave(user);
            socketIOServer.in(room.roomId).emit('users', room.getUsers());
        });
    });
};
exports.createSocketServer = createSocketServer;
