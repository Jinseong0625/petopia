const WebSocket = require('ws');
const { eSocketPacket } = require('../petopia/common/socketpacket.js');
const { eSendTarget } = require('../petopia/common/socketTarget.js');

let channels = {}; // 여러 채널을 저장하는 객체
let channelCounter = 1; // 채널 번호를 증가시키기 위한 카운터

const wss = new WebSocket.Server({ port: 3567 });


console.log('Server listening on port 3567');

wss.on('connection', (ws) => {
    console.log('Client connected');

    ws.on('message', (data) => {
        try {
            const clientMessage = JSON.parse(data);
    
            // 여러 채널을 다루기 위해, 메시지의 채널 정보를 확인
            const channel = clientMessage.channel;
            const packet = clientMessage.packet;
            const target = clientMessage.target;
    
            switch (target) {
                case eSendTarget.server: // 타겟 0
                    handleTargetZero(ws,packet);
                    break;
    
                case eSendTarget.all: // 타겟 1
                    handleTargetOne(channel, ws, data, packet);
                    break;
                
                case eSendTarget.master: // 타겟 2
                    break;
                
                case eSendTarget.anothers: // 타겟 3
                    break;

                case eSendTarget.target: // 타겟 4
                    break;
                // 다른 패킷 추가 여기서 내가 볼땐  
    
                default:
                    handleDefaultPacket(channel, ws, data);
            }
        } catch (error) {
            console.error('Error handling data:', error);
        }
    });

    // 클라이언트로부터 메시지 수신
    /*ws.on('message', (data) => {
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


            relayDataToClients(channel, ws, data);
        } catch (error) {
            console.error('Error handling data:', error);
        }
    });*/


    // 클라이언트 연결 해제 시
    ws.on('close', () => {
        console.log('Client disconnected');
        removeClient(ws);
        logConnectedClients();
    });
});

function createChannel(masterClient) {
    const newChannel = channelCounter++;
    channels[newChannel] = new Set(); // 채널 생성 및 채널에 클라이언트 추가
    channels[newChannel].add(masterClient);
    console.log(`Channel ${newChannel} created. Master client: ${masterClient._socket.remoteAddress}`); // 수정된 부분
    logChannelInfo(newChannel);
    return newChannel;
}

function addClientToChannel(channel, client) {
    if (channels[channel]) {
        channels[channel].add(client);
        logChannelInfo(channel);
    } else {
        console.error(`Channel ${channel} does not exist.`);
    }
}

function handleTargetZero(ws, packet) {
    if (packet === eSocketPacket.create_channel) {
        // 클라이언트가 타겟 0 패킷을 보내면 새로운 채널을 생성하고 마스터 클라이언트로 설정
        const newChannel = createChannel(ws);
        ws.send(JSON.stringify({
            channelCreated: newChannel,
            packet: eSocketPacket.create_channel,
            message: newChannel
        }));
        console.log(`Channel ${newChannel} created. Master client: ${ws._socket.remoteAddress}`);
    } else {
        console.error('Invalid packet for target 0.');
    }
}

function handleTargetOne(channel, ws, data, packet) {
    if (packet === eSocketPacket.join_channel) {
        // 클라이언트가 타겟 1 패킷을 보내면 해당 채널에 클라이언트를 추가
        if (channels[channel]) {
            addClientToChannel(channel, ws);
            if (channels[channel].size > 1) {
                relayDataToClients(channel, ws, data);
            }
            console.log(`Client added to channel ${channel}: ${ws._socket.remoteAddress}`);
        } else {
            console.error(`Channel ${channel} does not exist.`);
        }

        relayDataToClients(channel, ws, data);
    } else {
        console.error('Invalid packet for target 1.');
    }
}

function handleDefaultPacket(channel, ws, data) {
    // 특별한 처리가 필요 없는 경우 아무 작업도 하지 않음 차후에 추가하면 될듯
}

function relayDataToClients(channel, senderClient, data) {
    if (channels[channel]) {
        channels[channel].forEach((client) => {
            if (client !== senderClient && client.readyState === WebSocket.OPEN) {
                //client.send(JSON.stringify(JSON.parse(data))); // 클라이언트에서 받은 데이터를 JSON으로 파싱하여 브로드캐스팅
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
        } else {
            logChannelInfo(channel); // 추가된 부분
        }
    });

    console.log('Client removed');
}

function logChannelInfo(channel) {
    console.log(`Channel ${channel} has ${channels[channel].size} client(s).`);
}
function logConnectedClients() {
    console.log('Connected clients:', wss.clients.size);
}

// 서버가 시작될 때마다 channels 객체 초기화
function resetChannels() {
    channels = {};
    channelCounter = 1; // 채널 번호 초기화
    console.log('Channels reset.');
}

// 서버 시작 시 초기화 수행
resetChannels();
