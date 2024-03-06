const WebSocket = require('ws');

const ws = new WebSocket('ws://localhost:3567');

ws.on('open', () => {
    console.log('Connected to server');

    // 테스트를 위해 채널 1로 메시지 보내기
    const message = {
        channel: 1,
        packet: 'test_packet',
        message: 'Hello, Server!'
    };

    ws.send(JSON.stringify(message));
});

ws.on('message', (data) => {
    try {
        const serverMessage = JSON.parse(data);
        console.log('Received from server:', serverMessage);

        // 테스트를 위해 서버로부터 받은 메시지 재전송
        ws.send(data);
    } catch (error) {
        console.error('Error handling server message:', error);
    }
});

ws.on('close', () => {
    console.log('Connection closed');
});
