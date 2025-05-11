const logger = require('../common/logger');
const db = require('./services/db')
const config = require('./config')

async function processMessage(message) {
    try {
        const body = JSON.parse(message.Body)
        if (!await shouldProcess(body)) {
            logger.warn('ProcessMessage shouldprocess = false, skipping: ', body);
            return;
        }
        logger.info('Processing message', {
            messageId: message.MessageId,
            body: body,
        });

        const newSummary = 'A supernova is the colossal explosion of a star. Scientists have identified several types of supernova. One type, called a “core-collapse” supernova, occurs in the last stage in the life of massive stars that are at least eight times larger than our Sun. As these stars burn the fuel in their cores, they produce heat.'
        await db.updateSummary(body.id, newSummary);
    }
    catch(error) {
        logger.error(`processMessage failed`, { 
            error: error.message, 
            stack: error.stack,
            msg: message 
        });
    }
}

async function shouldProcess(body) {
    const result = await db.getLastSummaryUpdateTime(body.id);

    // better with inmemory rather than db
    const summaryThreshold = new Date();
    summaryThreshold.setHours(summaryThreshold.getHours() - config.app.constants.summary_refresh_threshold_hrs);
    
    if (!result || !result.summary_updated_at || new Date(result.summary_updated_at) < summaryThreshold)  {
        return true;
    }

    return false;
}


module.exports = {
    processMessage,
}