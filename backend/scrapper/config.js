require('dotenv').config();

module.exports = {
  // Scrapping config
  puppeteer : {
    MaxBrowsers: 1,
    MaxPagesPerBrowser: 10,
    TabTimeout: 10,
    headless: process.env.HEADLESS_PUPPETEER ? (process.env.HEADLESS_PUPPETEER.toLowerCase() === 'true' || process.env.HEADLESS_PUPPETEER === '1') : false,
    use_proxy: process.env.USEPROXY_PUPPETEER ? (process.env.USEPROXY_PUPPETEER.toLowerCase() === 'true' || process.env.USEPROXY_PUPPETEER === '1') : false,
  },
  proxy: {
    username: process.env.WEBSHARE_USERNAME,
    password: process.env.WEBSHARE_PASSWORD,
    proxyUrl: process.env.PROXY_URL,
  },

  // App Configuration
  app: {
    port: parseInt(process.env.SCRAPPER_PORT, 10) || 5000,
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
    WAIT_TIME_SECONDS: parseInt(process.env.WAIT_TIME_SECONDS || '20')
  },

  llm: {
    gemini: {
      MODEL_NAME: process.env.GEMINI_MODEL_NAME || "gemini-2.0-flash",
      API_KEY: process.env.GEMINI_API_KEY || "gemini_api_key",
    }
  }
};