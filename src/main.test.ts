import * as http from 'http';
import { Server } from './main';

const mockDB: { users: any[] } = {
    users: []
};

describe('API endpoints', () => {
    let serverInstance: Server;

    beforeAll(() => {
        serverInstance = new Server(3000, mockDB);
        serverInstance.start();
    });

    afterAll(() => {
        // Clean up resources after all tests are done
        // For example, stop the server
        // serverInstance.stop();
    });

    test('GET /api/users should return all users', async () => {
        const res = await http.get('http://localhost:3000/api/users');

        let rawData = '';
        res.on('data', (chunk: any) => {
            rawData += chunk;
        });
        res.on('end', () => {
            const users = JSON.parse(rawData);
            expect(users).toEqual(mockDB.users);
        });
    });

    test('POST /api/users should create a new user', async () => {
        const newUser = {
            name: 'John Doe',
            age: 30,
            hobbies: ['Reading', 'Running']
        };

        const options = {
            hostname: 'localhost',
            port: 3000,
            path: '/api/users',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        };

        const req = http.request(options, (res) => {
            expect(res.statusCode).toBe(201);

            let rawData = '';
            res.on('data', (chunk) => {
                rawData += chunk;
            });
            res.on('end', () => {
                const createdUser = JSON.parse(rawData);
                // Check if the user is properly created
                expect(createdUser.name).toBe(newUser.name);
                expect(createdUser.age).toBe(newUser.age);
                expect(createdUser.hobbies).toEqual(newUser.hobbies);
            });
        });

        req.write(JSON.stringify(newUser));
        req.end();
    });

    test('PUT /api/users/:id should update an existing user', async () => {
        // Adding a user to the mock database
        const newUser = {
            id: 'uniqueUserId',
            name: 'John Doe',
            age: 30,
            hobbies: ['Reading', 'Running']
        };
        mockDB.users.push(newUser);

        const updatedUserData = {
            name: 'Updated Name',
            age: 40,
            hobbies: ['Swimming', 'Cooking']
        };

        const options = {
            hostname: 'localhost',
            port: 3000,
            path: `/api/users/${newUser.id}`, // Using the id of the newly added user
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            }
        };
    });

    test('DELETE /api/users/:id should delete an existing user', async () => {
        // Adding a user to the mock database
        const newUser = {
            id: 'uniqueUserId',
            name: 'John Doe',
            age: 30,
            hobbies: ['Reading', 'Running']
        };
        mockDB.users.push(newUser);

        const options = {
            hostname: 'localhost',
            port: 3000,
            path: `/api/users/${newUser.id}`,
            method: 'DELETE'
        };

    });

});