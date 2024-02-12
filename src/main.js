"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.server = void 0;
const http = require('http');
const { v4: uuidv4 } = require('uuid');
const PORT = Number(process.env.PORT) || 3000;
let users = [];
class Server {
    constructor(port) {
        this.port = port;
    }
    start() {
        http.createServer((req, res) => {
            const { method, url } = req;
            if (url === '/api/users' && method === 'GET') {
                // GET all users
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(users));
            }
            else if (url.match(/\/api\/users\/\w+/) && method === 'GET') {
                // GET user by userId
                const userId = url.split('/')[3];
                const user = users.find((u) => u.id === userId);
                if (!user) {
                    res.writeHead(404, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'User not found' }));
                }
                else {
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify(user));
                }
            }
            else if (url === '/api/users' && method === 'POST') {
                // POST create user
                let body = '';
                req.on('data', (chunk) => {
                    body += chunk.toString();
                });
                req.on('end', () => {
                    const { name, email } = JSON.parse(body);
                    if (!name || !email) {
                        res.writeHead(400, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ error: 'Name and email are required' }));
                    }
                    else {
                        const newUser = { id: uuidv4(), name, email };
                        users.push(newUser);
                        res.writeHead(201, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify(newUser));
                    }
                });
            }
            else if (url.match(/\/api\/users\/\w+/) && method === 'PUT') {
                // PUT update user by userId
                const userId = url.split('/')[3];
                const userIndex = users.findIndex((u) => u.id === userId);
                if (userIndex === -1) {
                    res.writeHead(404, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'User not found' }));
                }
                else {
                    let body = '';
                    req.on('data', (chunk) => {
                        body += chunk.toString();
                    });
                    req.on('end', () => {
                        const { name, email } = JSON.parse(body);
                        if (!name || !email) {
                            res.writeHead(400, { 'Content-Type': 'application/json' });
                            res.end(JSON.stringify({ error: 'Name and email are required' }));
                        }
                        else {
                            users[userIndex] = Object.assign(Object.assign({}, users[userIndex]), { name, email });
                            res.writeHead(200, { 'Content-Type': 'application/json' });
                            res.end(JSON.stringify(users[userIndex]));
                        }
                    });
                }
            }
            else if (url.match(/\/api\/users\/\w+/) && method === 'DELETE') {
                // DELETE user by userId
                const userId = url.split('/')[3];
                const userIndex = users.findIndex((u) => u.id === userId);
                if (userIndex === -1) {
                    res.writeHead(404, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'User not found' }));
                }
                else {
                    users.splice(userIndex, 1);
                    res.writeHead(204);
                    res.end();
                }
            }
            else {
                // Invalid endpoint
                res.writeHead(404, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Endpoint not found' }));
            }
        });
        console.log(`Server is running on port ${PORT}`);
    }
}
exports.server = new Server(PORT);
