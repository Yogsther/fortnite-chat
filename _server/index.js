/*
    Server-side socket.io main
*/

/** Choose a port */
var port = 9876;

var express = require("express");

var socket = require("socket.io");

var app = express();

/** Import file loader. */
var fs = require("fs");

var path = require('path');

var rooms = new Array();

var server = app.listen(port, function () {

  console.log("Listening to requests on port " + port);

  // Static files
  app.use(express.static("public"));

  // Socket setup
  var io = socket(server);

  io.on("connection", function (socket) {
    //  Socket
    socket.on("join", package => {

      if(package.username.length < 3){
        socket.emit("err", "Username is too short")
        return;
      }

      if (package.code.replace(/[^a-z0-9_ .]/gi, '').toUpperCase() !== package.code || package.code.length != 5) {
        socket.emit("err", "Code is invalid")
        return;
      }
      if (package.username.replace(/[^a-z0-9_ .]/gi, '') !== package.username || package.username.length > 15) {
        socket.emit("err", "Username is invalid")
        console.log("WARN: False username")
        return;
      }
      var room;
      if (getRoom(package.code) === false) {
        // Create new room
        newRoom(socket, package.code)
      }
      room = rooms[getRoom(package.code)];

      if(room.names.indexOf(package.username) != -1){
        socket.emit("err", "Username taken in this room.")
        return;
      }

      room.users.push(socket);
      room.names.push(package.username)
      room.chat.push({author: "Server", mod: "[Server]", content: package.username + " joined the room!", date: Date.now()});

      socket.emit("joined", {
        names: room.names,
        created: room.created,
        chat: room.chat,
        code: room.code
      })
    })

    socket.on("message", message => {
      var userRoom = getRoomFromUser(socket);
      if(userRoom !== false){ 
        var userIndex = -1;
        for(let i = 0; i < rooms[userRoom].users.length; i++){
          if(rooms[userRoom].users[i] == socket) userIndex = i;
        }
        if(userIndex == -1){
          console.log("WARN: -1 error");
          return;
        }
        var newMesssage = {content: message, author: rooms[userRoom].names[userIndex], date: Date.now()};
        rooms[userRoom].chat.push(newMesssage);
        rooms[userRoom].users.forEach(user => user.emit("message", newMesssage));
      }
    })


    /* END OF SOCKET */
  });
});

function getRoomFromUser(socket){
  for(let i = 0; i < rooms.length; i++){
    if(rooms[i].users.indexOf(socket) != -1) return i;
  }
  return false;
}

function getRoom(code) {
  for (let i = 0; i < rooms.length; i++) {
    if (rooms[i].code == code) {
      return i;
    }
  }
  return false;
}

function newRoom(socket, code) {
  
  var author = socket.request.connection.remoteAddress; // Get IP
  var count = 0;
  for(let i = 0; i < rooms.length; i++){
    if(rooms[i].author == author) count++;
  }
  if(count > 30){
    socket.emit("err", "You have created too many rooms!");
    return;
  }

  console.log("Room was created: " + code + " count: " + count);
  // Push room
  rooms.push({
    author: author,
    created: Date.now(),
    code: code,
    users: [],
    names: [],
    chat: []
  });
}