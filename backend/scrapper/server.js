const logger = require('../common/logger');
const db = require('./services/db')

async function startServer() {
    try {
        // start db
        await db.connectDB();

        // Start the consumer
        const SQSConsumer = require('./services/consumer');
        const consumer = new SQSConsumer();
        consumer.start();

    }
    catch (error) {
        logger.error(`Server start failed`, { 
            error: error.message, 
            stack: error.stack,
            companyId: id 
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