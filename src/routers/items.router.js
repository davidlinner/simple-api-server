/**
 * @openapi
 * components:
 *   schemas:
 *     ShoppingListItem:
 *       type: object
 *       required:
 *         - name
 *         - quantity
 *       properties:
 *         name:
 *           type: string
 *           description: Item name, for example 'milk'
 *         quantity:
 *           type: number
 *           description: The quantity of the item.
 *       example:
 *         name: milk
 *         quantity: 1
 *
 */


import {Router} from "express";
import failOnInvalidData from "../failOnInvalidData.js";
import {body} from "express-validator";
import {readItems, saveItems} from "../data.js";

const itemsRouter = Router();

const validateShoppingListItem = () => [
    body('name').notEmpty(),
    body('quantity').isInt({min: 1}).toInt()
]

/**
 * @openapi
 * /items:
 *   get:
 *      description: Returns all items on the shopping list.
 *      responses:
 *         200:
 *              description: Returns all shopping list items.
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: array
 *                          items:
 *                              $ref: '#/components/schemas/ShoppingListItem'
 *         404:
 *              description: Nothing found.
 */
itemsRouter.get('/items', async (request, response) => {
    const shoppingList = await readItems();
    response.json(shoppingList);
})

/**
 * @openapi
 * /items/{index}:
 *   put:
 *      description: Returns all items on the shopping list.
 *      parameters:
 *         - in: path
 *           name: index
 *           schema:
 *             type: integer
 *           required: true
 *           description: Numeric index of an item in the shopping list.
 *      requestBody:
 *          description: The full update for an item.
 *          required: true
 *          content:
 *                application/json:
 *                     schema:
 *                        $ref: '#/components/schemas/ShoppingListItem'
 *      responses:
 *         200:
 *              description: Item was successfully updated.
 *
 *         404:
 *              description: No item at this index.
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
    failOnInvalidData,
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
    validateShoppingListItem(),
    failOnInvalidData,
    async (request, response) => {
        const shoppingList = await readItems()

        const newItem = request.body
        shoppingList.push(newItem)

        await saveItems(shoppingList)
        response.sendStatus(200);

    })

export default itemsRouter;