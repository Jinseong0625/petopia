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
    
            switch (packet) {
                case eSocketPacket.create_channel: // packet = 1 이건 채널을 생성하려고 하는것이고 
                    handlePacketZero(ws,packet);
                    break;
    
                case eSocketPacket.join_channel: // packet = 2 이건 생성되어 있는 채널에 클라를 추가하는 것이고
                    handlePacketOne(channel, ws, data, packet);
                    break;
                
                case eSocketPacket.join_world: //packet = 3 이건 world로 클라를 보내는 역할을 하는것이고
                    handlePackettwo(channel, ws, data, packet);
                    break;
                
                case eSocketPacket.exit_world: // packet = 4 이건 월드를 나가는 역할이다.
                    handlePacketthree
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

function handlePacketZero(ws, packet) {
    if (packet === eSocketPacket.create_channel) {
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

function handlePacketOne(channel, ws, data, packet) {
    if (packet === eSocketPacket.join_channel) {
        // 클라이언트가 패킷 1 패킷을 보내면 해당 채널에 클라이언트를 추가
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

function handlePackettwo(channel, ws, data, packet) {
    if (packet === eSocketPacket.join_world) {
        // 클라이언트가 패킷 2 패킷을 보내면 해당 채널에 클라이언트를 추가
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

function handlePacketthree(channel, ws, data, packet) {
    if (packet === eSocketPacket.exit_world) {
        // 클라이언트가 패킷 3 패킷을 보내면 해당 채널에서 클라이언트를 제거
        removeClient(ws);
        // 채널에 변경 사항이 있을 경우 모든 클라이언트에게 새로운 채널 정보를 전달
        relayDataToClients(channel, ws, data); // 모든 클라이언트에게 메시지 전송
        console.log(`Client exited from channel ${channel}: ${ws._socket.remoteAddress}`);
    } else {
        console.error('Invalid packet for target 3.');
    }
}

function handleDefaultPacket(channel, ws, data) {
    try {
        const clientMessage = JSON.parse(data);
        const target = clientMessage.target;
        const packet = clientMessage.packet;

        switch (target) {
            case eSendTarget.server: // 서버에 데이터를 전송할 경우
                relayDataToServer(ws, data);
                break;
            case eSendTarget.all: // 모든 클라이언트에 데이터를 전송할 경우
                relayDataToAllClients(channel, ws, data);
                break;
            case eSendTarget.master: // 마스터 클라이언트에 데이터를 전송할 경우
                relayDataToMasterClient(channel, ws, data);
                break;
            case eSendTarget.anothers: // 다른 클라이언트에 데이터를 전송할 경우
                relayDataToOtherClients(channel, ws, data);
                break;
            case eSendTarget.target: // 특정 클라이언트에 데이터를 전송할 경우
                relayDataToTargetClient(channel, ws, data);
                break;
            default:
                console.error('Invalid target.');
        }
    } catch (error) {
        console.error('Error handling default packet:', error);
    }
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

function relayDataToServer(ws, data) {
    console.log('Data relayed to server:', data);
    ws.send(data);
}

function relayDataToAllClients(channel, senderClient, data) {
    console.log('Data relayed to all clients in channel', channel, ':', data);
    channels[channel].forEach(client => {
        if (client !== senderClient && client.readyState === WebSocket.OPEN) {
            client.send(data);
        }
    });
}

function relayDataToMasterClient(channel, senderClient, data) {
    console.log('Data relayed to master client in channel', channel, ':', data);
    const masterClient = Array.from(channels[channel])[0];
    if (masterClient && masterClient !== senderClient && masterClient.readyState === WebSocket.OPEN) {
        masterClient.send(data);
    } else {
        console.error('Master client not found or not connected in channel', channel);
    }
}

function relayDataToOtherClients(channel, senderClient, data) {
    console.log('Data relayed to other clients in channel', channel, ':', data);
    channels[channel].forEach(client => {
        if (client !== senderClient && client.readyState === WebSocket.OPEN) {
            client.send(data);
        }
    });
}

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
