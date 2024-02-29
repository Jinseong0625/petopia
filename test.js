const readline = require('readline');
const net = require('net');

const serverIP = '218.38.65.83';
const serverPort = 3567;

const client = new net.Socket();

client.connect(serverPort, serverIP, () => {
    console.log('Connected to server');

    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    rl.question('Enter a command (e.g., sit, lie, shake): ', (commandType) => {
        const command = {
            type: commandType.trim().toLowerCase()
        };

        client.write(JSON.stringify(command));
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
