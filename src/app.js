import express from 'express'
import {promises, existsSync} from 'fs';
import {body, validationResult} from 'express-validator';

const app = express()
app.use(express.static('www'));
app.use(express.urlencoded());
app.use(express.json());

const dataFile = () => async (request, response, next) => {
    if (!existsSync(DATA_FILE)) {
        await promises.writeFile(DATA_FILE, JSON.stringify([]), {encoding: 'utf-8'})
    }
    next()
}

async function clearDataFile(){
    await promises.rm(DATA_FILE);
}

const DATA_FILE = 'shopping-list.json';

const nameNotEmpty = () => body('name').notEmpty();
const quantityIntMinOne = () => body('quantity').isInt({min: 1}).toInt();

app.use(dataFile());

/**
 * Return all shopping list items as JSON.
 */
app.get('/items', async (request, response) => {
    const text = await promises.readFile(DATA_FILE, {encoding: 'utf8'})
    const shoppingList = JSON.parse(text);
    response.json(shoppingList);
})

/**
 * Override a shopping list item at a given position.
 */
app.put(
    '/items/:index',
    nameNotEmpty(),
    quantityIntMinOne(),
    async (request, response) => {

        const data = await promises.readFile(DATA_FILE, {encoding: 'utf8'})
        const shoppingList = JSON.parse(data);

        const newItem = request.body;
        const itemIndex = request.params['index'];

        shoppingList[itemIndex] = newItem;

        await promises.writeFile(DATA_FILE, JSON.stringify(shoppingList), {encoding: 'utf-8'})

        response.sendStatus(200);
    })

app.patch('/items/:index',
    nameNotEmpty().optional(),
    quantityIntMinOne().optional(),
    async (request, response) => {

        const validationIssues = validationResult(request);
        if (!validationIssues.isEmpty()) {
            response
                .status(400)
                .json(validationIssues.array());

            return
        }

        const data = await promises.readFile(DATA_FILE, {encoding: 'utf8'});
        const shoppingList = JSON.parse(data);
        const i = request.params.index;

        if (shoppingList[i]) {
            shoppingList[i] = {
                ...shoppingList[i],
                ...request.body
            }

            await promises.writeFile(DATA_FILE, JSON.stringify(shoppingList), {encoding: 'utf-8'});
            response.sendStatus(200);
        } else {
            response.sendStatus(404);
        }

    })

/**
 * Delete a shopping list item from a given position.
 */
app.delete('/items/:index', async (request, response) => {
    const data = await promises.readFile(DATA_FILE, {encoding: 'utf8'})
    const shoppingList = JSON.parse(data);

    const itemIndex = request.params['index'];

    if(itemIndex >= shoppingList.length){
        response.sendStatus(404);
    } else {
        shoppingList.splice(itemIndex, 1)
        await promises.writeFile(DATA_FILE, JSON.stringify(shoppingList), {encoding: 'utf-8'})
        response.sendStatus(200);
    }
})

app.post(
    '/items',
    nameNotEmpty(),
    quantityIntMinOne(),
    async (request, response) => {

        const validationIssues = validationResult(request);
        if (!validationIssues.isEmpty()) {
            response
                .status(400)
                .json(validationIssues.array());

        } else {
            const data = await promises.readFile(DATA_FILE, {encoding: 'utf8'})
            const shoppingList = JSON.parse(data)

            const newItem = request.body
            shoppingList.push(newItem)

            await promises.writeFile(DATA_FILE, JSON.stringify(shoppingList), {encoding: 'utf8'})
            response.sendStatus(200);
        }

    })


export default app
export {clearDataFile}