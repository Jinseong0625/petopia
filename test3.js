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

rl.prompt();
