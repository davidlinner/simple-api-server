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

        const response1 = await request(app)
            .post('/items')
            .send(item);
        expect(response1.statusCode).toBe(200);

        const response2 = await request(app).get('/items');
        expect(response2.statusCode).toBe(200);
        expect(response2.body).toEqual(expect.arrayContaining([item]));
    })
    
    // more test cases
    // 1. patch
    //     post item
    //     patch with index 0 item with only quantity
    //     get all items and see if there is one with old name and new quantity
    // 2a successful delete - before list is empty
    //     post item or put item to index 0
    //     delete item at index 0 - 200
    //     get items must return an empty body
    // 2b delete with incorrect index
    //     delete item at index 0 - 404
    // 3. put
    // 4. validation
})