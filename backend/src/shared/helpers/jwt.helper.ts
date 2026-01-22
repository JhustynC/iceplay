import jwt from 'jsonwebtoken';
import { envs } from '../../config/plugins/envs/envs.plugin';

interface JwtPayload {
  id: string;
  email: string;
  role: string;
  organizationId?: string;
}

export class JwtHelper {
  static generateToken(payload: JwtPayload): string {
    return jwt.sign(payload, envs.JWT_SECRET, {
      expiresIn: envs.JWT_EXPIRES_IN,
    });
  }

  static verifyToken(token: string): JwtPayload {
    return jwt.verify(token, envs.JWT_SECRET) as JwtPayload;
  }
}
