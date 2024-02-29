const net = require('net');
const server = net.createServer();
const clients = [];

server.on('error', (err) => {
    console.log(`Server error:\n${err.stack}`);
    server.close();
});

server.on('connection', (client) => {
    console.log('Client connected:', client.remoteAddress, client.remotePort);
    clients.push(client);

    client.on('data', (data) => {
        try {
            const clientMessage = data.toString();
            console.log('Received from client:', clientMessage);

            const command = parseCommand(clientMessage);
            handleCommand(client, command);
            broadcastCommand(client, command);
        } catch (error) {
            console.error('Error handling command:', error);
        }
    });

    client.on('end', () => {
        console.log('Client disconnected');
        const index = clients.indexOf(client);
        if (index !== -1) {
            clients.splice(index, 1);
        }
    });

    client.on('error', (err) => {
        console.error('Client error:', err.message);
    });
});

function parseCommand(message) {
    try {
        return JSON.parse(message);
    } catch (error) {
        console.error('Error parsing JSON:', error);
        return null;
    }
}

function handleCommand(client, command) {
    if (!command) {
        console.error('Invalid command format');
        return;
    }

    switch (command.type) {
        case 'move':
            handleMoveCommand(client, command);
            break;
        case 'sit':
            handleSitCommand(client);
            break;
        case 'lie':
            handleLieCommand(client);
            break;
        case 'shake':
            handleShakeCommand(client);
            break;
        default:
            console.error('Unknown command type:', command.type);
    }
}

function handleMoveCommand(client, command) {
    const targetPC = command.targetPC;
    console.log(`Move the dog to PC: ${targetPC}`);
    // 이동 처리 로직 추가
}

function handleSitCommand(client) {
    console.log('Sit command received');
    // 앉기 처리 로직 추가
}

function handleLieCommand(client) {
    console.log('Lie command received');
    // 눕기 처리 로직 추가
}

function handleShakeCommand(client) {
    console.log('Shake command received');
    // 손 흔들기 처리 로직 추가
}

function broadcastCommand(senderClient, command) {
    const message = JSON.stringify(command);

    clients.forEach((client) => {
        if (client !== senderClient) {
            client.write(message);
        }
    });

    console.log('Command broadcasted to all clients:', message);
}

server.on('listening', () => {
    const address = server.address();
    console.log(`Server listening ${address.address}:${address.port}`);
    clients.length = 0; // 클라이언트 목록 초기화
});

server.listen(3567, '218.38.65.83');
