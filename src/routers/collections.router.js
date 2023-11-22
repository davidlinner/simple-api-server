/**
 * @openapi
 * components:
 *   securitySchemes:
 *     basicAuth:     # <-- arbitrary name for the security scheme
 *       type: http
 *       scheme: basic
 *   schemas:
 *     Collection:
 *       type: object
 *       required:
 *         - name
 *         - schema
 *       properties:
 *         name:
 *           type: string
 *           description: Name of this collection. Used as path segment.
 *         schema:
 *           type: string
 *           description: JSON Schema of items this collection. Used for validation on updates or not insertions.
 *       example:
 *         name: products
 *         schema: >
 *           {
 *             "type": "object",
 *             "properties": {
 *                 "name": {"type": "string"},
 *                 "description": {"type": "string"},
 *                 "price": {"type": "number"}
 *             },
 *             "required": ["name", "price"],
 *             "additionalProperties": false
 *           }
 *
 */

import {Router} from "express";
import {v4 as uuidv4} from 'uuid';
import Ajv from "ajv";
import ajvMergePatchSupport from "ajv-merge-patch"

const BASIC_SCHEMA = {
    "type": "object",
    "properties": {
        "id": {"type": "string"},
    },
    "additionalProperties": false
}

const collections = {};

const collectionsRouter = Router();

function isValidCollectionName(str) {
    return /^[A-Za-z\-]+$/.test(str);
}

const ajv = new Ajv();
ajvMergePatchSupport(ajv);

/**
 * @openapi
 * /collections/{collectionName}:
 *   put:
 *      description: Adds a new collection.
 *      parameters:
 *         - in: path
 *           name: collectionName
 *           schema:
 *             type: string
 *           required: true
 *           description: Name of the collection to modify.
 *      requestBody:
 *          description: The full update for an item.
 *          required: true
 *          content:
 *                application/json:
 *                     schema:
 *                        $ref: '#/components/schemas/Collection'
 *      responses:
 *         200:
 *              description: Collection successfully added.
 *
 *         400:
 *              description: Collection name is invalid or schema is invalid.
 */
collectionsRouter.put(
    '/:collectionName',
    async (request, response) => {
        const {collectionName} = request.params;
        if (!isValidCollectionName(collectionName) || collections.hasOwnProperty(collectionName)) {
            response.status(400).send({
                message: `Collection '${collectionName}' not allowed. Either the name is invalid or the collection exists already.`
            });
            return;
        }

        const {schema} = request.body;

        try {
            const joinedSchema = {
                $merge: {
                    source: BASIC_SCHEMA,
                    with: JSON.parse(schema)

                }
            }

            const validate = ajv.compile(joinedSchema);
            collections[collectionName] = {validate, data: []};

            response.sendStatus(200);
        } catch ({message = 'Unknown problem with given JSON schema.'}) {
            response.status(400).send({message});
        }
    })


/**
 * @openapi
 * /collections/{collectionName}:
 *   get:
 *      description: Returns all items from the named collection.
 *      parameters:
 *        - in: path
 *          name: collectionName
 *          schema:
 *            type: string
 *          required: true
 *          description: Name of the collection to add the item to.
 *      responses:
 *         200:
 *              description: Returns all items.
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: array
 *                          items:
 *                              type: object
 *         404:
 *              description: Nothing found.
 */
collectionsRouter.get('/:collectionName', async (request, response) => {
    const {collectionName} = request.params;
    if (!collectionName || !collections.hasOwnProperty(collectionName)) {
        response.status(400).send({
            message: `No collection '${collectionName}' not found.`
        });
        return;
    }

    const collection = collections[collectionName];

    response.send(collection.data);
})

/**
 * @openapi
 * /collections/{collectionName}:
 *   post:
 *      description: Adds a new item.
 *      parameters:
 *         - in: path
 *           name: collectionName
 *           schema:
 *             type: string
 *           required: true
 *           description: Name of the collection to add the item to.
 *      requestBody:
 *          description: The new item. An id is given to the item automatically.
 *          required: true
 *          content:
 *                application/json:
 *                     schema:
 *                        AnyValue:
 *                           description: Has to comply with the JSON schema assigned to this collection.
 *      responses:
 *         200:
 *              description: Item was successfully added and returned including an id.
 *
 *         400:
 *              description: No such collection.
 */
collectionsRouter.post(
    '/:collectionName',
    async (request, response) => {
        const {collectionName} = request.params;
        if (!collectionName || !collections.hasOwnProperty(collectionName)) {
            response.status(400).send({
                message: `No collection '${collectionName}' not found.`
            });
            return;
        }

        const collection = collections[collectionName];
        const {validate, data} = collection;

        if (validate(request.body)) {
            const newItem = {...request.body, id: uuidv4()}
            data.push(newItem);
            response.status(200).send(newItem);
        } else {
            response.status(400).send({
                message: 'Invalid object send. See "errors" for details.',
                errors: validate.errors
            })
        }
    })


/**
 * @openapi
 * /collections/{collectionName}/{id}:
 *   put:
 *      description: Updates the item with the given id in the given collection.
 *      parameters:
 *         - in: path
 *           name: collectionName
 *           schema:
 *             type: string
 *           required: true
 *           description: Name of the collection to modify.
 *         - in: path
 *           name: id
 *           schema:
 *             type: string
 *           required: true
 *           description: V4 UUID of the item to modify.
 *      requestBody:
 *          description: The full update for an item.
 *          required: true
 *          content:
 *                application/json:
 *                   schema:
 *                      AnyValue:
 *                           description: Has to comply with the JSON schema assigned to this collection.
 *      responses:
 *         200:
 *              description: Item was successfully updated.
 *
 *         404:
 *              description: No item and collection with given name and id.
 */
collectionsRouter.put(
    '/:collectionName/:id',
    async (request, response) => {
        const {collectionName, id} = request.params;
        if (!collectionName || !collections.hasOwnProperty(collectionName)) {
            response.status(400).send({
                message: `No collection '${collectionName}' not found.`
            });
            return;
        }

        const collection = collections[collectionName];
        const {validate, data} = collection;

        const index = data.findIndex(item => item.id === id);

        if (index < 0) {
            response.status(404).send({
                message: `No item '${id}' found in collection '${collectionName}'.`
            });
            return;
        }

        if (validate(request.body)) {
            const item = {...request.body, id};
            data[index] = item;
            response.status(200).send(item);
        } else {
            response.status(400).send({
                message: 'Invalid object send. See "errors" for details.',
                errors: validate.errors
            })
        }
    })

/**
 * Delete a shopping list item from a given position.
 */
collectionsRouter.delete('/:collectionName/:id', async (request, response) => {
    const {collectionName, id} = request.params;

    if (!collectionName || !collections.hasOwnProperty(collectionName)) {
        response.status(400).send({
            message: `No collection '${collectionName}' not found.`
        });
        return;
    }

    const collection = collections[collectionName];
    const {data} = collection;

    const index = data.findIndex(item => item.id === id);

    if (index < 0) {
        response.status(404).send({
            message: `No item '${id}' found in collection '${collectionName}'.`
        });
        return;
    }

    data.splice(index, 1);

    response.sendStatus(200);
})

export default collectionsRouter;