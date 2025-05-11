require('dotenv').config();


module.exports = {
  // App Configuration
  app: {
    port: parseInt(process.env.PORT, 10) || 4000,
    env: process.env.NODE_ENV || 'development',
    constants : {
      summary_refresh_threshold_hrs: process.env.SUMMARY_REFRESH_THRESHOLD_HRS || 6 * 30 * 24, // 6 months
    },
  },
  
  mongodb: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/fuse?authSource=admin',
  },
  
  sqs: {
    SQS_URI: process.env.SQS_URI || 'http://localhost:9324', // ElasticMQ default
    SQS_REGION: process.env.SQS_REGION || 'us-west-1',
    SQS_ACCESS_KEY_ID: process.env.SQS_ACCESS_KEY_ID || 'dummy_access_key',
    SQS_SECRET_ACCESS_KEY: process.env.SQS_SECRET_ACCESS_KEY || 'dummy_secret_key',
    SCRAPPER_QUEUE: process.env.SCRAPPER_QUEUE || 'scrapper-queue',
    MAX_CONCURRENT_TASKS: parseInt(process.env.MAX_CONCURRENT_TASKS || '3'), // read and process 3 msgs/tasks at max concurrently
    VISIBILITY_TIMEOUT: parseInt(process.env.VISIBILITY_TIMEOUT || '180'), // 3 minutes in seconds
    WAIT_TIME_SECONDS: parseInt(process.env.WAIT_TIME_SECONDS || '20') // Long polling
  }
};