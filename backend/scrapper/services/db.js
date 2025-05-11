// db.js, central to all db operations

const logger = require('../../common/logger');
const mongoClient = require('./mongoclient');

// Models
const Company = require('../../common/models/company');

// functions

async function connectDB() {
  return await mongoClient.connect();
}

async function disconnectDB() {
  return await mongoClient.disconnect();
}

async function getLastSummaryUpdateTime(id) {
  // better with in memory store rather than db
  try {
    const query = { id: id };
    const projection = {
      _id: 0,
      summary_updated_at: 1
    };
    const result = await mongoClient.findOne(Company, query, projection)

    return result;
  } catch (error) {
    logger.error('error in getLastSummaryUpdateTime:', {
      error: error.message,
      stack: error.stack,
      id
    });
    return null;
  }
}
async function updateSummary(id, newSummary) {
  try {
    const query = { id: id };
    const updateData = {
      summary: newSummary,
      summary_updated_at: new Date(),
    };

    const result = await mongoClient.updateOne(Company, query, updateData)

    if (result.modifiedCount === 0) {
      logger.warn('summary didnt update:', id);
    } else {
      logger.info(`updateSummary successful: ${id}`);
    }

    return result;
  } catch (error) {
    logger.error('error in updateSummary:', {
      error: error.message,
      stack: error.stack,
      id
    });
  }
}


module.exports = {
    connectDB,
    disconnectDB,
    updateSummary,
    getLastSummaryUpdateTime,
}