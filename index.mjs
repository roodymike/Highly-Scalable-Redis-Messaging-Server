//const http = require('http');
//const express = require('express');
//const socketio = require('socket.io');
//const cors = require('cors');
//
//var bodyParser = require('body-parser');
//var fs = require('fs');
//var creds = '';
//
//// Store people in chatroom
//var chatters = [];
//
//
//var chat_messages = [];
//
//var redis = require('redis');
//var client = '';
//
//const { addUser, removeUser, getUser, getUsersInRoom } = require('./users');
//
//const router = require('./router');
//
//const app = express();
//const server = http.createServer(app);
//const io = socketio(server);
//
//// Read credentials from JSON
//fs.readFile('redis_creds.json', 'utf-8', function(err, data) {
//    if (err) throw err;
//    creds = JSON.parse(data);
//    var final_cred = '';
//    if (creds.user.length > 0 || creds.password > 0) {
//        final_cred = +creds.user + ':' + creds.password + '@';
//    }
//    try {
//        //client = redis.createClient('redis://' + final_cred + 'rds_msg' + ':' + creds.port);
//        client = redis.createClient('redis://localhost' + ':' + creds.port);
//        console.log('Redis connection success!');
//    } catch (err) {
//        console.log('Unsuccessful connection');
//    }
//    // Redis Client Ready
//    client.once('ready', function() {
//
//        // Flush Redis DB
//        // client.flushdb();
//
//        // Initialize Chatters
//        client.get('chat_users', function(err, reply) {
//            chatters = JSON.parse(reply);
//            console.log('init done for redis reply value = ' + reply);
//        });
//
//        // Initialize Messages
//        client.get('chat_app_messages', function(err, reply) {
//            if (reply) {
//                chat_messages = JSON.parse(reply);
//            }
//        });
//    });
//});
//
//app.use(cors());
//app.use(router);
//
//io.on('connect', (socket) => {
//    socket.on('join', ({ name, room }, callback) => {
//        const { error, user } = addUser({ id: socket.id, name, room });
//
//        if (error) return callback(error);
//        socket.join(user.room);
//        chatters.push({
//            'user': user.name,
//            'room': user.room
//        });
//
//        client.set('chat_users', JSON.stringify(chatters));
//        socket.emit('message', { user: 'admin', text: `${user.name}, welcome to room ${user.room}.` });
//        socket.broadcast.to(user.room).emit('message', { user: 'admin', text: `${user.name} has joined!` });
//        io.to(user.room).emit('roomData', { room: user.room, users: getUsersInRoom(user.room) });
//
//        callback();
//    });
//
//    socket.on('sendMessage', (message, callback) => {
//        const user = getUser(socket.id);
//
//        chat_messages.push({
//            'sender': user.name,
//          //  'message': message
//        //});
//        //client.set('chat_app_messages', JSON.stringify(chat_messages));
//        //io.to(user.room).emit('message', { user: user.name, text: message });
//
//      //  callback();
//    //});
//
//    //socket.on('disconnect', () => {
//     //   const user = removeUser(socket.id);
//
//        //if (user) {
//        //    io.to(user.room).emit('message', { user: 'Admin', text: `${user.name} has left.` });
//      //      io.to(user.room).emit('roomData', { room: user.room, users: getUsersInRoom(user.room) });
//    //    }
//  //  })
////});
//
////server.listen(12000, () => console.log(`Server has started. at ` + 12000));

import http from "http";
import ws from "websocket"
import redis from "redis";
import os from "os";
import fs from "fs";

const APPID = os.hostname();
let connections = [];
const WebSocketServer = ws.server

var username = '';
var password = '';
var port = '6379';
var server = 'rds_msg';

const subscriber = redis.createClient({
    //username: username,
    //password: password,
    port: port,
    host: server
});

const publisher = redis.createClient({
    //username: username,
    //password: password,
    port: port,
    host: server
});


subscriber.on("subscribe", function(channel, count) {
    console.log(`Server ${APPID} subscribed successfully to livechat`)
    publisher.publish("livechat", "a message");
});

subscriber.on("message", function(channel, message) {
    try {
        //when we receive a message I want t
        console.log(`Server ${APPID} received message in channel ${channel} msg: ${message}`);
        connections.forEach(c => c.send(APPID + ":" + message))

    } catch (ex) {
        console.log("ERR::" + ex)
    }
});


subscriber.subscribe("livechat");


//create a raw http server (this will help us create the TCP which will then pass to the websocket to do the job)
const httpserver = http.createServer(function(req, res) {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.write('Server listening from hostname :- ' + os.hostname() + ' at 12000');
    res.end();
})

//pass the httpserver object to the WebSocketServer library to do all the job, this class will override the req/res 
const websocket = new WebSocketServer({
    "httpServer": httpserver
})


httpserver.listen(12000, () => console.log('My server ${APPID} is listening on port 12000'))

//when a legit websocket request comes listen to it and get the connection .. once you get a connection thats it! 
websocket.on("request", request => {

    const con = request.accept(null, request.origin)
    con.on("open", () => console.log("opened"))
    con.on("close", () => console.log("CLOSED!!!"))
    con.on("message", message => {
        //publish the message to redis
        console.log(`${APPID} Received message ${message.utf8Data}`)
        publisher.publish("livechat", message.utf8Data)
    })

    setTimeout(() => con.send(`Connected successfully to server ${APPID}`), 5000)
    connections.push(con)


})