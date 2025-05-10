const logger = require('../common/logger');

// Start the consumer
const SQSConsumer = require('./consumer');
const consumer = new SQSConsumer();

consumer.start();

// Graceful shutdown
process.on('SIGTERM', () => consumer.stop());
process.on('SIGINT', () => consumer.stop());