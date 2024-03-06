const WebSocket = require('ws');

const channels = {}; // 여러 채널을 저장하는 객체

const wss = new WebSocket.Server({ port: 3567 });

console.log('Server listening on port 3567');

wss.on('connection', (ws) => {
    console.log('Client connected');

    // 클라이언트로부터 메시지 수신
    ws.on('message', (data) => {
        try {
            const clientMessage = JSON.parse(data);

            // 여러 채널을 다루기 위해, 메시지의 채널 정보를 확인
            const channel = clientMessage.channel;

            if (!channels[channel]) {
                channels[channel] = new Set(); // 채널이 존재하지 않으면 생성
                // 클라이언트에게 채널 생성 메시지 전송
                ws.send(JSON.stringify({ channelCreated: channel }));
            }

            channels[channel].add(ws); // 해당 채널에 현재 클라이언트 추가

            console.log(`Received from client on channel ${channel}:`, clientMessage);
            relayDataToClients(channel, ws, data);
        } catch (error) {
            console.error('Error handling data:', error);
        }
    });

    // 클라이언트 연결 해제 시
    ws.on('close', () => {
        console.log('Client disconnected');
        removeClient(ws);
    });
});

function relayDataToClients(channel, senderClient, data) {
    if (channels[channel]) {
        channels[channel].forEach((client) => {
            if (client !== senderClient && client.readyState === WebSocket.OPEN) {
                client.send(data);
            }
        });
    }

    console.log(`Data relayed to all clients on channel ${channel}:`, data);
}

function removeClient(client) {
    // 클라이언트가 연결 해제될 때 해당 클라이언트를 모든 채널에서 제거
    Object.keys(channels).forEach((channel) => {
        channels[channel].delete(client);
    });

    console.log('Client removed');
}
