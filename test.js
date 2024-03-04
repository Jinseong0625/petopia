const net = require('net');
const readline = require('readline');

const serverIP = '218.38.65.83';
const serverPort = 3567;

const client = new net.Socket();
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

client.connect(serverPort, serverIP, () => {
    console.log('Client connected to server');

    rl.question('Enter channel number: ', (channel) => {
        rl.question('Enter "join" or "leave": ', (action) => {
            sendChannelRequest(client, parseInt(channel), action.toLowerCase());
            rl.close();
        });
    });
});

let receivedData = ''; // 받은 데이터를 임시로 저장할 변수

client.on('data', (data) => {
    const serverMessage = data.toString();
    console.log('Received from server:', serverMessage);

    try {
        // 여러 개의 JSON 메시지가 들어올 수 있으므로 줄바꿈('\n')을 기준으로 분리
        const messages = serverMessage.split('\n').filter(msg => msg.trim() !== '');

        for (const msg of messages) {
            const serverData = JSON.parse(msg);
            if (serverData.log) {
                console.log(serverData.log);
            }
        }
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

function sendChannelRequest(client, channel, action) {
    const data = {
        channel,
        action
    };

    client.write(JSON.stringify(data));
}

function processReceivedData(chunk) {
    try {
        const serverData = JSON.parse(chunk);
        if (serverData.log) {
            console.log(serverData.log);
        }
    } catch (error) {
        console.error('Error parsing server data:', error);
    }
}
