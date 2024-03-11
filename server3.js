const WebSocket = require('ws');

let channels = {}; // 여러 채널을 저장하는 객체
let channelCounter = 1; // 채널 번호를 증가시키기 위한 카운터

const wss = new WebSocket.Server({ port: 3567 });

// 디버그 모드 활성화 여부
const debugMode = false;

console.log('Server listening on port 3567');

wss.on('connection', (ws) => {
    console.log('Client connected');

    // 클라이언트로부터 메시지 수신
    ws.on('message', (data) => {
        try {
            const clientMessage = JSON.parse(data);

            // 여러 채널을 다루기 위해, 메시지의 채널 정보를 확인
            const channel = clientMessage.channel;

            if (channel === -1) {
                // 클라이언트가 -1을 보내면 새로운 채널을 생성하고 마스터 클라이언트로 설정
                const newChannel = createChannel(ws);
                ws.send(JSON.stringify({
                    channelCreated: newChannel,
                    message: `Channel: ${newChannel}`
                }));
                /*if (debugMode) {
                    console.log(`Channel ${newChannel} created. Master client: ${ws.upgradeReq.url}`);
                    console.log(`[DEBUG] Channels: ${JSON.stringify(channels)}`);
                }*/
                console.log(`Channel ${newChannel} created. Master client: ${ws.upgradeReq.url}`);
                console.log(`[DEBUG] Channels: ${JSON.stringify(channels)}`);
            } else {
                // 채널이 이미 존재하는 경우 클라이언트를 해당 채널에 추가
                addClientToChannel(channel, ws);
                ws.send(JSON.stringify({
                    channelJoined: channel,
                    message: `Joined Channel: ${channel}`
                }));
                /*if (debugMode) {
                    console.log(`[DEBUG] Client added to channel ${channel}: ${ws.upgradeReq.url}`);
                    console.log(`[DEBUG] Channels: ${JSON.stringify(channels)}`);
                }*/
                console.log(`[DEBUG] Client added to channel ${channel}: ${ws.upgradeReq.url}`);
                console.log(`[DEBUG] Channels: ${JSON.stringify(channels)}`);
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
    channels[newChannel] = { clients: new Set() }; // 채널 생성 및 클라이언트 목록 추가
    channels[newChannel].clients.add(masterClient);
    return newChannel;
}

function addClientToChannel(channel, client) {
    if (channels[channel]) {
        channels[channel].clients.add(client);
    } else {
        console.error(`Channel ${channel} does not exist.`);
    }
}

function relayDataToClients(channel, senderClient, data) {
    if (channels[channel]) {
        channels[channel].forEach((client) => {
            if (client !== senderClient && client.readyState === WebSocket.OPEN) {
                client.send(data);
            }
        });
    }

    //if (debugMode) console.log(`[DEBUG] Data relayed to all clients on channel ${channel}:`, JSON.stringify(JSON.parse(data)));
    console.log(`[DEBUG] Data relayed to all clients on channel ${channel}:`, JSON.stringify(JSON.parse(data)));
}

function removeClient(client) {
    // 클라이언트가 연결 해제될 때 해당 클라이언트를 모든 채널에서 제거
    Object.keys(channels).forEach((channel) => {
        channels[channel].clients.delete(client);
        // 채널이 비어있다면 삭제
        if (channels[channel].clients.size === 0) {
            delete channels[channel];
            //if (debugMode) console.log(`[DEBUG] Channel ${channel} removed.`);
            console.log(`[DEBUG] Channel ${channel} removed.`);
        }
    });

    //if (debugMode) console.log('[DEBUG] Client removed:', client);
    console.log('Client removed:', client);
}

// 서버가 시작될 때마다 channels 객체 초기화
function resetChannels() {
    channels = {};
    channelCounter = 1; // 채널 번호 초기화
    console.log('Channels reset.');
}

// 서버 시작 시 초기화 수행
resetChannels();
