import {existsSync, promises} from "fs";


const DATA_FILE = 'shopping-list.json';

const createDataFileIfNotExists = () => async (request, response, next) => {
    if (!existsSync(DATA_FILE)) {
        await saveItems([]);
    }
    await next()
};

async function clearDataFile() {
    await promises.rm(DATA_FILE);
}

async function readItems(){
    const text = await promises.readFile(DATA_FILE, {encoding: 'utf8'})
    return JSON.parse(text);
}

async function saveItems(items){
    await promises.writeFile(DATA_FILE, JSON.stringify(items), {encoding: 'utf-8'})
}

export {createDataFileIfNotExists, clearDataFile, readItems, saveItems};