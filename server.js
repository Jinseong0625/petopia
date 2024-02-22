const express = require('express');
const http = require('http');
const socketIO = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

let mobileClient;
let pcClient;

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    socket.on('mobile', () => {
        mobileClient = socket;
    });

    socket.on('pc', () => {
        pcClient = socket;
    });

    socket.on('dataFromMobile', (data) => {
        if (pcClient) {
            pcClient.emit('dataToPC', data);
        }
    });

    socket.on('dataFromPC', (data) => {
        if (mobileClient) {
            mobileClient.emit('dataToMobile', data);
        }
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
    });
});

const PORT = process.env.PORT || 3567;
server.listen(PORT, () => {
    console.log(`Relay Server running on http://localhost:${PORT}`);
});
