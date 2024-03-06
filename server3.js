const http = require('http');
const express = require('express');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// 클라이언트 연결 시
io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    // 클라이언트로부터 메시지 수신
    socket.on('message', (data) => {
        try {
            // JSON 형식의 데이터를 파싱
            const clientMessage = JSON.parse(data);
            console.log('Received from client:', clientMessage);
            // 클라이언트에게 받은 데이터를 그대로 전송 (또는 필요한 로직 수행)
            io.emit('message', data);
        } catch (error) {
            console.error('Error handling data:', error);
        }
    });

    // 클라이언트 연결 해제 시
    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
    });
});

// 서버 리스닝
const PORT = 3567;
server.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});
