import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config();

const SECRET = process.env.TOKEN_SECRET as string;

// This function is used to hash the password and salt
export const authentication = (salt: string, password: string) => {
  if (!SECRET) {
    throw new Error('No token secret found in environment variables.');
  }

  return crypto
    .createHmac('sha256', [salt, password].join('/'))
    .update(SECRET)
    .digest('hex');
};

export const random = () => crypto.randomBytes(128).toString('base64');
