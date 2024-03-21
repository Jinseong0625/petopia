const WebSocket = require('ws');

const ws = new WebSocket('ws://218.38.65.83:3567');

ws.on('open', () => {
    console.log('Connected to server.');

    // 채널 생성 요청 메시지 전송
    const createChannelMessage = {
        channel: 'example_channel',
        packet: 'create_channel',
        target: 'server'
    };
    ws.send(JSON.stringify(createChannelMessage));
});

ws.on('message', (data) => {
    console.log('Received message from server:', data);

    // 채널 참여 요청 메시지 전송
    const joinChannelMessage = {
        channel: 'example_channel',
        packet: 'join_channel',
        target: 'server'
    };
    ws.send(JSON.stringify(joinChannelMessage));
    
    // world로 클라이언트 전송 요청 메시지 전송
    const joinWorldMessage = {
        channel: 'example_channel',
        packet: 'join_world',
        target: 'server'
    };
    ws.send(JSON.stringify(joinWorldMessage));

    // 월드에서 나가기 요청 메시지 전송
    const exitWorldMessage = {
        channel: 'example_channel',
        packet: 'exit_world',
        target: 'server'
    };
    ws.send(JSON.stringify(exitWorldMessage));
});

ws.on('close', () => {
    console.log('Connection closed.');
});
