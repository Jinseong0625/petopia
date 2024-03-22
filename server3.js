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
            const { channel, packet } = clientMessage;
    
            switch (packet) {
                case eSocketPacket.create_channel:
                    handleCreateChannel(ws);
                    break;
                case eSocketPacket.join_channel:
                    handleJoinChannel(clientMessage, ws, data);
                    break;
                case eSocketPacket.join_world:
                    handleJoinWorld(channel, ws, data);
                    break;
                case eSocketPacket.exit_world:
                    handleExitWorld(channel, ws, data);
                    break;
            }
            handleDefaultPacket(channel, ws, data);

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
    ws.send(JSON.stringify({
        channelCreated: newChannel,
        packet: eSocketPacket.create_channel,
        message: newChannel
    }));
    console.log(`Channel ${newChannel} created. Master client: ${ws._socket.remoteAddress}`);
}

function handleJoinChannel(clientMessage, ws, data) {
    const joinChannel = clientMessage.channel; // 변수 이름 변경
    if (channels[joinChannel]) {
        addClientToChannel(joinChannel, ws);
        if (channels[joinChannel].size > 1) {
            relayDataToAllClients(joinChannel, data);
        }
        console.log(`Client added to channel ${joinChannel}: ${ws._socket.remoteAddress}`);
    } else {
        console.error(`Channel ${joinChannel} does not exist.`);
    }
}

function handleJoinWorld(channel, ws, data) {
    if (channels[channel]) {
        console.log(`Client added to channel ${channel}: ${ws.send(data)}`);
        relayDataToAllClients(channel, data);
    } else {
        console.error(`Channel ${channel} does not exist.`);
    }
}

function handleExitWorld(channel, ws, data) {
    if (channels[channel]) {
        removeClient(ws);
        relayDataToAllClients(channel, ws, data);
        console.log(`Client exited from channel ${channel}: ${ws._socket.remoteAddress}`);
    } else {
        console.error(`Channel ${channel} does not exist.`);
    }
}

function handleDefaultPacket(channel, ws, data) {
    try {
        const { target } = JSON.parse(data);

        switch (target) {
            case eSendTarget.server:
                relayDataToAllClients(channel, ws, data);
                break;
            case eSendTarget.all:
                relayDataToAllClients(channel, ws, data);
                break;
            case eSendTarget.master:
                relayDataToMasterClient(channel, ws, data);
                break;
            case eSendTarget.anothers:
                relayDataToOtherClients(channel, ws, data);
                break;
            case eSendTarget.target:
                relayDataToTargetClient(channel, ws, data);
                break;
            default:
                console.error('Invalid target.');
        }
    } catch (error) {
        console.error('Error handling default packet:', error);
    }
}

function relayDataToClients(channel, data) {
    if (channels[channel]) {
        channels[channel].forEach((client) => {
            client.send(JSON.stringify(data));
        });
    }
    console.log(`Data relayed to all clients on channel ${channel}:`, JSON.stringify(data));
}

function relayDataToAllClients(channel, data) {
    if (channels[channel]) {
        console.log('Data relayed to all clients in channel', channel, ':', data);
        channels[channel].forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify(data));
            } else {
                console.error('Client connection is not open, message not sent.');
            }
        });
    } else {
        console.error(`Channel ${channel} does not exist.`);
    }
}

function relayDataToMasterClient(channel, senderClient, data) {
    console.log('Data relayed to master client in channel', channel, ':', data);
    const masterClient = Array.from(channels[channel])[0];
    if (masterClient && masterClient !== senderClient && masterClient.readyState === WebSocket.OPEN) {
        masterClient.send(JSON.stringify(data));
    } else {
        console.error('Master client not found or not connected in channel', channel);
    }
}

function relayDataToOtherClients(channel, senderClient, data) {
    console.log('Data relayed to other clients in channel', channel, ':', data);
    channels[channel].forEach(client => {
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
