require('dotenv').config()
const http = require('http');
const { v4: uuidv4 } = require('uuid');
const DB = require('./../fakeDB.json');

const PORT = process.env.PORT || 3001;

class Server {
    port: number
    constructor(port: number) {
            this.port = port
    }

    start() {
        http.createServer((req: any, res: any) => {
            const { method, url } = req;

            if (url === '/api/users' && method === 'GET') {
                // GET all users
                console.log('/api/users')
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(DB.users));
            } else if (url.match(/\/api\/users\/\w+/) && method === 'GET') {
                // GET user by userId
                const userId = url.split('/')[3];
                const user = DB.users.find((u: any) => u.id === userId);
                if (!user) {
                    res.writeHead(404, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'User not found' }));
                } else {
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify(user));
                }
            } else if (url === '/api/users' && method === 'POST') {
                // POST create user
                let body = '';
                req.on('data', (chunk: any) => {
                    body += chunk.toString();
                });
                req.on('end', () => {
                    const { name } = JSON.parse(body);
                    if (!name) {
                        res.writeHead(400, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ error: 'Name is required' }));
                    } else {
                        const newUser = { id: uuidv4(), name };
                        DB.users.push(newUser);
                        res.writeHead(201, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify(newUser));
                    }
                });
            } else if (url.match(/\/api\/users\/\w+/) && method === 'PUT') {
                // PUT update user by userId
                const userId = url.split('/')[3];
                const userIndex = DB.users.findIndex((u: any) => u.id === userId);
                if (userIndex === -1) {
                    res.writeHead(404, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'User not found' }));
                } else {
                    let body = '';
                    req.on('data', (chunk: any) => {
                        body += chunk.toString();
                    });
                    req.on('end', () => {
                        const { name } = JSON.parse(body);
                        if (!name) {
                            res.writeHead(400, { 'Content-Type': 'application/json' });
                            res.end(JSON.stringify({ error: 'Name and is required' }));
                        } else {
                            DB.users[userIndex] = { ...DB.users[userIndex], name };
                            res.writeHead(200, { 'Content-Type': 'application/json' });
                            res.end(JSON.stringify(DB.users[userIndex]));
                        }
                    });
                }
            } else if (url.match(/\/api\/users\/\w+/) && method === 'DELETE') {
                // DELETE user by userId
                const userId = url.split('/')[3];
                const userIndex = DB.users.findIndex((u: any) => u.id === userId);
                if (userIndex === -1) {
                    res.writeHead(404, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'User not found' }));
                } else {
                    DB.users.splice(userIndex, 1);
                    res.writeHead(204);
                    res.end();
                }
            } else {
                // Invalid endpoint
                res.writeHead(404, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Endpoint not found' }));
            }
        }).listen(this.port, () => {
            console.log(`Server is running on port ${this.port}`);
        });
    }

}

export const server = new Server(PORT as number)
