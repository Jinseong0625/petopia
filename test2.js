const WebSocket = require('ws');

const ws = new WebSocket('ws://218.38.65.83:3567');

ws.on('open', () => {
    // 채널 생성 요청 보내기
    const createChannelMessage = {
        channel: -1,
        packet: 0,  // enum에서 none에 해당하는 값
        message: 'Creating a new channel',
    };
    ws.send(JSON.stringify(createChannelMessage));
});

ws.on('message', (data) => {
    try {
        const serverResponse = JSON.parse(data);
        if (serverResponse.channelCreated) {
            const channel = serverResponse.channelCreated;
            console.log(`Channel ${channel} created. Sending test message...`);

            // 테스트 데이터 전송
            const testDataMessage = {
                channel: channel,
                target: 'all',
                targetId: 0,
                packet: 1,  // enum에서 call에 해당하는 값
                message: 'Test message from client',
            };
            ws.send(JSON.stringify(testDataMessage));
        }
    } catch (error) {
        console.error('Error handling server response:', error);
    }
});
