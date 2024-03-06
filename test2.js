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
    startClient();
});

function startClient() {
    rl.question('Enter channel number: ', (channel) => {
        rl.question('Enter any packet name: ', (packet) => {
            sendChannelRequest(client, parseInt(channel), packet);
            rl.close();
            handleUserInput(); // 사용자 입력 처리 함수 호출
        });
    });
}

function handleUserInput() {
    rl.question('Enter any packet name: ', (packet) => {
        if (packet.trim() !== '') {
            // packet이 비어 있지 않으면 패킷 전송
            sendCustomPacket(client, packet);
        }

        // 재귀 호출
        handleUserInput();
    });
}



client.on('data', (data) => {
    const serverMessage = data.toString();
    console.log('Received from server:', serverMessage);

    try {
        const serverData = JSON.parse(serverMessage);
        handleServerData(serverData);
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
    const data = {
        channel,
        packet,
        target: 'all',
        targetId: 0
    };

    client.write(JSON.stringify(data));
}

// 추가된 함수: 서버에 임의의 패킷 전송
function sendCustomPacket(client, packet) {
    const data = {
        packet,
        target: 'all',
        targetId: 0
    };

    client.write(JSON.stringify(data));
}

function handleServerData(serverData) {
    console.log('Received custom packet from the server:', serverData.packet);

    // 패킷에 따라 다른 처리 로직을 수행할 수 있습니다.
    switch (serverData.packet) {
        case 'call':
            handleCallPacket(serverData);
            break;
        case 'throwball':
            handleThrowBallPacket(serverData);
            break;
        case 'moveleft':
            handleMoveLeftPacket(serverData);
            break;
        case 'moveright':
            handleMoveRightPacket(serverData);
            break;
        default:
            console.log('Unhandled packet:', serverData.packet);
            break;
    }
}

// 다양한 패킷에 대한 처리 함수들을 정의할 수 있습니다.
function handleCallPacket(serverData) {
    console.log('Handling call packet...');
    // 패킷 처리 로직 추가
}

function handleThrowBallPacket(serverData) {
    console.log('Handling throwball packet...');
    // 패킷 처리 로직 추가
}

function handleMoveLeftPacket(serverData) {
    console.log('Handling moveleft packet...');
    // 패킷 처리 로직 추가
}

function handleMoveRightPacket(serverData) {
    console.log('Handling moveright packet...');
    // 패킷 처리 로직 추가
}

