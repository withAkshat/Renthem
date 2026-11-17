
import encryptionService from '../services/encryption.service.js';

export const decryptRequest = (req, res, next) => {
  try {

    const { data, aesKey } =
      encryptionService.decryptRequest(req.body);

    req.decryptedData = data;
    req.aesKey = aesKey;

    next();

  } catch (error) {

    console.error('Request decryption failed:', error.message);

    return res.status(400).json({
      success: false,
      message: 'Invalid encrypted request'
    });

  }
};

export const encryptResponse = (req, res, next) => {

  const originalJson = res.json.bind(res);

  res.json = (data) => {

    try {

      const encrypted =
        encryptionService.encryptResponse(data, req.aesKey);

      return originalJson(encrypted);

    } catch (error) {

      console.error('Response encryption failed:', error.message);

      return res.status(500).end();

    }
  };

  next();
};
