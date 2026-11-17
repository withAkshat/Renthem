import { log } from 'node:console';
import { verifyCaptcha } from '../services/captcha.services.js';
import session from "express-session"

export const register = (req, res) => {

    const {
        fullname,
        email,
        password
    } = req.decryptedData;

    log(req.decryptedData)

    return res.json({
        sucess: true,
        data: {
            fullname
        }
    });
}


// Dummy login
export const login = (req, res) => {

    const { email, password, captchaId, captchaAnswer } = req.decryptedData;
    // Verify CAPTCHA
    const isCaptchaValid = verifyCaptcha(captchaId, captchaAnswer);

    if (!isCaptchaValid) {
        return res.status(400).json({
            success: false,
            message: 'Invalid or expired CAPTCHA'
        });
    }

    let user;

    if (
        email === 'admin@renthem.com' &&
        password === 'Admin@123'
    ) {
        user = {
            id: 'admin-101',
            fullname: 'Admin',
            email,
            role: 'admin'
        };
    }
    else if (
        email === 'demo@renthem.com' &&
        password === 'Password123'
    ) {
        user = {
            id: 'user-101',
            fullname: 'Demo User',
            email,
            role: 'user'
        };
    }
    else {
        return res.status(401).json({
            success: false,
            message: 'Invalid email or password'
        });
    }

    // Regenerate session ID after login    
    req.session.regenerate(
        (error) => {

        if (error) {
            return res.status(500).json({
                success: false,
                message: 'Unable to create session'
            });
        }

       req.session.user = user;

        req.session.save((error) => {

            if (error) {
                return res.status(500).json({
                    success: false,
                    message: 'Unable to save session'
                });
            }

            return res.status(200).json({
                success: true,
                message: 'Login successful',
                user: req.session.user
            });
        });
    }
);

    
};


// Check current session
export const getCurrentUser = (req, res) => {

    if (!req.session.user) {
        return res.status(401).json({
            success: false,
            message: 'User is not authenticated'
        });
    }

    log(req.session.user)
    return res.status(200).json({
        success: true,
        message: 'Session is valid',
        user: req.session.user
    });
};


// Logout
export const logout = (req, res) => {

    req.session.destroy((error) => {

        if (error) {
            return res.status(500).json({
                success: false,
                message: 'Unable to logout'
            });
        }

        res.clearCookie('renthem.sid', {
            httpOnly: true,
            secure: false,
            sameSite: 'lax'
        });

        return res.status(200).json({
            success: true,
            message: 'Logout successful'
        });
    });
};
