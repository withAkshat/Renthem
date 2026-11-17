import fs from 'node:fs/promises';
import path from 'node:path';

const DATA_DIR = path.resolve('data');  // converts relative path to absolute path!

const FILE_PATH = path.join(DATA_DIR, 'bookings.json'); // it will join the DATA_DIR with booking.json



// Ensure JSON file exists
export const initializeBookingFile = async () => {

    await fs.mkdir(DATA_DIR, { recursive: true }); // if folder doesn't exists make one!

    try {

        await fs.access(FILE_PATH); // does FILE_PATH exists?

    } catch {

        await fs.writeFile(FILE_PATH, '[]', 'utf-8'); // if not create one

    }

};


// Read all bookings
export const readBookings = async () => {

    await initializeBookingFile();

    const data = await fs.readFile(FILE_PATH, 'utf-8');

    return JSON.parse(data);  // JSON string into js object

};


// Write bookings
export const writeBookings = async (bookings) => {

    await initializeBookingFile();  

    await fs.writeFile(  // replaces exixting file content, does not append any new record!
        FILE_PATH,
        JSON.stringify(bookings, null, 2),
        'utf-8'
    );

};