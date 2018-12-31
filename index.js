var express = require('express');
var app = express();
var path = require('path');
var http = require('http').Server(app);
var io = require('socket.io')(http);
var EventEmitter = require('events');
var emitter = new EventEmitter();
emitter.setMaxListeners(50);

http.listen(80, function(){
    console.log('server has been connected port : 80');
});

let room = ['room1', 'room2'];
let a = 0;

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
            console.log(name + ' leave a ' + room[num]);
            io.to(room[num]).emit('leaveRoom', num, name);
        });
    });

    socket.on('joinRoom', (num, name) => {
        socket.join(room[num], () => {
            console.log(name + ' join a ' + room[num]);
            io.to(room[num]).emit('joinRoom', num, name);
        });
    });

    socket.on('chat message', (num, name, msg) => {
        a = num;
        console.log(name + " : " + msg);
        var message = name + ' : ' + msg;
        io.to(room[a]).emit('chat message', name, message);
      });
});