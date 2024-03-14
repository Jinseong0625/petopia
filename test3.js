const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

rl.setPrompt('Enter a number to add a new client to the channel: ');

rl.on('line', (input) => {
    const number = parseInt(input.trim());
    if (!isNaN(number)) {
        const newClient = {
            midx: number,
            nickname: `Newto${number}`,
            inventory: {},
            positionToWorld: 2880.0,
            mbti: 'ESFJ',
            sexual: 0,
            dog: { instanceID: 0 },
            itemUserInfo: { instanceID: 0 }
        };
        const message = {
            channel: 3, // 채널 번호를 지정
            target: 0, // 타겟 번호
            targetId: 0, // 타겟 ID
            packet: 2, // 패킷 번호
            message: JSON.stringify(newClient) // 클라이언트 데이터를 JSON 문자열로 변환하여 전송
        };
        // 입력한 숫자를 기반으로 새로운 클라이언트를 채널에 추가
        handleJoinChannel(message.channel, null, message);
    } else {
        console.log('Invalid input. Please enter a valid number.');
    }
});

function handleJoinChannel(channel, ws, data) {
    try {
        const clientMessage = JSON.parse(data.message);
        const newClient = {
            midx: clientMessage.midx,
            nickname: clientMessage.nickname,
            inventory: clientMessage.inventory,
            positionToWorld: clientMessage.positionToWorld,
            mbti: clientMessage.mbti,
            sexual: clientMessage.sexual,
            dog: clientMessage.dog,
            itemUserInfo: clientMessage.itemUserInfo
        };

        // 새로운 클라이언트를 채널에 추가
        addClientToChannel(channel, newClient);

        // 채널에 있는 모든 클라이언트에게 새로운 클라이언트 정보를 전송
        relayDataToClients(channel, ws, data);

        console.log(`New client added to channel ${channel}:`, newClient);
    } catch (error) {
        console.error('Error handling join channel:', error);
    }
}

function addClientToChannel(channel, client) {
    if (channels[channel]) {
        channels[channel].add(client);
        logChannelInfo(channel);
    } else {
        console.error(`Channel ${channel} does not exist.`);
    }
}

function logChannelInfo(channel) {
    if (channels[channel]) {
        console.log(`Channel ${channel} has ${channels[channel].size} client(s).`);
    } else {
        console.log(`Channel ${channel} does not exist.`);
    }
}


rl.prompt();
