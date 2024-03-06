const net = require('net');
const readline = require('readline');

const serverIP = '218.38.65.83'; // 서버의 IP 주소로 변경하세요
const serverPort = 3567;

const client = new net.Socket();
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

client.connect(serverPort, serverIP, () => {
    console.log('Client connected to server');
    startSendingRandomData();
});

function startSendingRandomData() {
    rl.question('Enter channel number: ', (channel) => {
        setInterval(() => {
            const packetData = generateRandomPacketData();
            sendChannelRequest(client, parseInt(channel), packetData.packet, packetData.targetId, packetData.message);
        }, 1000);
    });
}

client.on('data', (data) => {
    const serverMessage = data.toString();
    console.log('Received from server:', serverMessage);
});

client.on('close', () => {
    console.log('Connection closed');
    rl.close();
});

client.on('error', (err) => {
    console.error('Error:', err.message);
    rl.close();
});

function sendChannelRequest(client, channel, packet, targetId, message) {
    const data2 = {
        channel,
        packet,
        target: 'all',
        targetId: parseInt(targetId) || 0,
        message
    };

    client.write(JSON.stringify(data2));
}

function generateRandomPacketData() {
    const packets = ['call', 'throwball', 'moveleft', 'moveright'];
    const randomPacket = packets[Math.floor(Math.random() * packets.length)];
    const randomTargetId = Math.floor(Math.random() * 100);
    const randomMessage = Math.random().toString(36).substring(7);

    return {
        packet: randomPacket,
        targetId: randomTargetId,
        message: randomMessage
    };
}
