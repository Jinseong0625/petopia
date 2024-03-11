const WebSocket = require('ws');

let channels = {};
let channelCounter = 1;

const wss = new WebSocket.Server({ port: 3567 });

wss.on('connection', (ws) => {
    console.log('Client connected');

    ws.on('message', (data) => {
        try {
            const clientMessage = JSON.parse(data);
            const channel = clientMessage.channel;

            if (channel === -1) {
                const newChannel = createChannel(ws);
                ws.send(JSON.stringify({
                    channelCreated: newChannel,
                    message: `Channel: ${newChannel}`
                }));
            } else {
                addClientToChannel(channel, ws);

                if (channels[channel].clients.size > 1) {
                    ws.send(JSON.stringify({
                        channelJoined: channel,
                        message: `Joined Channel: ${channel}`
                    }));
                }
            }

            relayDataToClients(channel, ws, data);
        } catch (error) {
            console.error('Error handling data:', error);
        }
    });

    ws.on('close', () => {
        console.log('Client disconnected');
        removeClient(ws);
    });
});

function createChannel(masterClient) {
    const newChannel = channelCounter++;
    channels[newChannel] = { clients: new Set() };
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
}

function removeClient(client) {
    Object.keys(channels).forEach((channel) => {
        channels[channel].clients.delete(client);
        if (channels[channel].clients.size === 0) {
            delete channels[channel];
        }
    });
}

function resetChannels() {
    channels = {};
    channelCounter = 1;
    console.log('Channels reset.');
}

resetChannels();
