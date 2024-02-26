const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const cors = require('cors');

const app = express();
const corsOptions = {
    origin: 'http://218.38.65.83', // 모바일 앱의 도메인 또는 IP 주소로 변경
    optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));
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
            console.log('Data received from mobile and sent to PC:', data);
        }
    });

    socket.on('dogDataFromMobile', (dogData) => {
        if (pcClient) {
            pcClient.emit('dogDataFromMobile', dogData);
            console.log('Dog data received from mobile and sent to PC:', dogData);
        }
    });

    socket.on('dataFromPC', (data) => {
        if (mobileClient) {
            mobileClient.emit('dataToMobile', data);
            console.log('Data received from PC and sent to mobile:', data);
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
