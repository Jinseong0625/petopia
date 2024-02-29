const net = require('net');

const client = new net.Socket();

const serverAddress = '218.38.65.83'; // 서버의 주소
const serverPort = 3567; // 서버의 포트

client.connect(serverPort, serverAddress, () => {
  console.log('Connected to server!');
  
  // 연결 성공 후에 원하는 작업을 수행할 수 있습니다.
  // 예를 들어, 메시지를 서버로 보내거나 서버에서 받은 메시지를 처리할 수 있습니다.
});

client.on('data', (data) => {
  console.log('Received from server:', data.toString());
  // 서버에서 데이터를 수신했을 때의 작업을 수행할 수 있습니다.
});

client.on('close', () => {
  console.log('Connection closed.');
  // 연결이 닫혔을 때의 작업을 수행할 수 있습니다.
});
