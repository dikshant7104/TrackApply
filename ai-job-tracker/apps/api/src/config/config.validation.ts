import * as Joi from 'joi';

export const configValidationSchema = Joi.object({
  NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
  PORT: Joi.number().default(3001),
  DATABASE_URL: Joi.string().required(),
  REDIS_HOST: Joi.string().default('localhost'),
  REDIS_PORT: Joi.number().default(6379),
  REDIS_PASSWORD: Joi.string().allow('').optional(),
  JWT_SECRET: Joi.string().min(32).required(),
  JWT_EXPIRES_IN: Joi.string().default('15m'),
  JWT_REFRESH_SECRET: Joi.string().min(32).required(),
  JWT_REFRESH_EXPIRES_IN: Joi.string().default('7d'),
  FRONTEND_URL: Joi.string().default('http://localhost:5173'),
  OPENAI_API_KEY: Joi.string().optional().allow(''),
  OPENAI_MODEL: Joi.string().default('gpt-4o'),
  UPLOAD_DIR: Joi.string().default('./uploads'),
  MAX_FILE_SIZE: Joi.number().default(5242880), // 5MB
});
