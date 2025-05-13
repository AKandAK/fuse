const logger = require('@backend/common/logger');
const db = require('./services/db')
const scheduler = require('./browser/scheduler').getInstance();
const { scrapGoogleWebSourcesApi } = require('./browser/puppeteer')

const app = require('./app');
const config = require('./config')
const http = require('http');


const SQSConsumer = require('./services/consumer');
const consumer = new SQSConsumer();

const server = http.createServer(app);

async function startServer() {
    try {
        // start db
        await db.connectDB();

        // start the consumer
        consumer.start();

        // start browsers
        await scheduler.initializeBrowsers();
        console.log('browsers initialized')

        server.listen(config.app.port, () => {
            logger.info(`Server listening on port ${config.app.port} in ${config.app.env} mode`);
        });

        // test
        const scrapTask = {
            func: scrapGoogleWebSourcesApi,
            searchText: 'top fintechs in europe'
        };
        const result = await scheduler.enqueue(scrapTask)
        // clean response to json
        const websiteArray = extractWebsitesWithLogos(result);
        console.log(websiteArray)
    }
    catch (error) {
        logger.error(`Server start failed`, { 
            error: error.message, 
            stack: error.stack,
        });
    }
}

startServer();


const gracefulShutdown = async function() {
    logger.error('SIGTERM/SIGINT signal received: closing HTTP server');
    server.close(async () => {
        console.log('HTTP server closed');
        try {
            await db.disconnectDB();
            await scheduler.closeAllBrowsers();
            await consumer.stop()
        } catch (error) {
            logger.error('Error during cleanup:', {error: error});
        }
        process.exit(0);
    });
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);



function extractWebsitesWithLogos(content) {
    try {
        const pattern = /\bimage of ([a-zA-Z0-9]+)/g;

        let words = [];
        let match;
        
        while ((match = pattern.exec(content)) !== null) {
            words.push(match[1].toLowerCase() + ".com");
        }

        words = [...new Set(words)].sort();
        return words;
    } catch (error) {
        logger.error(`parsing content error extractWebsitesWithLogos`, { error: error });
        return []
    }
}