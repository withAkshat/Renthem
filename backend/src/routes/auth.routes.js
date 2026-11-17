import express from "express"
import { login, register, getCurrentUser, logout } from "../controllers/auth.controller.js";
import {
    decryptRequest,
    encryptResponse
} from '../middlewares/encryption.middleware.js';

const router = express.Router();

router.post('/register', decryptRequest,
    encryptResponse, register);

router.post('/login', decryptRequest,
    encryptResponse, login);

router.post(
    '/me',
    decryptRequest,
    encryptResponse,
    getCurrentUser
);

router.post(
    '/logout',
    decryptRequest,
    encryptResponse,
    logout
);

export default router;