const WebSocket = require('ws');

let channels = {}; // 여러 채널을 저장하는 객체
let channelCounter = 1; // 채널 번호를 증가시키기 위한 카운터

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
            const packet = clientMessage.packet;

            if (packet === 1) {
                // 클라이언트가 packet 1을 보내면 새로운 채널을 생성하고 마스터 클라이언트로 설정
                const newChannel = createChannel(ws);
                ws.send(JSON.stringify({
                    channelCreated: newChannel,
                    packet: packet,
                    message: newChannel
                }));
                console.log(`Channel ${newChannel} created. Master client: ${ws._socket.remoteAddress}`); // 수정된 부분
            } else {
                // 채널이 이미 존재하는 경우 클라이언트를 해당 채널에 추가
                if (channels[channel]) {
                    addClientToChannel(channel, ws);
                    if (channels[channel].size > 1) {
                        relayDataToClients(channel, ws, data);
                    }
                    console.log(`Client added to channel ${channel}: ${ws._socket.remoteAddress}`);
                } else {
                    console.error(`Channel ${channel} does not exist.`);
                }
            }

            // 이후 로직에서 채널을 활용하여 메시지를 전파하거나 특정 동작을 수행할 수 있음
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

function createChannel(masterClient) {
    const newChannel = channelCounter++;
    channels[newChannel] = new Set(); // 채널 생성 및 채널에 클라이언트 추가
    channels[newChannel].add(masterClient);
    return newChannel;
}

function addClientToChannel(channel, client) {
    if (channels[channel]) {
        channels[channel].add(client);
        console.log(`Client added to channel ${channel}: ${client._socket.remoteAddress}`);
    } else {
        console.error(`Channel ${channel} does not exist.`);
    }
}

function relayDataToClients(channel, senderClient, data) {
    if (channels[channel]) {
        channels[channel].forEach((client) => {
            if (client !== senderClient && client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify({
                    channelJoined: channel,
                    message: channel
                }));
            }
        });
    }

    console.log(`Data relayed to all clients on channel ${channel}:`, JSON.stringify(JSON.parse(data)));
}

function removeClient(client) {
    // 클라이언트가 연결 해제될 때 해당 클라이언트를 모든 채널에서 제거
    Object.keys(channels).forEach((channel) => {
        channels[channel].delete(client);
        // 채널이 비어있다면 삭제
        if (channels[channel].size === 0) {
            delete channels[channel];
            console.log(`Channel ${channel} removed.`);
        }
    });

    console.log('Client removed');
}

// 서버가 시작될 때마다 channels 객체 초기화
function resetChannels() {
    channels = {};
    channelCounter = 1; // 채널 번호 초기화
    console.log('Channels reset.');
}

// 서버 시작 시 초기화 수행
resetChannels();
