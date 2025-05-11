require('dotenv').config();

const config = {
  mongodb: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/fuse?authSource=admin',
  },

  // App Configuration
  app: {
    port: parseInt(process.env.PORT, 10) || 4000,
    env: process.env.NODE_ENV || 'development',
    constants : {
      summary_refresh_threshold_hrs: process.env.SUMMARY_REFRESH_THRESHOLD_HRS || 6 * 30 * 24, // 6 months
    },
  },

  sqs: {
    SQS_URI: process.env.SQS_URI || 'http://localhost:9324', // ElasticMQ default
    SQS_REGION: process.env.SQS_REGION || 'us-west-1',
    SQS_ACCESS_KEY_ID: process.env.SQS_ACCESS_KEY_ID || 'dummy_access_key',
    SQS_SECRET_ACCESS_KEY: process.env.SQS_SECRET_ACCESS_KEY || 'dummy_secret_key',
    SCRAPPER_QUEUE: process.env.SCRAPPER_QUEUE || 'scrapper-queue',
  },

  cors: {
    ORIGINS: process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',') : ['http://localhost:3000', 'http://localhost:3001']
  },

  redis: {
    REDIS_URI: process.env.REDIS_URI || 'redis://localhost:6379',
    POOL_SIZE: parseInt(process.env.REDIS_POOL_SIZE) || 5
  },

  jwt: {
    SECRET: process.env.JWT_SECRET || 'secure-secret-key',
    EXPIRES_IN: process.env.JWT_EXPIRES_IN || '1h'
  },
};

module.exports = config;
