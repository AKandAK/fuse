require('dotenv').config();

const config = {
  mongodb: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/fuse?authSource=admin',
  },

  // App Configuration
  app: {
    port: parseInt(process.env.PORT, 10) || 3000,
    env: process.env.NODE_ENV || 'development',
    constants : {
      summary_refresh_threshold_hrs: process.env.SUMMARY_REFRESH_THRESHOLD_HRS || 6 * 30 * 24, // 6 months
    }
  },
};

module.exports = config;
