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

const PATIENTS_FILE = './patients.json';

const TREATMENTS_FILE = './treatments.json';
const APPOINTMENTS_FILE = './appointment.json';

async function savePatients(patients){
    await promises.writeFile(PATIENTS_FILE, JSON.stringify(patients), {encoding: 'utf-8'})
}

async function readPatients(){
    if (existsSync(PATIENTS_FILE)){
        const text = await promises.readFile(PATIENTS_FILE, {encoding: 'utf8'})
        return JSON.parse(text);
    }

    return [];
}

async function readAppointments(){
    if (existsSync(APPOINTMENTS_FILE)){
        const text = await promises.readFile(APPOINTMENTS_FILE, {encoding: 'utf8'})
        return JSON.parse(text);
    }

    return [];
}

async function saveAppointments(appointments){
    if (existsSync(APPOINTMENTS_FILE)){
        const text = JSON.stringify(appointments);
        await promises.writeFile(APPOINTMENTS_FILE, text,  {encoding: 'utf8'})
    }

    return [];
}

async function readTreatments(){
    if (existsSync(TREATMENTS_FILE)){
        const text = await promises.readFile(TREATMENTS_FILE, {encoding: 'utf8'})
        return JSON.parse(text);
    }

    return [];
}

const patientsRouter = Router();


/**
 * @openapi
 * /patients/do-admiss:
 *   post:
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


patientsRouter.get(
    '/appointments/:patientCode',
    async (request, response) => {

        const {patientCode} = request.params;

        const appointments = await readAppointments();

        const appointment = appointments.find(appointment => appointment.patientCode === patientCode);

        if(appointment){
            response.send(appointment)
        } else {
            response.sendStatus(404);
        }
    })


patientsRouter.get(
    '/treatments/:id',
    async (request, response) => {

        const id = parseInt(request.params.id);

        const treatments = await readTreatments();

        const treatment = treatments.find(treatment => treatment.id === id);

        if(treatment){
            response.send(treatment)
        } else {
            response.sendStatus(404);
        }
    })

patientsRouter.post(
    '/appointments/:patientCode/checklist',
    async (request, response) => {

        const patientCode = request.params.patientCode;

        const checklist = request.body;

        const appointments = await readAppointments();

        const appointment = appointments.find(appointment => appointment.patientCode === patientCode);

        if(appointment){
            appointment.checklist = checklist;
            await saveAppointments(appointments);
            response.sendStatus(200);
        } else {
            response.sendStatus(404);
        }
    })

export default patientsRouter;