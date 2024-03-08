const WebSocket = require('ws');

const ws = new WebSocket('ws://218.38.65.83:3567');

ws.on('open', () => {
    // 테스트 채널 생성
    const createChannelMessage = {
        channel: -1,
        packet: 'none',  // 또는 packet: 0
        message: 'Creating a new channel',
    };
    ws.send(JSON.stringify(createChannelMessage));
});

ws.on('message', (data) => {
    try {
        const serverResponse = JSON.parse(data);
        if (serverResponse.channelCreated) {
            // 서버로부터 채널 생성 메시지 수신
            const channel = serverResponse.channelCreated;
            
            // 테스트 데이터 전송
            const testDataMessage = {
                channel: channel,
                target: 'all',
                targetId: 0,
                packet: 'call',  // 또는 packet: 1
                message: 'Test message from client',
            };
            ws.send(JSON.stringify(testDataMessage));
        }
    } catch (error) {
        console.error('Error handling server response:', error);
    }
});

ws.on('close', () => {
    console.log('Connection closed');
});
