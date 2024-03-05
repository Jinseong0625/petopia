// 클라이언트 코드 일부

const net = require('net');
const readline = require('readline');

const serverIP = 'YOUR_SERVER_IP'; // 서버의 IP 주소로 변경하세요
const serverPort = 3567;

const client = new net.Socket();
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

client.connect(serverPort, serverIP, () => {
    console.log('Client connected to server');

    rl.question('Enter channel number: ', (channel) => {
        rl.question('Enter "join" or "leave": ', (packet) => {
            sendChannelRequest(client, parseInt(channel), packet.toLowerCase());
            rl.close();
        });
    });
});

client.on('data', (data) => {
    const serverMessage = data.toString();
    console.log('Received from server:', serverMessage);

    try {
        const serverData = JSON.parse(serverMessage);
        if (serverData.log) {
            console.log(serverData.log);
        }

        // 여기에 서버로부터 받은 데이터를 처리하는 로직 추가

    } catch (error) {
        console.error('Error parsing server data:', error);
    }
});

client.on('close', () => {
    console.log('Connection closed');
    rl.close();
});

client.on('error', (err) => {
    console.error('Error:', err.message);
    rl.close();
});

function sendChannelRequest(client, channel, packet) {
    // 패킷으로 변경하고 타겟과 타겟ID 추가
    const data = {
        channel,
        packet,
        target: 'all', // 타겟 정보 추가 (임시값으로 'all' 설정)
        targetId: 0 // 타겟 ID 정보 추가 (임시값으로 0 설정)
    };

    client.write(JSON.stringify(data));
}
