import { JwtPayload, sign, verify } from 'jsonwebtoken';

export function generateToken(id: string, extendedExpirationTime: boolean) {
  const expiresIn = extendedExpirationTime ? process.env.JWT_EXTENDED_EXPIRATION_TIME : process.env.JWT_EXPIRES_IN;
  return sign({ id }, process.env.JWT_SECRET, { expiresIn });
}

export function verifyToken(token: string): JwtPayload {
  return verify(token, process.env.JWT_SECRET) as { payload: string };
}
