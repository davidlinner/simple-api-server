import express from 'express'
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';
import basicAuth from 'express-basic-auth';
import bcrypt from 'bcrypt';

import collectionsRouter from "./routers/collections.router.js";

const app = express()
app.use(express.json());

const USERS = {
    'student' : '$2b$10$NKKl7tyZwkyEmgCJkco6g.BcqBg4vCO8wqeg0P9GX5XdSL4iPQ.oi'
}

function myAuthorizer(username, password, callback) {
    if (Object.keys(USERS).includes(username)){
        bcrypt.compare(password, USERS[username])
            .then(passwordMatches =>  callback(null, passwordMatches))
            .catch(callback);
    } else {
        callback(null, false)
    }
}

app.use('/collections', basicAuth({
    authorizer: myAuthorizer,
    authorizeAsync: true,
}))

app.use('/collections', collectionsRouter)

const openAPIOptions = {
    failOnErrors: true, // Whether or not to throw when parsing errors. Defaults to false.
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Generic API Server for any collection of items',
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
