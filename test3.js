const WebSocket = require('ws');

const ws = new WebSocket('ws://localhost:3567');

ws.on('open', () => {
    console.log('Connected to server');

    // 테스트용 메시지 전송
    const message = {
        channel: 1,
        target: 'all',
        packet: 'test',
        message: 'Hello, server!'
    };

    ws.send(JSON.stringify(message));
});

ws.on('message', (data) => {
    console.log('Received from server:', data);

    // 연결 종료
    ws.close();
});

ws.on('close', () => {
    console.log('Connection closed');
});
