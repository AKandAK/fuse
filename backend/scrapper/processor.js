const logger = require('@backend/common/logger');
const db = require('./services/db')
const config = require('./config')
const scheduler = require('./browser/scheduler').getInstance()
const llm = require('./services/llm')

async function processMessage(message) {
    try {
        const body = JSON.parse(message.Body)
        if (!await shouldProcess(body)) {
            logger.warn('ProcessMessage shouldprocess = false, skipping: ', body);
            return;
        }
        
        let url = body.website || body.linkedin_url;
        if (url) {
            url = url.startsWith('http') ? url : `https://${url}`
        }

        // TODO: a simple api call could also work for websites
        // linked api could give results as well
        // firecrawl can handle similar processing

        const result = await scheduler.enqueue(url);
        const cleanedResult = cleanWebsiteContent(result);
        if (cleanedResult && cleanedResult.length > 100) {
            const llmSummary = await llm.getSummaryOfWebsite(cleanedResult)
            await db.updateSummary(body.id, llmSummary);
            logger.info('Summary updated', {
                messageId: message.MessageId,
                body: body,
            });
        }
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

function cleanWebsiteContent(textContent) {
  if (!textContent) return ''
  // remove multi spacing, new lines
  textContent = textContent.split(/\r\n|\r|\n/).filter(line => line.trim() !== "").join(". ");

  textContent = textContent.replace(/\s{2,}/g, ".");
  return textContent.trim();
}

module.exports = {
    processMessage,
}