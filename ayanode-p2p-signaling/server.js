const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: process.env.PORT || 8080 });

const clients = new Map();

wss.on('connection', (ws) => {
    const id = Math.random().toString(36).substring(2, 9);
    clients.set(id, ws);
    console.log(`Nodo conectado: ${id} | Total: ${clients.size}`);

    ws.send(JSON.stringify({ type: 'id', id }));

    // Envia lista de peers já conectados
    ws.send(JSON.stringify({
        type: 'list',
        peers: Array.from(clients.keys()).filter(k => k !== id)
    }));

    ws.on('message', (data) => {
        try {
            const msg = JSON.parse(data);
            if (msg.to && clients.has(msg.to)) {
                clients.get(msg.to).send(JSON.stringify({ ...msg, from: id }));
            }
        } catch (e) {
            console.error('Erro no parse da mensagem:', e);
        }
    });

    ws.on('close', () => {
        console.log(`Nodo desconectado: ${id} | Total: ${clients.size - 1}`);
        clients.delete(id);
    });
});

console.log('AYANODE P2P Signaling Server rodando!');
console.log(`Porta: ${process.env.PORT || 8080}`);