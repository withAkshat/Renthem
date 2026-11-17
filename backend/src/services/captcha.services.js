import dotenv from "dotenv"
import svgCaptcha from 'svg-captcha';
import crypto from 'node:crypto';
dotenv.config()

const captchaStore = new Map();

const CAPTCHA_EXPIRY = 2 * 60 * 1000;

const CAPTCHA_SECRET = process.env.CAPTCHA_SECRET;

if (!CAPTCHA_SECRET) {
    throw new Error('CAPTCHA_SECRET is missing from environment variables');
}

const hashAnswer = (answer) => {
    return crypto
        .createHmac('sha256', CAPTCHA_SECRET)
        .update(answer.trim().toUpperCase())
        .digest();
};


// Generate CAPTCHA
export const createCaptcha = () => {

    // Remove expired challenges
    const now = Date.now();

    for (const [id, challenge] of captchaStore.entries()) {
        if (challenge.expiresAt <= now) {
            captchaStore.delete(id);
        }
    }

    const captcha = svgCaptcha.create({
        size: 5,
        noise: 3,
        color: true,
        background: '#f1eae4',
        ignoreChars: '0o1iIl'
    });

    const captchaId = crypto.randomUUID();

    captchaStore.set(captchaId, {
        answerHash: hashAnswer(captcha.text),
        expiresAt: now + CAPTCHA_EXPIRY
    });

    const image = `data:image/svg+xml;base64,${Buffer.from(captcha.data).toString('base64')
        }`;

    return {
        success: true,
        captchaId,
        image
    };
};

// Verify CAPTCHA
export const verifyCaptcha = (captchaId, userAnswer) => {

    const challenge = captchaStore.get(captchaId);

    if (!challenge) {
        return false;
    }

    // Delete immediately: CAPTCHA is single-use.
    captchaStore.delete(captchaId);

    if (challenge.expiresAt <= Date.now()) {
        return false;
    }

    if (typeof userAnswer !== 'string') {
        return false;
    }

    const expectedHash = challenge.answerHash;
    const receivedHash = hashAnswer(userAnswer);

    return crypto.timingSafeEqual(expectedHash, receivedHash);
};