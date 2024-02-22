// 서버 측 (Node.js)
const express = require('express');
const http = require('http');
const socketIO = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIO(server, { path: '/socket.io' });
//const io = socketIO(server);

// 모바일 클라이언트와 PC 클라이언트를 저장할 변수
let mobileClient;
let pcClient;

app.get('/socket.io', (req, res) => {
    res.sendFile(__dirname + '/index.html');
  });


io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('mobile', () => {
    // 모바일 클라이언트로 설정
    mobileClient = socket;
  });

  socket.on('pc', () => {
    // PC 클라이언트로 설정
    pcClient = socket;
  });

  socket.on('dataFromMobile', (data) => {
    // 모바일 클라이언트로부터 데이터를 받아서 PC 클라이언트로 중계
    if (pcClient) {
      pcClient.emit('dataToPC', data);
    }
  });
});

const PORT = process.env.PORT || 3567;
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
