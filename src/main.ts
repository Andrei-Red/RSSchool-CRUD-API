require('dotenv').config()
const http = require('http');
const { v4: uuidv4 } = require('uuid');
const defaultDB = require('./../fakeDB.json');

const PORT = process.env.PORT || 3001;

export class Server {
    port: number
    DB: any
    constructor(port: number, DB?: any) {
            this.port = port
            this.DB = DB || defaultDB
    }

    start() {
        http.createServer((req: any, res: any) => {
            const { method, url } = req;

            if (url === '/api/users' && method === 'GET') {
                // GET all users
                console.log('/api/users')
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(this.DB.users));
            } else if (url.match(/\/api\/users\/\w+/) && method === 'GET') {
                // GET user by userId
                const userId = url.split('/')[3];
                const user = this.DB.users.find((u: any) => u.id === userId);
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
                    const { name, age, hobbies = [] } = JSON.parse(body);
                    if (!name && !age && !hobbies.length) {
                        res.writeHead(400, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ error: 'Name, age, hobbies are required' }));
                    } else {
                        const newUser = { id: uuidv4(), name, age, hobbies };
                        this.DB.users.push(newUser);
                        res.writeHead(201, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify(newUser));
                    }
                });
            } else if (url.match(/\/api\/users\/\w+/) && method === 'PUT') {
                // PUT update user by userId
                const userId = url.split('/')[3];
                const userIndex = this.DB.users.findIndex((u: any) => u.id === userId);
                if (userIndex === -1) {
                    res.writeHead(404, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'User not found' }));
                } else {
                    let body = '';
                    req.on('data', (chunk: any) => {
                        body += chunk.toString();
                    });
                    req.on('end', () => {
                        const { name, age, hobbies = [] } = JSON.parse(body);
                        if (!name && !age && !hobbies.length) {
                            res.writeHead(400, { 'Content-Type': 'application/json' });
                            res.end(JSON.stringify({ error: 'Name, age, hobbies are required' }));
                        } else {
                            this.DB.users[userIndex] = { ...this.DB.users[userIndex], name, age, hobbies };
                            res.writeHead(200, { 'Content-Type': 'application/json' });
                            res.end(JSON.stringify(this.DB.users[userIndex]));
                        }
                    });
                }
            } else if (url.match(/\/api\/users\/\w+/) && method === 'DELETE') {
                // DELETE user by userId
                const userId = url.split('/')[3];
                const userIndex = this.DB.users.findIndex((u: any) => u.id === userId);
                if (userIndex === -1) {
                    res.writeHead(404, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'User not found' }));
                } else {
                    this.DB.users.splice(userIndex, 1);
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
