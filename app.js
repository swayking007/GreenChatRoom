const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Serve index.html
app.use(express.static(__dirname));

io.on('connection', (socket) => {
    console.log("User connected:", socket.id);

    socket.on('joinRoom', ({ username, room }) => {
        socket.join(room);
        socket.username = username;
        socket.room = room;

        console.log(`${username} joined ${room}`);

        socket.to(room).emit('chat message', {
            user: "System",
            text: `${username} joined the room`
        });
    });

    socket.on('chat message', (msg) => {
        io.to(socket.room).emit('chat message', {
            user: socket.username,
            text: msg
        });
    });

    socket.on('disconnect', () => {
        if (socket.username && socket.room) {
            io.to(socket.room).emit('chat message', {
                user: "System",
                text: `${socket.username} left the room`
            });
        }

        console.log("User disconnected:", socket.id);
    });
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
