const readline = require('readline');
const WebSocket = require('ws');

// 웹 소켓 서버의 주소와 포트를 지정합니다.
const serverAddress = 'ws://218.38.65.83:3567';

// 웹 소켓 클라이언트 생성
const ws = new WebSocket(serverAddress);

// 입력 인터페이스 생성
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// 입력창에 메시지를 출력합니다.
rl.setPrompt('Enter a number to add a new client to the channel: ');
rl.prompt();

// 사용자가 입력한 숫자를 받아서 처리하는 이벤트 핸들러
rl.on('line', (input) => {
    // 입력받은 숫자를 정수로 변환합니다.
    const number = parseInt(input.trim());

    // 숫자가 유효한지 확인합니다.
    if (!isNaN(number)) {
        // 새로운 클라이언트 데이터 생성
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

        // 데이터를 서버로 전송합니다.
        const testData = {
            channel: 3,
            target: 0,
            targetId: 0,
            packet: 2,
            message: JSON.stringify(newClient)
        };

        // 데이터 전송
        ws.send(JSON.stringify(testData));
    } else {
        console.log('Invalid input. Please enter a valid number.');
    }

    // 입력 인터페이스를 종료합니다.
    rl.close();
});

// 서버로부터의 메시지 수신 이벤트 핸들러
ws.on('message', (data) => {
    console.log('Received message from server:', data);
});

// 연결 종료 이벤트 핸들러
ws.on('close', () => {
    console.log('Connection closed');
});

// 에러 발생 이벤트 핸들러
ws.on('error', (error) => {
    console.error('Error:', error.message);
});
