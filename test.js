const net = require('net');
const readline = require('readline');

const serverIP = '218.38.65.83';  // 또는 'localhost'
const serverPort = 3567;

const client1 = new net.Socket();
const client2 = new net.Socket();

client1.connect(serverPort, serverIP, () => {
    console.log('Client 1 connected to server');
    joinChannel(client1, 'channel1');
    sendData(client1, 'channel1', 'Test message from Client 1');
});

client2.connect(serverPort, serverIP, () => {
    console.log('Client 2 connected to server');
    joinChannel(client2, 'channel1');
    sendData(client2, 'channel1', 'Test message from Client 2');
});

client1.on('data', (data) => {
    const serverMessage = data.toString();
    console.log('Received from server (Client 1):', serverMessage);
});

client2.on('data', (data) => {
    const serverMessage = data.toString();
    console.log('Received from server (Client 2):', serverMessage);
});

client1.on('close', () => {
    console.log('Connection closed (Client 1)');
});

client2.on('close', () => {
    console.log('Connection closed (Client 2)');
});

client1.on('error', (err) => {
    console.error('Error (Client 1):', err.message);
});

client2.on('error', (err) => {
    console.error('Error (Client 2):', err.message);
});

function joinChannel(client, channel) {
    const data = {
        channel,
        action: 'join'
    };

    client.write(JSON.stringify(data));
    console.log(`Client joined channel ${channel}`);
}

function sendData(client, channel, message) {
    const data = {
        channel,
        message
    };

    client.write(JSON.stringify(data));
    console.log(`Client sent data to channel ${channel}: ${message}`);
}
