/**
 * @openapi
 * components:
 *   schemas:
 *     Patient:
 *       type: object
 *       required:
 *         - firstName
 *         - lastName
 *         - emailAddress
 *         - phoneNumber
 *         - sex
 *       properties:
 *         firstName:
 *           type: string
 *           description: Firstname
 *         lastName:
 *           type: string
 *           description: Lastname
 *         emailAddress:
 *           type: string
 *           description: Persons email address
 *         phoneNumber:
 *           type: string
 *           description: Persons phone number
 *         sex:
 *           type: string
 *           enum: [female, male]
 *           description: Sex of the person
 *     QueueEntry:
 *       type: object
 *       required:
 *         - queueNumber
 *       properties:
 *         queueNumber:
 *           type: number
 *           description: The number is the waiting queue.
 */

import {Router} from "express";
import {existsSync, promises} from "fs";

const DATA_FILE = './patients.json';

async function savePatients(patients){
    await promises.writeFile(DATA_FILE, JSON.stringify(patients), {encoding: 'utf-8'})
}

async function readPatients(){
    if (existsSync(DATA_FILE)){
        const text = await promises.readFile(DATA_FILE, {encoding: 'utf8'})
        return JSON.parse(text);
    }

    return [];
}


const patientsRouter = Router();


/**
 * @openapi
 * /patients/do-admiss:
 *   put:
 *      description: Returns all items on the shopping list.
 *      requestBody:
 *          description: The data of the patient.
 *          required: true
 *          content:
 *                application/json:
 *                     schema:
 *                        $ref: '#/components/schemas/Patient'
 *      responses:
 *         200:
 *              description: Patient admission was successful.
 *              content:
 *              application/json:
 *               schema:
 *                 $ref: '#/components/schemas/QueueEntry'
 */
patientsRouter.post(
    '/patients/do-admiss',
    async (request, response) => {

        const data = request.body;

        const patients = await readPatients();
        const queueNumbers = patients.map(patient => patient.queueNumber);
        const nextQueueNumber = queueNumbers.length > 0 ? Math.max(...queueNumbers) + 1: 1

        patients.push({...data, queueNumber: nextQueueNumber});
        await savePatients(patients);

        response.send({queueNumber: nextQueueNumber})
    })

export default patientsRouter;