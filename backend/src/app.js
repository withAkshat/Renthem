import express from "express"
import bookingRoutes from "./routes/booking.routes.js";
import authRoutes from "./routes/auth.routes.js";
import encryptionRoutes from './routes/encryption.routes.js';
import captchaRoutes from "./routes/captcha.routes.js";
import session from 'express-session';
import cors from "cors"

const app = express()

app.use(cors({
  origin: 'http://localhost:4200',
  credentials: true
}));

app.use(express.json()); 

app.use(session({
    name: 'renthem.sid',
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,

    cookie: {
        httpOnly: true,
        secure: false, // Local development only
        sameSite: 'lax',
        maxAge: 30 * 60 * 1000 // 30 minutes
    }
}));


app.get('/', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'RENTHEM API is running'
    });
});

app.use('/api/bookings', bookingRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/captcha', captchaRoutes);
app.use('/api/encryption', encryptionRoutes);

export default app