import { JwtPayload, sign, verify } from 'jsonwebtoken';

export function generateToken(id: string): string {
  return sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });
}

export function verifyToken(token: string): JwtPayload {
  return verify(token, process.env.JWT_SECRET) as { payload: string };
}
