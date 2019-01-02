$(() => {
    var name = '';
    while(name == '' || name == 'null'){
        name = prompt('이름을 정하세요');
    }
    const socket = io();
    let room = ['room1', 'room2']; //default rooms
    let num = 0;

    socket.emit('joinRoom', num, name);


    if(name != 'null' || name != ''){
        socket.emit('loadRooms', (room));
    }
        $('#roomInfo').click(function() {
        $("#roomName").css("display", "inline"); $("#roomconfirm").css("display", "inline"); $("#reset").css("display", "inline");
    });

    $("#reset").click(function() {
        $("#roomName").css("display", "none"); $("#roomconfirm").css("display", "none"); $("#reset").css("display", "none");
    });

    $("#roomconfirm").click(function() {
        if($("#roomName").val != ''){
            var roomNm = $("#roomName").val();
            socket.emit('addRoom', roomNm);
        }
    });

    socket.on('addRooms', (name) => {
        var roomNum = room.length;
        room.push(name);
        $("#roomselector").append("<option value="+roomNum+">"+name+"</option>");
        $("#roomName").css("display", "none"); $("#roomconfirm").css("display", "none"); $("#reset").css("display", "none");
    });

    var previous;
    $("select").on('focus', function() {
        previous = $(this).val();
    }).change(() => {
        socket.emit('leaveRoom', previous, name);
        var roomNum = $("#roomselector").val();
        socket.emit('joinRoom', roomNum, name);
    });


    $('form').submit(() => {
        if($('#m').val() != ''){
            var roomNum = $("#roomselector").val();
            socket.emit('chat message', roomNum, name, $('#m').val());
            $('#m').val('');
            $('#m').focus();
            return false;
        }else {
            return false;
        }
    });

    socket.on('chat message', (name, msg) => {
    $('#messages').append(msg + '\n');
    $('#messages').scrollTop($('#messages')[0].scrollHeight);

    });

    socket.on('leaveRoom', (num, name) => {
        $('#messages').append(name + '가 ' + num + '에서 퇴장' + '\n');
    });

    socket.on('joinRoom', (num, name) => {
        $('#messages').append(name + '가 ' + num + '에 입장' + '\n');
    });

    socket.on('loadRooms', (rooms) => {
        for(var i=0; i<= rooms.length-1; i++){
            $("#roomselector").append("<option value="+i+">"+rooms[i]+"</option>");
        }
    });
});