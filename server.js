const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const cors = require('cors');

const app = express();
const corsOptions = {
    origin: '*', // 모든 origin에 대해 CORS를 허용합니다.
    optionsSuccessStatus: 200,
};
app.use(cors(corsOptions)); // 모든 origin에 대해 CORS를 허용합니다.
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
        console.log('Mobile client connected:', socket.id);
    });

    socket.on('pc', () => {
        pcClient = socket;
        console.log('PC client connected:', socket.id);
    });

    socket.on('dataFromMobile', (data) => {
        if (pcClient) {
            pcClient.emit('dataToClient', data);
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
            mobileClient.emit('dataToClient', data);
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
