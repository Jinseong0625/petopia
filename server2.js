const dgram = require('dgram');
const server = dgram.createSocket('udp4');

// 클라이언트 목록
const clients = [];

server.on('error', (err) => {
  console.log(`Server error:\n${err.stack}`);
  server.close();
});

server.on('message', (msg, rinfo) => {
  try {
    const data = JSON.parse(msg.toString());

    // 클라이언트 정보 업데이트 또는 추가
    const existingClient = clients.find((client) => client.UUID === data.UUID);
    if (existingClient) {
      existingClient.ipAddress = data.ipAddress;
      existingClient.statusPort = data.statusPort;
    } else {
      clients.push(data);
    }

    // 여기에서 클라이언트에게 필요한 작업 수행
    // 예: 클라이언트 목록을 다른 클라이언트에게 broadcast
    broadcastClientList();

  } catch (error) {
    console.error('Error parsing JSON:', error);
  }
});

function broadcastClientList() {
  const clientListMessage = JSON.stringify(clients);
  clients.forEach((client) => {
    sendToClient(client, clientListMessage);
  });
}

function sendToClient(client, message) {
  const clientSocket = dgram.createSocket('udp4');
  clientSocket.send(message, client.statusPort, client.ipAddress, (err) => {
    clientSocket.close();
    if (err) {
      console.error('Error sending message to client:', err);
    }
  });
}

server.on('listening', () => {
  const address = server.address();
  console.log(`Server listening ${address.address}:${address.port}`);
});

server.bind(9100);
