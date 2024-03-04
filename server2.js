const net = require('net');
const server = net.createServer();
const clients = [];
const channels = new Map(); // 맵을 사용하여 채널 관리

server.on('error', (err) => {
    console.log(`Server error:\n${err.stack}`);
    server.close();
});

server.on('connection', (client) => {
    console.log('Client connected:', client.remoteAddress, client.remotePort);
    clients.push(client);

    client.on('data', (data) => {
        try {
            const clientMessage = JSON.parse(data.toString());
            console.log('Received from client:', clientMessage);

            // 메시지에 채널 정보가 있을 경우 채널을 관리
            if (clientMessage.channel) {
                handleChannel(client, clientMessage);
            } else {
                // 채널 정보가 없을 경우 단순 중계
                relayData(client, data);
            }
        } catch (error) {
            console.error('Error handling data:', error);
        }
    });

    client.on('end', () => {
        console.log('Client disconnected');
        removeClient(client);
    });

    client.on('error', (err) => {
        console.error('Client error:', err.message);
        removeClient(client);
    });
});

function relayData(senderClient, data) {
    clients.forEach((client) => {
        if (client !== senderClient) {
            client.write(data);
        }
    });

    console.log('Data relayed to all clients:', data);
}

function handleChannel(client, message) {
    const { channel, action } = message;

    if (action === 'join') {
        joinChannel(client, channel);
    } else if (action === 'leave') {
        leaveChannel(client, channel);
    }
}

function joinChannel(client, channel) {
    if (!channels.has(channel)) {
        channels.set(channel, []);
    }

    const channelClients = channels.get(channel);
    if (!channelClients.includes(client)) {
        channelClients.push(client);
        console.log(`Client joined channel ${channel}`);
        console.log(`Channel ${channel} has ${channelClients.length} client(s)`);
    }
}

function leaveChannel(client, channel) {
    if (channels.has(channel)) {
        const channelClients = channels.get(channel);
        const index = channelClients.indexOf(client);

        if (index !== -1) {
            channelClients.splice(index, 1);
            console.log(`Client left channel ${channel}`);
            console.log(`Channel ${channel} has ${channelClients.length} client(s)`);

            // 채널에 더 이상 클라이언트가 없으면 채널 삭제
            if (channelClients.length === 0) {
                channels.delete(channel);
                console.log(`Channel ${channel} deleted`);
            }
        }
    }
}

function removeClient(client) {
    const index = clients.indexOf(client);
    if (index !== -1) {
        clients.splice(index, 1);
    }

    // 클라이언트가 속한 모든 채널에서 제거
    channels.forEach((channelClients, channel) => {
        const clientIndex = channelClients.indexOf(client);
        if (clientIndex !== -1) {
            channelClients.splice(clientIndex, 1);

            // 채널에 더 이상 클라이언트가 없으면 채널 삭제
            if (channelClients.length === 0) {
                channels.delete(channel);
                console.log(`Channel ${channel} deleted`);
            }
        }
    });

    console.log('Client removed:', client.remoteAddress, client.remotePort);
}

server.on('listening', () => {
    const address = server.address();
    console.log(`Server listening ${address.address}:${address.port}`);
    clients.length = 0; // 클라이언트 목록 초기화
});

server.listen(3567, '218.38.65.83');
