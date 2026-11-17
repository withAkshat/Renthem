
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const publicKeyPath = path.join(
  __dirname,
  '../config/keys/public.pem'
);

// GET /api/encryption/public-key
export const getPublicKey = (req, res) => {

  try {

    const publicKey = fs.readFileSync(
      publicKeyPath,
      'utf8'
    );

    return res.status(200).json({
      success: true,
      publicKey
    });

  } catch (error) {

    console.error('Public key loading failed:', error.message);

    return res.status(500).json({
      success: false,
      message: 'Unable to retrieve encryption public key'
    });

  }
};
