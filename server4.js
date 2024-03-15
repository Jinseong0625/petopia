const WebSocket = require('ws');
const dgram = require('dgram');

const wss = new WebSocket.Server({ port: 3567 });
console.log('WebSocket server listening on port 3567');

const udpServer = dgram.createSocket('udp4');
udpServer.on('error', (err) => {
    console.error('UDP server error:', err);
    udpServer.close();
});
udpServer.on('message', (msg, rinfo) => {
    console.log(`UDP message received from ${rinfo.address}:${rinfo.port}: ${msg}`);
    // 여기에서 WebSocket 클라이언트로 데이터를 전송할 수 있습니다.
});
udpServer.on('listening', () => {
    const address = udpServer.address();
    console.log(`UDP server listening on ${address.address}:${address.port}`);
});
udpServer.bind(9001); // UDP 서버 포트 설정

wss.on('connection', (ws) => {
    console.log('WebSocket client connected');

    ws.on('message', (message) => {
        console.log(`WebSocket message received: ${message}`);

        try {
            const data = JSON.parse(message);

            // WebSocket 클라이언트로부터 받은 데이터를 직렬화하여 UDP 서버로 전송
            const serializedData = JSON.stringify(data);
            udpServer.send(serializedData, 0, serializedData.length, 9001, 'localhost', (err) => {
                if (err) console.error('Error sending UDP message:', err);
                else console.log('Message sent via UDP:', serializedData);
            });
        } catch (error) {
            console.error('Error parsing WebSocket message:', error);
        }
    });

    ws.on('close', () => {
        console.log('WebSocket client disconnected');
    });
});
