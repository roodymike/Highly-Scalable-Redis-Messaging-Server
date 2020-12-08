const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const cors = require('cors');

var bodyParser = require('body-parser');
var fs = require('fs');
var creds = '';

// Store people in chatroom
var chatters = [];

var chat_messages = [];

var redis = require('redis');
var client = '';

const { addUser, removeUser, getUser, getUsersInRoom } = require('./users');

const router = require('./router');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

// Read credentials from JSON
fs.readFile('redis_creds.json', 'utf-8', function(err, data) {
    if (err) throw err;
    creds = JSON.parse(data);
    var final_cred = '';
    if (creds.user.length > 0 || creds.password > 0) {
        final_cred = +creds.user + ':' + creds.password + '@';
    }
    try {
        client = redis.createClient('redis://' + final_cred + 'rds_msg' + ':' + creds.port);
        console.log('Redis connection success!');
    } catch (err) {
        console.log('Unsuccessful connection');
    }
    // Redis Client Ready
    client.once('ready', function() {

        // Flush Redis DB
        // client.flushdb();

        // Initialize Chatters
        client.get('chat_users', function(err, reply) {
            chatters = JSON.parse(reply);
            console.log('init done for redis reply value = ' + reply);
        });

        // Initialize Messages
        client.get('chat_app_messages', function(err, reply) {
            if (reply) {
                chat_messages = JSON.parse(reply);
            }
        });
    });
});

app.use(cors());
app.use(router);

io.on('connect', (socket) => {
    socket.on('join', ({ name, room }, callback) => {
        const { error, user } = addUser({ id: socket.id, name, room });

        if (error) return callback(error);
        socket.join(user.room);
        chatters.push({
            'user': user.name,
            'room': user.room
        });

        client.set('chat_users', JSON.stringify(chatters));
        socket.emit('message', { user: 'admin', text: `${user.name}, welcome to room ${user.room}.` });
        socket.broadcast.to(user.room).emit('message', { user: 'admin', text: `${user.name} has joined!` });
        io.to(user.room).emit('roomData', { room: user.room, users: getUsersInRoom(user.room) });

        callback();
    });

    socket.on('sendMessage', (message, callback) => {
        const user = getUser(socket.id);

        chat_messages.push({
            'sender': user.name,
            'message': message
        });
        client.set('chat_app_messages', JSON.stringify(chat_messages));
        io.to(user.room).emit('message', { user: user.name, text: message });

        callback();
    });

    socket.on('disconnect', () => {
        const user = removeUser(socket.id);

        if (user) {
            io.to(user.room).emit('message', { user: 'Admin', text: `${user.name} has left.` });
            io.to(user.room).emit('roomData', { room: user.room, users: getUsersInRoom(user.room) });
        }
    })
});

server.listen(12000, () => console.log(`Server has started. at ` + 12000));