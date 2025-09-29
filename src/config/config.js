// src/config/config.js (ví dụ đường dẫn file này)
// bạn đang dùng require() nên đây là CJS

const path = require('path');
const dotenv = require('dotenv');
const Joi = require('joi');

// 1) Nạp .env chung trước (base)
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// 2) Nạp .env theo NODE_ENV để GHI ĐÈ
const MODE = process.env.NODE_ENV || 'development';
const modeFile = `.env.${MODE}`; // .env.development | .env.production | .env.test
dotenv.config({ path: path.resolve(__dirname, '../../', modeFile) });

// (tuỳ chọn) cho phép override cục bộ trên máy dev
dotenv.config({ path: path.resolve(__dirname, '../../', `${modeFile}.local`) });

const envVarsSchema = Joi.object()
  .keys({
    NODE_ENV: Joi.string().valid('production', 'development', 'test').required(),
    PORT: Joi.number().default(3000),
    HOST: Joi.string().default('0.0.0.0'),
    MONGODB_URL: Joi.string().required().description('Mongo DB url'),
    JWT_SECRET: Joi.string().required().description('JWT secret key'),
    JWT_ACCESS_EXPIRATION_MINUTES: Joi.number().default(30),
    JWT_REFRESH_EXPIRATION_DAYS: Joi.number().default(30),
    JWT_RESET_PASSWORD_EXPIRATION_MINUTES: Joi.number().default(10),
    JWT_VERIFY_EMAIL_EXPIRATION_MINUTES: Joi.number().default(10),
    SMTP_HOST: Joi.string().allow('', null),
    SMTP_PORT: Joi.number().allow(null),
    SMTP_USERNAME: Joi.string().allow('', null),
    SMTP_PASSWORD: Joi.string().allow('', null),
    EMAIL_FROM: Joi.string().allow('', null),
  })
  .unknown();

const { value: envVars, error } = envVarsSchema.prefs({ errors: { label: 'key' } }).validate(process.env);

if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

module.exports = {
  env: envVars.NODE_ENV,
  port: envVars.PORT,
  host: envVars.HOST,
  mongoose: {
    url: envVars.MONGODB_URL + (envVars.NODE_ENV === 'test' ? '-test' : ''),
    options: {
      useCreateIndex: true,
      useNewUrlParser: true,
      useUnifiedTopology: true,
    },
  },
  jwt: {
    secret: envVars.JWT_SECRET,
    accessExpirationMinutes: envVars.JWT_ACCESS_EXPIRATION_MINUTES,
    refreshExpirationDays: envVars.JWT_REFRESH_EXPIRATION_DAYS,
    resetPasswordExpirationMinutes: envVars.JWT_RESET_PASSWORD_EXPIRATION_MINUTES,
    verifyEmailExpirationMinutes: envVars.JWT_VERIFY_EMAIL_EXPIRATION_MINUTES,
  },
  email: {
    smtp: {
      host: envVars.SMTP_HOST,
      port: envVars.SMTP_PORT,
      auth: {
        user: envVars.SMTP_USERNAME,
        pass: envVars.SMTP_PASSWORD,
      },
    },
    from: envVars.EMAIL_FROM,
  },
};
