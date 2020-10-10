const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const Filter = require('bad-words');
const { generateMessage, generateLocationMessage } = require('./utils/messages');

const { addUser, removeUser, getUser, getUsersInRoom } = require('./utils/users');
const { callbackify } = require('util');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const port = process.env.PORT || 3000;
const publicDirectoryPath = path.join(__dirname, '../public');

app.use(express.static(publicDirectoryPath));


io.on('connection', (socket) => {

  socket.on('join', (options, callback) => {
    const { user, error } = addUser({ id: socket.id, ...options })

    if (error) {
      return callback(error)
    }

    socket.join(user.room);

    socket.emit('message', generateMessage('Bot', `Welcome! ${user.username}`));
    socket.broadcast.to(user.room).emit('message', generateMessage('Bot', `${user.username} joined the room`));
    io.to(user.room).emit('roomData', {
      room: user.room,
      users: getUsersInRoom(user.room)
    })

    callback()
  });

  // Message Profanity checking
  socket.on('send-message', (msg, callback) => {
    const user = getUser(socket.id)

    const filter = new Filter();

    if (filter.isProfane(msg)) {
      return callback('Profanity not allowed');
    }
    io.to(user.room).emit('message', generateMessage(user.username, msg));
    callback();
  });

  socket.on('send-location', (location, callback) => {
    const user = getUser(socket.id)
    io.to(user.room).emit(
      'locationMessage',
      generateLocationMessage(
        user.username,
        `https://www.google.com/maps?q=${location.latitude},${location.longitude}`
      )
    );
    callback();
  });

  socket.on('disconnect', () => {
    const user = removeUser(socket.id)

    if (user) {
      io.to(user.room).emit('message', generateMessage('Bot', `${user.username} has left`));
      io.to(user.room).emit('roomData', {
        room: user.room,
        users: getUsersInRoom(user.room)
      })
    }
  });
});

server.listen(port);
