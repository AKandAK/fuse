const http = require('http');
const app = require('./src/app');
const config = require('./src/config');
const dbclient = require('./src/services/db');
const logger = require('@backend/common/logger');

const server = http.createServer(app);

async function startServer() {
  try {
    await dbclient.connectDB();
    logger.info('Database connection established');

    server.listen(config.app.port, () => {
      logger.info(`Server listening on port ${config.app.port} in ${config.app.env} mode`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

const gracefulShutdown = function() {
  console.log('SIGTERM/SIGINT signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    dbclient.disconnectDB();

    process.exit(0);
  });
}

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);
