const readline = require('readline');
const net = require('net');

const serverIP = '127.0.0.1';  // 또는 'localhost'
const serverPort = 3567;

const client = new net.Socket();

client.connect(serverPort, serverIP, () => {
    console.log('Connected to server');

    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    rl.question('Enter data to broadcast: ', (inputData) => {
        const data = {
            message: inputData.trim()
        };

        client.write(JSON.stringify(data));
        rl.close();
    });
});

client.on('data', (data) => {
    const serverMessage = data.toString();
    console.log('Received from server:', serverMessage);
});

client.on('close', () => {
    console.log('Connection closed');
});

client.on('error', (err) => {
    console.error('Error:', err.message);
});
