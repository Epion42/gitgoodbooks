// tests/app.test.js
const request = require('supertest');
const app = require('../index');
const DbUtils = require('../dbUtils');
const dbUtils = new DbUtils();

describe('User Registration Workflow', () => {
    const agent = request.agent(app);

    describe('Authentication Failiures', () => {
        it('should fail to log into a new account', async () => {
            const loginResponse = await agent
                .post('/login')
                .send({
                    'username': 'notARealUser',
                    'password': 'notARealPassword'
                });
            
            expect(loginResponse.status).toBe(401);
        });

        it('should fail to log into an account with a long password', async () => {
            const loginResponse = await agent
                .post('/login')
                .send({
                    'username': 'notARealUser',
                    'password': 'thisIsASuperDuperLooooooooooooooooooooooooooooooooooooooooooooongPassword'
                });
            
            expect(loginResponse.status).toBe(400);
        });

        it('should fail to log in with no credentials', async () => {
            const loginResponse = await agent
                .post('/login')
                .send({});
            
            expect(loginResponse.status).toBe(400);
        });
    });
    
    describe('Sucecssful Authentication', () => {
        it('should successfully log in and be redirected to the homepage',async () => {
            const loginResponse = await agent
                .post('/login')
                .send({
                    'username': 'testUser1',
                    'password': 'DummyPass1'
                });
            
            expect(loginResponse.status).toBe(302);
            expect(loginResponse.header['location']).toBe('/home');
            expect(loginResponse.header['set-cookie']).toBeDefined();
        });
        it('should successfully get redirected to the homepage from /login', async () => {
            const registerResponse = await agent.get('/login');
            
            expect(registerResponse.status).toBe(302);
            expect(registerResponse.header['location']).toBe('/home');
        });
    });
});

describe('GET /register', () => {
    it('should successfully return the page', async () => {
        const registerResponse = await request(app).get('/register');
        
        expect(registerResponse.status).toBe(200);
    });
});

describe('GET /login', () => {
    it('should successfully return the page', async () => {
        const registerResponse = await request(app).get('/login');
        
        expect(registerResponse.status).toBe(200);
    });
});

describe('db getUserByUsername', () => {
    it('should successfully return the row for a test user', async () => {
        const dbResponse = await dbUtils.getUserByUsername('testUser1');

        expect(dbResponse.userid).toBe(1);
        expect(dbResponse.username).toBe('testUser1');
    });

    it('should fail to return the row for an invalid test user', async () => {
        const dbResponse = await dbUtils.getUserByUsername('notAValidUser');

        expect(dbResponse).toBe(null);
    });
});

describe('db isExistingUser', () => {
    it('should successfully return that the test user is valid', async () => {
        const dbResponse = await dbUtils.isExistingUser('testUser1');

        expect(dbResponse).toBe(true);
    });

    it('should return that the test user is invalid', async () => {
        const dbResponse = await dbUtils.isExistingUser('testUser11');

        expect(dbResponse).toBe(false);
    });
});

describe('db createNewUser', () => {
    it('should return the userId and username of the new user', async () => {
        const createResponse = await dbUtils.createNewUser('testUser11', 'testHash');

        expect(createResponse.userid).toBe(11);
        expect(createResponse.username).toBe('testUser11');

        const getUser = await dbUtils.isExistingUser('testUser11');

        expect(getUser).toBe(true);
    });
});