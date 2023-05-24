import {Router} from "express";
import failOnInvalidData from "../failOnInvalidData.js";
import {body} from "express-validator";
import {readItems, saveItems} from "../data";

const itemsRouter = Router();

const validateShoppingListItem = () => [
    body('name').notEmpty(),
    body('quantity').isInt({min: 1}).toInt()
]

/**
 * Return all shopping list items as JSON.
 */
itemsRouter.get('/items', async (request, response) => {
    const shoppingList = await readItems();
    response.json(shoppingList);
})


/**
 * Override a shopping list item at a given position.
 * {name:'abc', quantity:1}
 */
itemsRouter.put(
    '/items/:index',
    validateShoppingListItem(),
    failOnInvalidData,
    async (request, response) => {
        const shoppingList = await readItems();

        const newItem = request.body;
        const itemIndex = request.params['index'];

        if (itemIndex >= shoppingList.length) {
            response.sendStatus(404);
        } else {
            shoppingList[itemIndex] = newItem;
            await saveItems(shoppingList);
            response.sendStatus(200);
        }
    })

itemsRouter.patch('/items/:index',
    async (request, response) => {

        const shoppingList = await readItems();
        const i = request.params.index;

        if (shoppingList[i]) {
            shoppingList[i] = {
                ...shoppingList[i],
                ...request.body
            }

            await saveItems(shoppingList)
            response.sendStatus(200);
        } else {
            response.sendStatus(404);
        }

    })

/**
 * Delete a shopping list item from a given position.
 */
itemsRouter.delete('/items/:index', async (request, response) => {
    const shoppingList = readItems();

    const itemIndex = request.params['index'];

    if (itemIndex >= shoppingList.length) {
        response.sendStatus(404);
    } else {
        shoppingList.splice(itemIndex, 1)
        await saveItems(shoppingList)
        response.sendStatus(200);
    }
})

itemsRouter.post(
    '/items',
    async (request, response) => {
        const shoppingList = await readItems()

        const newItem = request.body
        shoppingList.push(newItem)

        await saveItems(shoppingList)
        response.sendStatus(200);

    })

export default itemsRouter;