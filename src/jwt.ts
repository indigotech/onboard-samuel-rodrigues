import { sign, verify } from 'jsonwebtoken';

export function generateToken(id: string) {
  return sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });
}

export function verifyToken(token: string) {
  return verify(token, process.env.JWT_SECRET);
}
