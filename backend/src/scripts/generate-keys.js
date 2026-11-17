
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Get current file directory in ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Your key directory
const keysDir = path.join(__dirname, '../config/keys');

fs.mkdirSync(keysDir, { recursive: true });

const privatePath = path.join(keysDir, 'private.pem');
const publicPath = path.join(keysDir, 'public.pem');

// Avoid accidentally replacing existing keys
if (fs.existsSync(privatePath) || fs.existsSync(publicPath)) {
  throw new Error(
    'RSA keys already exist. Refusing to overwrite them.'
  );
}

// Generate RSA key pair
const { publicKey, privateKey } = crypto.generateKeyPairSync(
  'rsa',
  {
    modulusLength: 2048,

    publicKeyEncoding: {
      type: 'spki',
      format: 'pem'
    },

    privateKeyEncoding: {
      type: 'pkcs8',
      format: 'pem'
    }
  }
);

// Save keys
fs.writeFileSync(privatePath, privateKey);
fs.writeFileSync(publicPath, publicKey);

console.log('RSA key pair generated successfully!');
