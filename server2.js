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

    client.on('data', (data) => {
        try {
            const clientMessage = data.toString(); // 데이터를 문자열로 변환
            console.log('Received from client:', clientMessage);
            relayDataToClients(client, data);
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

server.listen(3567, '218.38.65.83');
