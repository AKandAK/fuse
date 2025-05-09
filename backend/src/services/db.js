// db.js, central to all db operations

const logger = require('../utils/logger');
const mongoClient = require('../mongoclient');

// Models
const Company = require('../models/company');

// functions

async function connectDB() {
  return await mongoClient.connect();
}

async function disconnectDB() {
  return await mongoClient.disconnect();
}

async function insertManyCompanies(companies) {
  try {
    const result = await mongoClient.insertMany(Company, companies);
    logger.info(`Successfully inserted ${result.length} companies.`);
    return result;
  } catch (error) {
    logger.error('Error inserting companies into MongoDB:', { error: error.message, stack: error.stack });
    // throw error;
  }
}


module.exports = {
  connectDB,
  disconnectDB,
  insertManyCompanies,
}