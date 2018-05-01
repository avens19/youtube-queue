/* eslint-disable prefer-arrow-callback */
/* global io, ko */

function IndexViewModel() {
  const socket = io.connect('/');
  this.url = ko.observable();
  this.queue = ko.observableArray([]);
  this.nowPlaying = ko.observable();
  this.paused = ko.observable(false);

  const self = this;
  this.add = function() {
    socket.emit('add', {
      url: self.url()
    });
    self.url(null);
  };
  // this.playPause = function() {
  //   socket.emit('playPauseRequested');
  // };
  // this.skip = function() {

  // };
  // this.moveUp = function(item) {

  // };
  // this.moveDown = function(item) {

  // };

  socket.on('queueChanged', function(queue) {
    self.queue(queue);
  });
  socket.on('nowPlaying', function(item) {
    self.nowPlaying(item);
  });
  socket.on('playing', function() {
    self.paused(false);
  });
  socket.on('paused', function() {
    self.paused(true);
  });
}

ko.applyBindings(new IndexViewModel());