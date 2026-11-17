
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Resolve private key path
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const privateKeyPath = path.join(
  __dirname,
  '../config/keys/private.pem'
);

// Load PC2 private key
const privateKey = fs.readFileSync(privateKeyPath, 'utf8');

class EncryptionService {

  // Convert Base64 into Buffer
  fromBase64(value) {
    if (
      typeof value !== 'string' ||
      !/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(value)
    ) {
      throw new Error('Invalid Base64 value');
    }

    return Buffer.from(value, 'base64');
  }

  // Decrypt AES key using RSA private key
  decryptAESKey(encryptedKey) {

    const encryptedBuffer = this.fromBase64(encryptedKey);

    const aesKey = crypto.privateDecrypt(
      {
        key: privateKey,
        padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
        oaepHash: 'sha256'
      },
      encryptedBuffer
    );

    if (aesKey.length !== 32) {
      throw new Error('Invalid AES-256 key length');
    }

    return aesKey;
  }

  // Decrypt incoming request from PC1
  decryptRequest(encryptedPayload) {

    const { encryptedKey, iv, ciphertext } = encryptedPayload;

    if (!encryptedKey || !iv || !ciphertext) {
      throw new Error('Incomplete encrypted payload');
    }

    const aesKey = this.decryptAESKey(encryptedKey);

    const ivBuffer = this.fromBase64(iv);
    const encryptedBuffer = this.fromBase64(ciphertext);

    if (ivBuffer.length !== 12 || encryptedBuffer.length < 16) {
      throw new Error('Invalid AES-GCM payload');
    }

    // Web Crypto appends the 16-byte authentication tag
    const authTag = encryptedBuffer.subarray(-16);
    const actualCiphertext = encryptedBuffer.subarray(0, -16);

    const decipher = crypto.createDecipheriv(
      'aes-256-gcm',
      aesKey,
      ivBuffer
    );

    decipher.setAuthTag(authTag);

    const decrypted = Buffer.concat([
      decipher.update(actualCiphertext),
      decipher.final()
    ]);

    return {
      data: JSON.parse(decrypted.toString('utf8')),
      aesKey
    };
  }

  // Encrypt response for PC1
  encryptResponse(data, aesKey) {

    const iv = crypto.randomBytes(12);

    const cipher = crypto.createCipheriv(
      'aes-256-gcm',
      aesKey,
      iv
    );

    const jsonData = Buffer.from(
      JSON.stringify(data),
      'utf8'
    );

    const encrypted = Buffer.concat([
      cipher.update(jsonData),
      cipher.final()
    ]);

    const authTag = cipher.getAuthTag();

    // Append authentication tag for Web Crypto compatibility
    const ciphertext = Buffer.concat([
      encrypted,
      authTag
    ]);

    return {
      iv: iv.toString('base64'),
      ciphertext: ciphertext.toString('base64')
    };
  }
}

export default new EncryptionService();
