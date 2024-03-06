const net = require('net');
const server = net.createServer();
const clients = [];

server.on('error', (err) => {
    console.log(`Server error:\n${err.stack}`);
    server.close();
});

server.on('connection', (client) => {
    console.log('Client connected:', client.remoteAddress, client.remotePort);
    clients.push(client);

    // 클라이언트로부터 메시지 수신
    client.on('message', (data) => {
        console.log('Received from client:', data);
        relayDataToClients(client, data);
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

function relayDataToClients(senderClient, data) {
    clients.forEach((client) => {
        if (client !== senderClient) {
            client.write(data);
        }
    });

    console.log('Data relayed to all clients:', data);
}

function removeClient(client) {
    const index = clients.indexOf(client);
    if (index !== -1) {
        clients.splice(index, 1);
    }

    console.log('Client removed:', client.remoteAddress, client.remotePort);
}

server.on('listening', () => {
    const address = server.address();
    console.log(`Server listening ${address.address}:${address.port}`);
    clients.length = 0; // 클라이언트 목록 초기화
});

// 클라이언트에서 'message' 이벤트를 사용하도록 변경
server.on('message', (data) => {
    console.log('Received message from client:', data);
});

server.listen(3567, '218.38.65.83');
