const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 3567 });

console.log('Server listening on port 3567');

wss.on('connection', (ws) => {
    console.log('Client connected');

    // 클라이언트로부터 메시지 수신
    ws.on('message', (data) => {
        try {
            const clientMessage = JSON.parse(data);
            console.log('Received from client:', clientMessage);
            relayDataToClients(ws, data);
        } catch (error) {
            console.error('Error handling data:', error);
        }
    });

    // 클라이언트 연결 해제 시
    ws.on('close', () => {
        console.log('Client disconnected');
        removeClient(ws);
    });
});

function relayDataToClients(senderClient, data) {
    wss.clients.forEach((client) => {
        if (client !== senderClient && client.readyState === WebSocket.OPEN) {
            client.send(data);
        }
    });

    console.log('Data relayed to all clients:', data);
}

function removeClient(client) {
    console.log('Client removed');
}
