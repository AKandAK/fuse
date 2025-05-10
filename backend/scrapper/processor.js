const logger = require('../common/logger');

async function processMessage(message) {
    logger.info('Processing message', {
        messageId: message.MessageId,
        body: message.Body
    });
}

module.exports = {
    processMessage,
}