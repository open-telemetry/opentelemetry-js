require("./tracing").setup('server.json');

import { Socket } from "net";
import * as http from 'http';

// Maintain a hash of all connected sockets
var sockets: Array<Socket> = []

let requests = 0;

const server = new http.Server(function requestListener(req, res) {
    requests++
    res.statusCode = 200;
    res.setHeader("content-type", "application/json");
    res.write(JSON.stringify({
        success: true,
    }))
    res.end();
    res.on('close', () => {
        if (requests === 5) {
            server.close();
            sockets.forEach(s => s.destroy());
        }
    });
})
    // bind to a random port assigned by the server
    // and send it to the parent process
    .listen(0, () => {
        const addr = server.address();
        if (addr == null) {
            console.error("unexpected addr null")
            process.exit(1)
        }

        if (typeof addr === "string") {
            console.error("unexpected addr", addr);
            process.exit(1);
        }
        process.send?.(addr.port);
    });

server.on('connection', function (socket: Socket) {
    sockets.push(socket);

    // Remove the socket when it closes
    socket.on('close', function () {
        sockets = sockets.filter(s => s !== socket);
    });
});
