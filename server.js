const dgram = require('dgram');
const server = dgram.createSocket('udp4');

const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const cors = require('cors');

const app = express();
const corsOptions = {
    origin: '*', // 모든 origin에 대해 CORS를 허용합니다.
    optionsSuccessStatus: 200,
};
app.use(cors(corsOptions)); // 모든 origin에 대해 CORS를 허용합니다.
const httpServer = http.createServer(app);
const io = socketIO(httpServer);

let mobileClient;
let pcClient;

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

app.get('/mobile', (req, res) => {
    res.sendFile(__dirname + '/mobile.html');
});

app.get('/pc', (req, res) => {
    res.sendFile(__dirname + '/pc.html');
});

io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    socket.on('mobile', () => {
        mobileClient = socket;
        console.log('Mobile client connected:', socket.id);
    });

    socket.on('pc', () => {
        pcClient = socket;
        console.log('PC client connected:', socket.id);
    });

    socket.on('dataFromMobile', (data) => {
        if (pcClient && pcClient.connected) {
            const message = JSON.stringify(data);
            server.send(message, pcClient.port, pcClient.address, (err) => {
                if (err) {
                    console.error('Error sending data to PC:', err);
                } else {
                    console.log('Data received from mobile and sent to PC:', data);
                    io.emit('dataToClient', { from: 'Server', type: 'message', data: data.message });
                }
            });
        } else {
            console.error('pcClient is not available');
        }
    });

    socket.on('dogDataFromMobile', (dogData) => {
        if (pcClient && pcClient.connected) {
            const message = JSON.stringify(dogData);
            server.send(message, pcClient.port, pcClient.address, (err) => {
                if (err) {
                    console.error('Error sending dog data to PC:', err);
                } else {
                    console.log('Dog data received from mobile and sent to PC:', dogData);
                    io.emit('dataToClient', { from: 'Server', type: 'dogData', data: dogData });
                }
            });
        } else {
            console.error('pcClient is not available');
        }
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
        if (socket === mobileClient) {
            mobileClient = null;
            console.log('Mobile client disconnected:', socket.id);
        } else if (socket === pcClient) {
            pcClient = null;
            console.log('PC client disconnected:', socket.id);
        }
    });
});

const PORT = process.env.PORT || 3567;
httpServer.listen(PORT, () => {
    console.log(`Relay Server running on http://localhost:${PORT}`);
});
