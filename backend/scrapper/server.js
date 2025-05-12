const logger = require('@backend/common/logger');
const db = require('./services/db')
const scheduler = require('./browser/scheduler').getInstance();

async function startServer() {
    try {
        // start db
        await db.connectDB();

        // start the consumer
        const SQSConsumer = require('./services/consumer');
        const consumer = new SQSConsumer();
        consumer.start();

        // start browsers
        await scheduler.initializeBrowsers();
        console.log('browsers initialized')
    }
    catch (error) {
        logger.error(`Server start failed`, { 
            error: error.message, 
            stack: error.stack,
        });
    }
}

startServer();


// Graceful shutdown
process.on('SIGTERM', () => {
    consumer.stop();
    db.disconnectDB();
});
process.on('SIGINT', () => {
    consumer.stop(),
    db.disconnectDB();
});