const express = require('express');
const http = require('http');
const socketIO = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

let mobileClient;
let pcClient;

app.get('/socket', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

// 모바일 클라이언트용 HTML 파일 라우팅
app.get('/mobile', (req, res) => {
    res.sendFile(__dirname + '/mobile.html');
});

// PC 클라이언트용 HTML 파일 라우팅
app.get('/pc', (req, res) => {
    res.sendFile(__dirname + '/pc.html');
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

    socket.on('dataFromMobile', (dogData) => {
        if (pcClient) {
            pcClient.emit('dataFromMobile', dogData);
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
