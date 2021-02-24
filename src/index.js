const express = require('express');
const path = require('path');
const http = require('http');
const app = express();
const socketio = require('socket.io');
const PORT = process.env.PORT ||3000;
const publicDirectoryPath = path.join(__dirname, '../public');
const Filter =  require('bad-words');
const server = http.createServer(app);
const io = socketio(server);
const {generateMessage , generateLocationMessage} = require('./utils/messages');
const {adduser,removeuser,getuser, getusersinroom } = require('./utils/users');


app.use(express.static(publicDirectoryPath));

io.on('connection',  (socket)=>{
    console.log('new websocket is connected');

    // socket.emit('message' , generateMessage('Welcome Junta for chat'));

    // socket.broadcast.emit('message' , generateMessage('A new user has joined the room'));

    socket.on('join' , ({username , room} , callback)=>{
        const {error , user} = adduser({id : socket.id ,username , room})
        if(error){
            return callback(error);
        }
        socket.join(user.room);
        socket.emit('message' , generateMessage('Welcome Junta'));
        socket.broadcast.to(user.room).emit('message' , generateMessage(`${user.username} has joined ${user.room} room` , user.username));
        io.to(user.room).emit('roomData' , {
            room: user.room,
            users : getusersinroom(user.room)
        })
        
        callback();
    })

    socket.on('sendMessage' , (message, callback)=>{
        const user = getuser(socket.id);
        const filter = new Filter();
        if(filter.isProfane(message)){
            return callback('Bad words are not allowed');
        }
        io.to(user.room).emit('message' , generateMessage(message ,user.username));  // io.emit does broadcasting to every connecte d client//
        
        io.to(user.room).emit('roomData' , {
            room: user.room,
            users : getusersinroom(user.room)
        })
        
        callback();
    })

    socket.on('sendLocation' , (coords, callback) =>{
        const user = getuser(socket.id);
        io.to(user.room).emit('locationmessage' , generateLocationMessage(`https://google.com/maps?q=${coords.latitude},${coords.longitude}` , user.username));
        callback();
    })


    


    socket.on('disconnect' , ()=>{
       const user = removeuser(socket.id);
        if(user){
            io.to(user.room).emit('message' , generateMessage(`${user.username} has left` , user.username));

            io.to(user.room).emit('roomData' , {
                room: user.room,
                users : getusersinroom(user.room)
            })
        }
        
    })

    

})

server.listen(PORT , ()=>{
    console.log(`server running on port ${PORT}`)
})