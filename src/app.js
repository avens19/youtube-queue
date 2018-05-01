import express from 'express';
import Socketio from 'socket.io';
import http from 'http';
import uuid from 'uuid';

const app = express();
const server = new http.Server(app);
const io = new Socketio(server);

app.use(express.static('public'));

const queue = [];
let nowPlaying = null;
let paused = false;

io.on('connection', (socket) => {
  socket.emit('queueChanged', queue);
  if (nowPlaying) {
    socket.emit('nowPlaying', nowPlaying);
    if (paused) {
      socket.emit('paused');
    } else {
      socket.emit('playing');
    }
  }

  socket.on('add', ({ url }) => {
    // 'https://www.googleapis.com/youtube/v3/videos?key=AIzaSyBrxQ9kYqGoeEofFm7u-NVu4nDV_0LKOXc&part=snippet&id=K4bBjTUNSq8'
    queue.push({
      id: uuid.v4(),
      url: url
    });
    io.emit('queueChanged', queue);
  });
  socket.on('remove', ({ id }) => {
    const index = queue.findIndex((item) => item.id === id);
    if (index >= 0) {
      queue.splice(index, 1);
      io.emit('queueChanged', queue);
    }
  });
  socket.on('move', ({ id, newIndex }) => {
    if (newIndex >= queue.length) {
      return;
    }
    const index = queue.findIndex((item) => item.id === id);
    if (index >= 0) {
      const item = queue[index];
      queue.splice(index, 1);
      queue.splice(newIndex, 0, item);
      io.emit('queueChanged', queue);
    }
  });
  socket.on('dequeue', () => {
    queue.splice(0, 1);
    io.emit('queueChanged', queue);
  });
  socket.on('nowPlaying', (item) => {
    nowPlaying = item;
    socket.broadcast.emit('nowPlaying', item);
  });
  socket.on('skipRequested', () => {
    socket.broadcast.emit('skipRequested');
  });
  socket.on('playPauseRequested', () => {
    socket.broadcast.emit('playPauseRequested');
  });
  socket.on('playing', () => {
    paused = false;
    socket.broadcast.emit('playing');
  });
  socket.on('paused', () => {
    paused = true;
    socket.broadcast.emit('paused');
  });
});

server.listen(process.env.PORT || 3000); // eslint-disable-line no-process-env