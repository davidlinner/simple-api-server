import express from 'express'
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';
import basicAuth from 'express-basic-auth';
import bcrypt from 'bcrypt';

import itemsRouter from "./routers/items.router.js";
import {createDataFileIfNotExists} from "./data.js";

const app = express()
app.use(express.static('www'));
app.use(express.urlencoded());
app.use(express.json());

const USERS = {
    'david' : '$2b$10$3vLRdEC62e1On1/CrfJt.OE1vG4y2kAjjPyNXx04GpfcMBNLjpA1i'
}

async function myAuthorizer(username, password, callback) {
    if (Object.keys(USERS).includes(username)){
        const passwordMatches = await bcrypt.compare(password, USERS[username]);
        callback(null, passwordMatches)
    } else {
        callback(null, false)
    }
}

app.use(basicAuth({
    authorizer: myAuthorizer,
    authorizeAsync: true,
}))

app.use(createDataFileIfNotExists());

app.use('/', itemsRouter)

const openAPIOptions = {
    failOnErrors: true, // Whether or not to throw when parsing errors. Defaults to false.
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Shopping List',
            version: '1.0.0',
        },
    },
    apis: ['./src/routers/*.router.js'],
};

const openapiSpecification = swaggerJsdoc(openAPIOptions);
app.use(
    "/api-docs",
    swaggerUi.serve,
    swaggerUi.setup(openapiSpecification)
);

export default app
