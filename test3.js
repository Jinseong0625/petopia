const WebSocket = require('ws');

const ws = new WebSocket('ws://localhost:3567');

ws.on('open', () => {
    console.log('Connected to server');

    // 최초 연결 시, 채널 생성 요청
    ws.send(JSON.stringify({ channel: -1 }));
});

ws.on('message', (data) => {
    try {
        const serverMessage = JSON.parse(data);
        console.log('Received from server:', serverMessage);

        // 서버로부터 채널이 생성되었을 때
        if (serverMessage.channelCreated) {
            // 서버에서 받은 채널 번호로 다른 동작 수행 가능
            console.log(`Channel ${serverMessage.channelCreated} created.`);
        }

        // 서버로부터의 다양한 메시지에 대한 처리
    } catch (error) {
        console.error('Error handling server message:', error);
    }
});

ws.on('close', () => {
    console.log('Connection closed');
});

// 테스트 메시지 전송 (실제 게임에서는 해당 부분을 적절한 동작으로 대체)
setTimeout(() => {
    ws.send(JSON.stringify({ channel: 1, packet: 3, message: 'Test message' }));
}, 2000);
