const WebSocket = require('ws');
const { eSocketPacket } = require('../petopia/common/socketpacket.js');
const { eSendTarget } = require('../petopia/common/socketTarget.js');

let channels = {}; // 채널을 저장하는 객체
let channelCounter = 1; // 채널 번호를 증가시키기 위한 카운터

const wss = new WebSocket.Server({ port: 3567 }); // WebSocket 서버 생성

console.log('Server listening on port 3567');

// 클라이언트 연결 시
wss.on('connection', (ws) => {
    console.log('Client connected');

    // 클라이언트로부터 메시지 수신 시
    ws.on('message', (data) => {
        try {
            const clientMessage = JSON.parse(data);
    
            // 메시지의 채널 정보, 패킷, 타겟을 확인
            const channel = clientMessage.channel;
            const packet = clientMessage.packet;
            const target = clientMessage.target;
    
            switch (packet) {
                case eSocketPacket.create_channel: // 채널 생성
                    handlePacketZero(ws, packet, data);
                    break;
                case eSocketPacket.join_channel: // 채널 참여
                     handlePacketOne(channel, ws, data, packet);
                    break;
                case eSocketPacket.join_world: // world로 클라 전송
                    handlePackettwo(channel, ws, data, packet);
                    break;
                case eSocketPacket.exit_world: // 월드 나가기
                    handlePacketthree(channel, ws, data, packet);
                    break;
            }
            

        } catch (error) {
            console.error('Error handling data:', error);
        }
        handleDefaultPacket(channel, ws, data);
    });

    // 클라이언트 연결 해제 시
    ws.on('close', () => {
        console.log('Client disconnected');
        removeClient(ws);
        logConnectedClients();
    });
});

/*function SendTarget(ws, data)
{
    switch(data.target)
    {
        case eSendTarget.all:
            {
                clients.forEach(obj => obj.send(data));
            }
            break;
        case eSendTarget.anothers:
            {
                clients.forEach(obj => 
                    {
                        if(obj != ws)
                            obj.send(data)
                    });
            }
            break;
        case eSendTarget.master:
            {
                clients.forEach(obj => 
                    {
                        if(obj.isMaster)
                            obj.send(data)
                    });
            }
            break;
        case eSendTarget.target:
            {
                clients.forEach(obj => 
                    {
                        if(data.targetClientId == obj.id)
                            obj.send(data)
                    });
            }
            break;
    }
}*/

// 채널 생성 함수
function createChannel(masterClient) {
    const newChannel = channelCounter++;
    channels[newChannel] = new Set(); // 채널 생성 및 클라이언트 추가
    channels[newChannel].add(masterClient);
    console.log(`Channel ${newChannel} created. Master client: ${masterClient._socket.remoteAddress}`);
    logChannelInfo(newChannel);
    return newChannel;
}

// 채널에 클라이언트 추가 함수
function addClientToChannel(channel, client) {
    if (channels[channel]) {
        channels[channel].add(client);
        logChannelInfo(channel);
    } else {
        console.error(`Channel ${channel} does not exist.`);
    }
}

// 패킷 핸들러 - 채널 생성
function handlePacketZero(ws, packet, data) {
    if (packet === eSocketPacket.create_channel) {
        data.message = createChannel(ws);
        //ws.send(data);
        console.log(`Channel ${newChannel} created. Master client: ${ws._socket.remoteAddress}`);
    } else {
        console.error('Invalid packet for target 0.');
    }
    return data;
}

// 패킷 핸들러 - 채널 참여
function handlePacketOne(channel, ws, data, packet)  {
    if (packet === eSocketPacket.join_channel) {
        // 채널에 클라이언트 추가
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
    return data;
}

// 패킷 핸들러 - world로 클라 전송
function handlePackettwo(channel, ws, data, packet) {
    if (packet === eSocketPacket.join_world) {
        // 채널에 클라이언트 추가
        if (channels[channel]) {
            addClientToChannel(channel, ws);
            if (channels[channel].size > 1) {
                relayDataToClients(channel, ws, data); // 모든 클라이언트에게 메시지 전송
            }
            console.log(`Client added to channel ${channel}: ${ws._socket.remoteAddress}`);
        } else {
            console.error(`Channel ${channel} does not exist.`);
        }
    } else {
        console.error('Invalid packet for target 2.');
    }
}

// 패킷 핸들러 - 월드 나가기
function handlePacketthree(channel, ws, data, packet) {
    if (packet === eSocketPacket.exit_world) {
        // 채널에서 클라이언트 제거
        removeClient(ws);
        // 채널에 변경 사항이 있을 경우 모든 클라이언트에게 새로운 채널 정보 전달
        relayDataToClients(channel, ws, data); // 모든 클라이언트에게 메시지 전송
        console.log(`Client exited from channel ${channel}: ${ws._socket.remoteAddress}`);
    } else {
        console.error('Invalid packet for target 3.');
    }
}

// 기본 패킷 핸들러
function handleDefaultPacket(channel, ws, data) {
    try {
        const clientMessage = JSON.parse(data);
        const target = clientMessage.target;
        const packet = clientMessage.packet;

        switch (target) {
            case eSendTarget.server: // 서버에 데이터 전송
                relayDataToServer(ws, data);
                break;
            case eSendTarget.all: // 모든 클라이언트에 데이터 전송
                relayDataToAllClients(channel, ws, data);
                break;
            case eSendTarget.master: // 마스터 클라이언트에 데이터 전송
                relayDataToMasterClient(channel, ws, data);
                break;
            case eSendTarget.anothers: // 다른 클라이언트에 데이터 전송
                relayDataToOtherClients(channel, ws, data);
                break;
            case eSendTarget.target: // 특정 클라이언트에 데이터 전송
                relayDataToTargetClient(channel, ws, data);
                break;
            default:
                console.error('Invalid target.');
        }
    } catch (error) {
        console.error('Error handling default packet:', error);
    }
}

// 클라이언트에게 데이터 전송 - 모든 클라이언트
function relayDataToClients(channel, senderClient, data) {
    if (channels[channel]) {
        channels[channel].forEach((client) => {
            if (client !== senderClient && client.readyState === WebSocket.OPEN) {
                client.send(data);
            }
        });
    }

    console.log(`Data relayed to all clients on channel ${channel}:`, JSON.stringify(JSON.parse(data)));
}

// 클라이언트에게 데이터 전송 - 서버
function relayDataToServer(ws, data) {
    console.log('Data relayed to server:', data);
    ws.send(data);
}

// 클라이언트에게 데이터 전송 - 모든 클라이언트
function relayDataToAllClients(channel, senderClient, data) {
    console.log('Data relayed to all clients in channel', channel, ':', data);
    channels[channel].forEach(client => {
        if (client !== senderClient && client.readyState === WebSocket.OPEN) {
            client.send(data);
        }
    });
}

// 클라이언트에게 데이터 전송 - 마스터 클라이언트
function relayDataToMasterClient(channel, senderClient, data) {
    console.log('Data relayed to master client in channel', channel, ':', data);
    const masterClient = Array.from(channels[channel])[0];
    if (masterClient && masterClient !== senderClient && masterClient.readyState === WebSocket.OPEN) {
        masterClient.send(data);
    } else {
        console.error('Master client not found or not connected in channel', channel);
    }
}

// 클라이언트에게 데이터 전송 - 다른 클라이언트
function relayDataToOtherClients(channel, senderClient, data) {
    console.log('Data relayed to other clients in channel', channel, ':', data);
    channels[channel].forEach(client => {
        if (client !== senderClient && client.readyState === WebSocket.OPEN) {
            client.send(data);
        }
    });
}

// 클라이언트에게 데이터 전송 - 특정 클라이언트
function relayDataToTargetClient(channel, senderClient, data) {
    console.log('Data relayed to target client in channel', channel, ':', data);
    try {
        const clientMessage = JSON.parse(data);
        const targetClientId = clientMessage.targetClientId;
        const targetClient = Array.from(channels[channel]).find(client => client.id === targetClientId);
        if (targetClient && targetClient !== senderClient && targetClient.readyState === WebSocket.OPEN) {
            targetClient.send(data);
        } else {
            console.error('Target client not found or not connected in channel', channel);
        }
    } catch (error) {
        console.error('Error relaying data to target client in channel', channel, ':', error);
    }
}

// 클라이언트 제거 함수
function removeClient(client) {
    // 클라이언트 연결 해제 시 해당 클라이언트를 모든 채널에서 제거
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

// 채널 정보 로깅 함수
function logChannelInfo(channel) {
    console.log(`Channel ${channel} has ${channels[channel].size} client(s).`);
}

// 연결된 클라이언트 로깅 함수
function logConnectedClients() {
    console.log('Connected clients:', wss.clients.size);
}

// 서버 시작 시 채널 초기화 함수
function resetChannels() {
    channels = {};
    channelCounter = 1; // 채널 번호 초기화
    console.log('Channels reset.');
}

// 서버 시작 시 초기화 수행
resetChannels();
