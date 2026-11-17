import express from "express"
import { login, register, getCurrentUser, logout     } from "../controllers/auth.controller.js";

const router = express.Router();

router.post('/register', register);

router.post('/login', login);

router.get('/me', getCurrentUser);

router.post('/logout', logout);

export default router;