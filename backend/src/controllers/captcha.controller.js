import { createCaptcha } from "../services/captcha.services.js"

export const generateCaptcha = (req, res) => {
    try {
        
        const captcha = createCaptcha();

        return res.status(200).json(captcha);

    } catch (error) {

        console.error('CAPTCHA generation error:', error);

        return res.status(500).json({
            success: false,
            message: 'Unable to generate CAPTCHA'
        });
    }
}

