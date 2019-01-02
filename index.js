var express = require('express');
var app = express();
var path = require('path');
var http = require('http').Server(app);
var io = require('socket.io')(http);
var EventEmitter = require('events');
var fs = require('fs');


http.listen(80, function(){
    console.log('server has been connected port : 80');
});

let room = ['room1','room2'];
let a = 0;

var file = fs.createWriteStream('RoomLists.txt');
file.on('error', function(err) {console.log(err)});

file.write(room.toString()+',');


app.set('/views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', function(req, res){
    res.render('index');
});

io.on('connection', (socket) =>{
    socket.on('disconnect', () =>{
        console.log('user disconnected');
    });

    socket.on('leaveRoom', (num, name) =>{
        socket.leave(room[num], () => {
            fs.readFile('RoomLists.txt', function (err, data) {
                if(err) throw err;
                var roomsList = data.toString().split(',');
                console.log(name + ' leave a ' + roomsList[num]);
                io.to(roomsList[num]).emit('leaveRoom', room[num], name);
            });
        });
    });

    socket.on('joinRoom', (num, name) => {
        socket.join(room[num], () => {
            fs.readFile('RoomLists.txt', function (err, data) {
                if(err) throw err;
                var roomsList = data.toString().split(',');
            console.log(name + ' join a ' + room[num]);
            io.to(room[num]).emit('joinRoom', room[num], name);
            });
        });
    });

    socket.on('chat message', (num, name, msg) => {
        a = num;
        console.log(name + " : " + msg);
        var message = name + ' : ' + msg;
        io.to(room[a]).emit('chat message', name, message);
    });

    socket.on("addRoom", (name) => {
        room.push(name);
        file.write(name.toString()+',');
        io.emit('addRooms', name);
    });

    socket.on("loadRooms", (rooms) => {
        fs.readFile('RoomLists.txt', function (err, data) {
            if(err) throw err;
            data = data.toString().replace(/,(\s+)?$/, ''); 
            var roomsList = data.toString().split(',');
            io.to(socket.id).emit('loadRooms', roomsList);
        });
    });
});