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

    // 클라이언트에게 환영 메시지 전송
    welcomeClient(client);

    client.on('data', (data) => {
        try {
            const clientMessage = JSON.parse(data.toString());
            console.log('Received from client:', clientMessage);

            // 메시지에 채널 정보가 있을 경우 채널을 관리
            if (clientMessage.channel) {
                // 중계 함수 호출
                relayDataToClients(client, data);
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

// 클라이언트가 채널에 참여하거나 나갈 때 로그 출력 및 클라이언트에게 로그 전달
function handleChannel(client, message) {
    const { channel, packet, target, targetId } = message; // packet, target, targetId 추가

    if (packet === 'join') {
        joinChannel(client, channel, target, targetId);
    } else if (packet === 'leave') {
        leaveChannel(client, channel, target, targetId);
    }
}

// 클라이언트에게 로그를 전달하는 함수 추가
function sendLogToClient(client, log) {
    const logData = {
        log
    };
    client.write(JSON.stringify(logData) + '\n');
}

// 클라이언트가 채널에 참여하거나 나갈 때 로그 출력 및 클라이언트에게 로그 전달
function joinChannel(client, channel, target, targetId) {
    if (!channels.has(channel)) {
        channels.set(channel, []);
    }

    const channelClients = channels.get(channel);
    if (!channelClients.includes(client)) {
        channelClients.push(client);
    }

    const logMessage = `You joined channel ${channel}`;
    const channelInfoMessage = `Channel ${channel} has ${channelClients.length} client(s)`;

    // 로그 메시지를 포함한 JSON 형태로 클라이언트에게 전송
    sendLogToClient(client, logMessage);
    sendLogToClient(client, channelInfoMessage);

    console.log(logMessage);
    console.log(channelInfoMessage);

    // 타겟이 all이 아니면 해당 클라이언트에게만 메시지 전송
    if (target !== 'all' && targetId !== 0) {
        sendLogToClient(findClientById(targetId), logMessage);
        sendLogToClient(findClientById(targetId), channelInfoMessage);
    }
}

function leaveChannel(client, channel, target, targetId) {
    if (channels.has(channel)) {
        const channelClients = channels.get(channel);
        const index = channelClients.indexOf(client);

        if (index !== -1) {
            channelClients.splice(index, 1);
            console.log(`Client left channel ${channel}`);
            console.log(`Channel ${channel} has ${channelClients.length} client(s)`);

            // 클라이언트에게 로그 전달
            sendLogToClient(client, `You left channel ${channel}`);
            sendLogToClient(client, `Channel ${channel} has ${channelClients.length} client(s)`);

            // 채널에 더 이상 클라이언트가 없으면 채널 삭제
            if (channelClients.length === 0) {
                channels.delete(channel);
                console.log(`Channel ${channel} deleted`);
                sendLogToClient(client, `Channel ${channel} deleted`);
            }

            // 타겟이 all이 아니면 해당 클라이언트에게만 메시지 전송
            if (target !== 'all' && targetId !== 0) {
                sendLogToClient(findClientById(targetId), `You left channel ${channel}`);
                sendLogToClient(findClientById(targetId), `Channel ${channel} has ${channelClients.length} client(s)`);
            }
        }
    }
}

// ID를 기반으로 클라이언트 찾기
function findClientById(clientId) {
    return clients.find(client => client.remotePort === clientId);
}

// 클라이언트가 서버에 접속하면 환영 메시지 전송
function welcomeClient(client) {
    sendLogToClient(client, 'Welcome to the server!');
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

// 채널에 속한 클라이언트들에게 데이터 중계
function relayDataToClients(senderClient, data) {
    const channel = senderClient.channel; // 보낸 클라이언트의 채널 가져오기

    channels.get(channel)?.forEach((client) => {
        if (client !== senderClient) {
            const relayMessage = {
                sender: senderClient.remotePort,
                data: JSON.parse(data.toString())
            };
            client.write(JSON.stringify(relayMessage) + '\n');
        }
    });

    console.log(`Data relayed to clients in channel ${channel}:`, data);
}

server.on('listening', () => {
    const address = server.address();
    console.log(`Server listening ${address.address}:${address.port}`);
    clients.length = 0; // 클라이언트 목록 초기화
});

server.listen(3567, '218.38.65.83');
