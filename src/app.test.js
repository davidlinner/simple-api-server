import app, {clearDataFile} from './app.js'
import request from 'supertest'

describe('API Server Test', ()=>{

    beforeEach(() => {
        clearDataFile();
    });

    test('Test getting items', async ()=> {
        const response = await request(app).get('/items');
        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual([])
    })

    test('Test appending an item', async ()=> {
        const item = {
            name: 'Flour',
            quantity: 1
        }

        let response = await request(app)
            .post('/items')
            .send(item);
        expect(response.statusCode).toBe(200);

        response = await request(app).get('/items');
        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual(expect.arrayContaining([item]));
    })
    
    // more test cases
    // 1. patch
    // 2. delete
    //   - on empty shopping
    // 3. put
    // 4. validation
})