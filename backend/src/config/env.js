import dotenv from 'dotenv';

dotenv.config();

export const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: Number(process.env.PORT || 5000),
  MONGODB_URI: process.env.MONGODB_URI || '',
  MONGODB_URI_FALLBACK: process.env.MONGODB_URI_FALLBACK || '',
  API_NINJAS_KEY: process.env.API_NINJAS_KEY || '',
  API_NINJAS_BASE_URL: process.env.API_NINJAS_BASE_URL || 'https://api.api-ninjas.com',
  JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET || '',
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || '',
  CLIENT_ORIGIN: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
  USDA_API_KEY: process.env.USDA_API_KEY || '',
};
