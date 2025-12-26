const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 8080 });

const clients = new Map();

wss.on('connection', (ws) => {
    const id = Math.random().toString(36).substring(2, 9);
    clients.set(id, ws);
    ws.send(JSON.stringify({type: 'id', id}));

    // Envia lista de peers existentes
    ws.send(JSON.stringify({type: 'list', peers: Array.from(clients.keys()).filter(k => k !== id)}));

    ws.on('message', (data) => {
        const msg = JSON.parse(data);
        if (msg.to && clients.has(msg.to)) {
            clients.get(msg.to).send(JSON.stringify({...msg, from: id}));
        }
    });

    ws.on('close', () => {
        clients.delete(id);
    });
});

console.log('Signaling server rodando na porta 8080');