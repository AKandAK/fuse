// db.js, central to all db operations

const logger = require('@backend/common/logger');
const mongoClient = require('../../data/mongoclient');
const mongoose = require('@backend/common/mongoose');

// Models
const Company = require('@backend/common/models/company');
const User = require('../models/user');
const UserBookmark = require('../models/UserBookmark');

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

async function getCompanyById(id, projection) {
  try {
    if (!id) {
      return null;
    }
    const result = await mongoClient.findOne(Company, { id: id }, projection);

    if (!result) {
      return null;
    }
    logger.info(`Successfully retrieved company by ID: ${id}`);
    return result;
  } catch (error) {
    logger.error('Error getCompanyById from db:', { 
      error: error.message, 
      stack: error.stack,
      companyId: id 
    });
    return null;
  }
}

async function getUserById(userId, projection) {
  try {
    if (!userId) {
      return null;
    }
    const _userId = new mongoose.Types.ObjectId(userId);
    const result = await mongoClient.findOne(User, { _id: _userId }, projection);

    if (!result) {
      return null;
    }
    logger.info(`Successfully retrieved user by userid: ${userId}`);
    return result;
  } catch (error) {
    logger.error('Error getUserById from db:', { 
      error: error.message, 
      stack: error.stack,
      companyId: userId
    });
    return null;
  }
}

// get user by email for auth, skip lean
async function getUserByEmailForAuth(email, projection = {}, options = {}) {
  try {
    email = email?.toLowerCase();
    const result = await mongoClient.findOne(User, { email: email }, projection, options, lean=false);

    if (!result) {
      return null;
    }
    logger.info(`Successfully retrieved user by email: ${email}`);
    return result;
  } catch (error) {
    logger.error('Error getUserByEmailForAuth from db:', { 
      error: error.message, 
      stack: error.stack,
      companyId: email
    });
    return null;
  }
}

async function getUserBookmarks(userId, page = 1, pageSize = 20, projection = {}, options = {}) {
  try {
    const _userId = new mongoose.Types.ObjectId(userId);
    const query = { user: _userId };

    // options to fetch company details
    const bookmarkOptions = {
      ...options,
      populate: options.populate ?
        (Array.isArray(options.populate) ? [...options.populate, 'company'] : [options.populate]) :
        'company',
      sort: options.sort || { createdAt: -1 } // Default sort by most recent bookmarks
    };

    let { results, total_count } = await mongoClient.getPaginatedResults(
      UserBookmark, query, page, pageSize, projection,
      bookmarkOptions // Pass updated options with populate
    );

    logger.info(`Successfully fetched ${results.length}/${total_count} user bookmarks for user: ${userId}.`);
    return { results, total_count };
  } catch (error) {
    logger.error('Error fetching user bookmarks:', { error: error.message, stack: error.stack, userId });
    throw error;
  }
}

async function insertUser(userData) {
  try {
    const createdUser = await mongoClient.insertOne(User, userData);
    logger.info('User created successfully', { userId: createdUser.id, email: createdUser.email });
    return createdUser;
  } catch (error) {
    logger.error('Error creating user', { error: error.message, stack: error.stack, userData });
    throw error;
  }
}

async function insertUserBookmark(userBookmarkData) {
  try {
    const createdBookmark = await mongoClient.insertOne(UserBookmark, userBookmarkData);
    logger.info('UserBookmark created successfully', { userId: createdBookmark.user, company: createdBookmark.company });
    return createdBookmark;
  } catch (error) {
    logger.error('Error insertUserBookmark', { error: error.message, stack: error.stack, userBookmarkData });
    throw error;
  }
}

async function deleteUserBookmark(userId, companyId) {
  try {
    const _companyId = new mongoose.Types.ObjectId(companyId);
    const _userId = new mongoose.Types.ObjectId(userId);
    const result = await UserBookmark.deleteOne({ user: _userId, company: _companyId });
    logger.info('User bookmark deleted successfully', { user: userId, company: companyId });
    return result;
  } catch (error) {
    logger.error('Error deleting user bookmark:', {
      error: error.message,
      stack: error.stack,
      userbookmark: { user: userId, company: companyId },
    });
    throw error;
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
  getCompanyById,
  getUserById,
  getUserByEmailForAuth,
  getUserBookmarks,
  insertUser,
  insertUserBookmark,
  deleteUserBookmark,
}