import { randomUUID } from 'node:crypto';

import {
    readBookings,
    writeBookings
} from '../utils/booking.store.js';


// export const createBooking = (req, res) => {

//     req.body;

//     try {

//         console.log("everything is working!");

//         return res.status(200).json({
//             success: true,
//             message: 'Booking submitted successfully',
//             data: { data: req.body }
//         });

//     } catch (error) {

//         console.error('Booking creation error:', error);

//         return res.status(500).json({
//             success: false,
//             message: 'Something went wrong while creating booking'
//         });

//     }
// }



// CREATE BOOKING

export const createBooking = async (req, res) => {

    try {
        const {
            fullname,
            email,
            phone,
            eventType,
            eventDate,
            guestCount,
            duration,
            preferredVenue,
            venueType,
            catering,
            decoration,
            photography,
            budget,
            requirements
        } = req.decryptedData;

        
        if (
            !fullname?.trim() ||
            !email?.trim() ||
            !phone?.trim() ||
            !eventType ||
            !eventDate ||
            !guestCount ||
            !duration ||
            !preferredVenue ||
            !venueType ||
            !budget
        ) {

            return res.status(400).json({
                success: false,
                message: 'Please provide all required fields'
            });

        }


        // Date validation

        const today = new Date().toISOString().split('T')[0];

        if (
            !/^\d{4}-\d{2}-\d{2}$/.test(eventDate) ||
            !Number.isFinite(Date.parse(`${eventDate}T00:00:00.000Z`)) || // Date.parse converts the data into miliseconds!
            eventDate < today
        ) {

            return res.status(400).json({
                success: false,
                message: 'Please provide a valid future event date'
            });

        }


        // Create booking object

        const newBooking = {

            id: randomUUID(),

            fullname: fullname.trim(),
            email: email.trim().toLowerCase(),
            phone: phone.trim(),

            eventType,
            eventDate,
            guestCount: Number(guestCount),
            duration,

            preferredVenue,
            venueType,

            catering: Boolean(catering),
            decoration: Boolean(decoration),
            photography: Boolean(photography),

            budget,
            requirements: requirements || '',

            status: 'Pending',

            adminRemarks: '',

            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()

        };


        // Save booking in JSON file

        const bookings = await readBookings();

        bookings.push(newBooking);

        await writeBookings(bookings);

        return res.status(201).json({

            success: true,
            message: 'Booking request submitted successfully',
            data: newBooking

        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            success: false,
            message: 'Unable to create booking'
        });

    }

};


// GET ALL BOOKINGS

export const getBookings = async (req, res) => {

    try {

        const bookings = await readBookings();

        const page = Math.max(1, Number(req.query.page) || 1);

        const limit = Math.min(
            50,
            Math.max(1, Number(req.query.limit) || 10)
        );

        const totalBookings = bookings.length;

        const totalPages = Math.ceil(totalBookings / limit);

        const startIndex = (page - 1) * limit;

        const paginatedBookings = bookings
            .sort((a, b) =>
                new Date(b.createdAt) - new Date(a.createdAt)
            )
            .slice(startIndex, startIndex + limit);


        return res.status(200).json({

            success: true,

            data: paginatedBookings,

            pagination: {
                currentPage: page,
                totalPages,
                totalBookings,
                limit
            }

        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            success: false,
            message: 'Unable to fetch bookings'
        });

    }

};


// UPDATE BOOKING STATUS

export const updateBookingStatus = async (req, res) => {


    try {

        const { id } = req.params;

        const { status, remarks } = req.body;


        // Validate status

        const allowedStatuses = [
            'Confirmed' || 'confirmed',
            'Cancelled' || 'cancelled'
        ];

        if (!allowedStatuses.includes(status)) {

            return res.status(400).json({
                success: false,
                message: 'Invalid booking status'
            });

        }


        // Cancellation requires remarks

        if (
            status === 'Cancelled' &&
            (!remarks || !remarks.trim())
        ) {

            return res.status(400).json({
                success: false,
                message: 'Cancellation remarks are required'
            });

        }


        const bookings = await readBookings();

        const bookingIndex = bookings.findIndex(
            booking => booking.id === id
        );


        if (bookingIndex === -1) {

            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });

        }


        const booking = bookings[bookingIndex];


        // Update status

        booking.status = status;

        booking.adminRemarks =
            status === 'Cancelled' ? remarks.trim() : '';

        booking.updatedAt = new Date().toISOString();


        await writeBookings(bookings);


        return res.status(200).json({

            success: true,

            message: `Booking ${status.toLowerCase()} successfully`,

            data: booking

        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            success: false,
            message: 'Unable to update booking'
        });

    }

};