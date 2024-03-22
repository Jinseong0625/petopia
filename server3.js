const WebSocket = require('ws');
const { eSocketPacket } = require('../petopia/common/socketpacket.js');
const { eSendTarget } = require('../petopia/common/socketTarget.js');

let channels = {};
let channelCounter = 1;

const wss = new WebSocket.Server({ port: 3567 });

console.log('Server listening on port 3567');

wss.on('connection', (ws) => {
    console.log('Client connected');

    ws.on('message', (data) => {
        try {
            const clientMessage = JSON.parse(data);
            const packet = clientMessage.packet
            //const { channel, packet } = clientMessage;
    
            switch (packet) {
                case eSocketPacket.create_channel:
                    handleCreateChannel(ws);
                    break;
                case eSocketPacket.join_channel:
                    handleJoinChannel(clientMessage, ws, data);
                    break;
                case eSocketPacket.join_world:
                    handleJoinWorld(clientMessage, ws, data);
                    break;
                case eSocketPacket.exit_world:
                    handleExitWorld(clientMessage, ws, data);
                    break;
                default:
                    handleDefaultPacket(clientMessage, ws, data);
                    break;
            }

        } catch (error) {
            console.error('Error handling data:', error);
        }
    });

    ws.on('close', () => {
        console.log('Client disconnected');
        removeClient(ws);
        logConnectedClients();
    });
});

function createChannel(masterClient) {
    const newChannel = channelCounter++;
    channels[newChannel] = new Set();
    channels[newChannel].add(masterClient);
    console.log(`Channel ${newChannel} created. Master client: ${masterClient._socket.remoteAddress}`);
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

function handleCreateChannel(ws) {
    const newChannel = createChannel(ws);

    // 채널에 마스터 클라이언트 추가
    addClientToChannel(newChannel, ws);

    ws.send(JSON.stringify({
        channelCreated: newChannel,
        packet: eSocketPacket.create_channel,
        message: newChannel
    }));
    console.log(`Channel ${newChannel} created. Master client: ${ws._socket.remoteAddress}`);
}

function handleJoinChannel(clientMessage, ws, data) {
    const joinChannel = clientMessage.channel; // 변수 이름 변경

    if (!channels[joinChannel]) {
        console.error(`Channel ${joinChannel} does not exist.`);
        return;
    }

    //if (channels[joinChannel]) {
        addClientToChannel(joinChannel, ws);
        // 수정: 채널이 존재할 때만 브로드캐스트를 수행합니다.
        if (channels[joinChannel].size >= 1) {
            
            relayDataToAllClients(clientMessage, data);
        }
        console.log(`Client added to channel ${joinChannel}: ${ws._socket.remoteAddress} ${channels[joinChannel].size}`);
    //} else {
    //    console.error(`Channel ${joinChannel} does not exist.`);
    //}
}

function handleJoinWorld(clientMessage, ws, data) {
    const joinChannel = clientMessage.channel;
    if (channels[joinChannel]) {
        console.log(`Client added to channel ${joinChannel}: ${ws.send(data)}`);
        relayDataToAllClients(joinChannel, data);
    } else {
        console.error(`Channel ${joinChannel} does not exist.`);
    }
}

function handleExitWorld(clientMessage, ws, data) {
    const joinChannel = clientMessage.channel;
    if (channels[joinChannel]) {
        removeClient(ws);
        relayDataToAllClients(joinChannel, ws, data);
        console.log(`Client exited from channel ${joinChannel}: ${ws._socket.remoteAddress}`);
    } else {
        console.error(`Channel ${joinChannel} does not exist.`);
    }
}

function handleDefaultPacket(clientMessage, ws, data) {
    try {
        const { target } = JSON.parse(data);

        switch (target) {
            case eSendTarget.server:
                relayDataToAllClients(clientMessage, ws, data);
                break;
            case eSendTarget.all:
                relayDataToAllClients(clientMessage, ws, data);
                break;
            case eSendTarget.master:
                relayDataToMasterClient(clientMessage, ws, data);
                break;
            case eSendTarget.anothers:
                relayDataToOtherClients(clientMessage, ws, data);
                break;
            case eSendTarget.target:
                relayDataToTargetClient(clientMessage, ws, data);
                break;
            default:
                console.error('Invalid target.');
        }
    } catch (error) {
        console.error('Error handling default packet:', error);
    }
}

/*function relayDataToClients(channel, data) {
    if (channels[channel]) {
        channels[channel].forEach((client) => {
            client.send(JSON.stringify(data));
        });
    }
    console.log(`Data relayed to all clients on channel ${channel}:`, JSON.stringify(data));
}*/

function relayDataToAllClients(clientMessage, data) {
    const joinChannel = clientMessage.channel;
    if (channels[joinChannel]) {
        if (typeof data !== 'string' && !Buffer.isBuffer(data) && !ArrayBuffer.isView(data) && !(data instanceof ArrayBuffer)) {
            console.error('Invalid data format:', data);
            return;
        }
        console.log('Data relayed to all clients in channel', joinChannel, ':', data);
        const jsonData = typeof data === 'string' ? data : JSON.stringify(data); // JSON 문자열로 변환
        channels[joinChannel].forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(jsonData);
            } else {
                console.error('Client connection is not open, message not sent.');
            }
        });
    } else {
        console.error(`Channel ${joinChannel} does not exist.`);
    }
}

function relayDataToMasterClient(clientMessage, senderClient, data) {
    const joinChannel = clientMessage.channel;
    console.log('Data relayed to master client in channel', joinChannel, ':', data);
    const masterClient = Array.from(channels[channel])[0];
    if (masterClient && masterClient !== senderClient && masterClient.readyState === WebSocket.OPEN) {
        masterClient.send(JSON.stringify(data));
    } else {
        console.error('Master client not found or not connected in channel', joinChannel);
    }
}

function relayDataToOtherClients(clientMessage, senderClient, data) {
    const joinChannel = clientMessage.channel;
    console.log('Data relayed to other clients in channel', joinChannel, ':', data);
    channels[joinChannel].forEach(client => {
        if (client !== senderClient && client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(data));
        }
    });
}

function relayDataToTargetClient(channel, senderClient, data) {
    console.log('Data relayed to target client in channel', channel, ':', data);
    try {
        const { targetClientId } = JSON.parse(data);
        const targetClient = Array.from(channels[channel]).find(client => client.id === targetClientId);
        if (targetClient && targetClient !== senderClient && targetClient.readyState === WebSocket.OPEN) {
            targetClient.send(JSON.stringify(data));
        } else {
            console.error('Target client not found or not connected in channel', channel);
        }
    } catch (error) {
        console.error('Error relaying data to target client in channel', channel, ':', error);
    }
}

function removeClient(client) {
    Object.keys(channels).forEach((channel) => {
        channels[channel].delete(client);
        if (channels[channel].size === 0) {
            delete channels[channel];
            console.log(`Channel ${channel} removed.`);
        } else {
            logChannelInfo(channel);
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

function resetChannels() {
    channels = {};
    channelCounter = 1;
    console.log('Channels reset.');
}

resetChannels();
