import { randomInt } from 'crypto';

export async function generateSecurePassword(length = 8) {
  const chars =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()-_=+[]{}|;:,.<>?';
  let password = '';
  for (let i = 0; i < length; i++) {
    const index = randomInt(chars.length);
    password += chars[index];
  }
  return password;
}
