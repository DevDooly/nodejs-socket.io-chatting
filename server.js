var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.get("/", function(req, res) {
    res.sendfile("client.html");
});

var count = 1;
var userList = [];

io.on('connection', function(socket) {
    console.log('user connected: ', socket.id);

    var name = "user" + count++;

    io.to(socket.id).emit('set name', name);

    userList.push(name);
    socket.broadcast.emit('user connect', {
        name: name,
        userList: userList
    });

    // io.to(socket.id).emit('change name', name);
    socket.emit('welcome', {
        name: name,
        userList: userList
    });

    socket.on('disconnect', function() {
        console.log('user disconnected: ', socket.id);

        var i = userList.indexOf(name);
        userList.splice(i, 1);

        socket.broadcast.emit('left', {
            name: name,
            userList: userList
        });
    });

    socket.on('send message', function(aftername, text) {


        if (name != aftername) {

            var i = userList.indexOf(aftername);

            if (i == -1) {
                userList.splice(i, 1, aftername);

                socket.broadcast.emit('change name', {
                    name: name,
                    aftername: aftername,
                    userList: userList
                });
                socket.emit('change name', {
                    name: name,
                    aftername: aftername,
                    userList: userList
                });
                name = aftername;
            } else {
                socket.emit('name redup', {
                    name: name,
                    aftername: aftername
                });
            }
        }

        var msg = name + ' : ' + text;
        console.log(msg);
        io.emit('receive message', msg);
    });
});

http.listen('50000', function() {
    console.log("server on!");
});
