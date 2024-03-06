const WebSocket = require('ws');
const http = require('http');

const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('WebSocket Server\n');
});

const wss = new WebSocket.Server({ server });

wss.on('connection', (ws) => {
    console.log('Client connected');

    // 클라이언트로부터 메시지 수신
    ws.on('message', (data) => {
        console.log('Received from client:', data);
        relayDataToClients(ws, data);
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

server.listen(3567, '218.38.65.83', () => {
    console.log('Server listening on port 3567');
});
