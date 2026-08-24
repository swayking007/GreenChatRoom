const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(__dirname));

io.on('connection', (socket) => {
    console.log("User connected:", socket.id);

    // Join room
    socket.on('joinRoom', ({ username, room }) => {
        socket.join(room);
        socket.username = username;
        socket.room = room;

        console.log(`${username} joined ${room}`);

        // Notify others
        socket.to(room).emit('chat message', {
            user: "System",
            text: `${username} joined the room`
        });
    });

    // Chat message
    socket.on('chat message', (msg) => {
        io.to(socket.room).emit('chat message', {
            user: socket.username,
            text: msg
        });
    });

    // Disconnect
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
app.get("/", (req, res) => {
    res.send("Socket.IO server is running!");
});
// server.listen(3000, () => {
//     console.log("Server running on port 3000");
// });
