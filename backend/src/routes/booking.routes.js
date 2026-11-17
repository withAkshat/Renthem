import express from "express"
import { createBooking, getBookings, updateBookingStatus } from "../controllers/booking.controller.js";
import {
    decryptRequest,
    encryptResponse
} from '../middlewares/encryption.middleware.js';

const router = express.Router();

router.post('/',
    decryptRequest,
    encryptResponse, 
    createBooking);

router.get('/', getBookings);

router.patch('/:id/status', updateBookingStatus);

export default router