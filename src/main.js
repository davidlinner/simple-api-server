import express from 'express'
import {promises, existsSync} from 'fs';

const app = express()

app.use(express.json());

const DATA_FILE = 'shopping-list.json';

/**
 * Return all shopping list items as JSON.
 */
app.get('/items', async (request, response) => {
    const text = await promises.readFile(DATA_FILE, {encoding:'utf8'})
    const shoppingList = JSON.parse(text);
    response.json(shoppingList);
})

/**
 * Override a shopping list item at a given position.
 */
app.put('/items/:index', async (request, response) => {
    const data = await promises.readFile(DATA_FILE, {encoding:'utf8'})
    const shoppingList = JSON.parse(data);

    const newItem = request.body;
    const itemIndex = request.params['index'];

    shoppingList[itemIndex] = newItem;

    await promises.writeFile(DATA_FILE, JSON.stringify(shoppingList), {encoding:'utf-8'})

    response.sendStatus(200);
})

/**
 * Delete a shopping list item from a given position.
 */
app.delete('/items/:index', async (request, response) => {
    const data = await promises.readFile(DATA_FILE, {encoding:'utf8'})
    const shoppingList = JSON.parse(data);

    const itemIndex = request.params['index'];

    shoppingList.splice(itemIndex, 1)

    await promises.writeFile(DATA_FILE, JSON.stringify(shoppingList), {encoding:'utf-8'})

    response.sendStatus(200);
})

/**
 * Create the DATA_FILE if it does not exist yet.
 */
if(!existsSync(DATA_FILE)){
    await promises.writeFile(DATA_FILE, JSON.stringify([]), {encoding:'utf-8'})
}

const port = 8000;
/**
 * Start the server.
 */
app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})
