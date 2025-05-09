// db.js, central to all db operations

const logger = require('../utils/logger');
const mongoClient = require('../../data/mongoclient');

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

async function getPaginatedCompanyResults(query, page = 1, pageSize = 20, projection = {}, options = {}) {
  try {
    let { results, total_count } = await mongoClient.getPaginatedResults(Company, query, page, pageSize, projection, options);
    logger.info(`Successfully fetched ${results.length}/${total_count} companies.`);
    return { results, total_count };
  } catch (error) {
    logger.error('Error inserting companies into MongoDB:', { error: error.message, stack: error.stack });
    throw error;
  }
}

module.exports = {
  connectDB,
  disconnectDB,
  insertManyCompanies,
  getPaginatedCompanyResults,
}