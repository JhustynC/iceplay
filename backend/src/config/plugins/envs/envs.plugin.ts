import 'dotenv/config';
import { get } from 'env-var';

export const envs = {
  PORT: get('PORT').required().asPortNumber(),
  NODE_ENV: get('NODE_ENV').default('development').asString(),
  MONGO_URL: get('MONGO_URL').required().asString(),
  JWT_SECRET: get('JWT_SECRET').required().asString(),
  JWT_EXPIRES_IN: get('JWT_EXPIRES_IN').default('7d').asString(),
  CORS_ORIGIN: get('CORS_ORIGIN').default('http://localhost:4200').asString(),
};
