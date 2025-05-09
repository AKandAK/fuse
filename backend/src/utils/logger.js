const { createWriteStream } = require('fs');
const path = require('path');

// log to console and file
const logStream = createWriteStream(path.join(__dirname, '../..', 'backend.log'), { flags: 'a' });

const logger = {
  log: (level, message, metadata = {}) => {
    const logEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      ...metadata
    };
    logStream.write(JSON.stringify(logEntry) + '\n');
    console.log(logEntry)
    // TODO: comment last
  },

  warn: (message, meta) => logger.log('warn', message, meta),
  info: (message, meta) => logger.log('info', message, meta),
  error: (message, meta) => logger.log('error', message, meta),
};

module.exports = logger;