import express from 'express'
import itemsRouter from "./routers/items.router.js";
import {createDataFileIfNotExists} from "./data.js";

const app = express()
app.use(express.static('www'));
app.use(express.urlencoded());
app.use(express.json());

app.use(createDataFileIfNotExists());

app.use('/', itemsRouter) 

export default app
