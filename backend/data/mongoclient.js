// mongoClient.js
const config = require('../src/config')
const mongoose = require('mongoose');
const logger = require('../src/utils/logger');

class MongoDBClient {
  constructor() {
    if (MongoDBClient.instance) {
      return MongoDBClient.instance;
    }
    this.dbConnection = null;
    MongoDBClient.instance = this;
  }

  async connect() {
    if (this._isMongoConnected()) {
      return this.dbConnection;
    }

    const uri = config.mongodb.uri;
    try {
      this.dbConnection = await mongoose.connect(uri, {
        minPoolSize: 1,
        maxPoolSize: 10,
        socketTimeoutMS: 30000,
        serverSelectionTimeoutMS: 5000,
      });
      logger.info(`Connected to MongoDB`);
      return this.dbConnection;
    } catch (err) {
      logger.error('MongoDB connection failed', { error: err.message });
      throw err;
    }
  }

  _isMongoConnected() {
    return this.dbConnection?.connection && this.dbConnection.connection.readyState === 1;
  }

  async insertMany(model, documents) {
    if (!this._isMongoConnected()) {
      throw new Error('MongoDB not connected insertMany');
    }
    if (!model || typeof model.insertMany !== 'function') {
      throw new Error('Invalid Mongoose Model provided insertMany.');
    }
    try {
      const result = await model.insertMany(documents, { ordered: false });
      return result;
    } catch (err) {
      logger.error('insertMany failed', {
        modelName: model ? model.modelName : 'unknown',
        error: err.message,
        failedDocs: err.writeErrors?.length
      });
      throw err;
    }
  }

  async insertOne(model, document) {
    if (!this._isMongoConnected()) {
      throw new Error('MongoDB not connected insertOne');
    }
    if (!model || typeof model.create !== 'function') {
      throw new Error('Invalid Mongoose Model provided insertOne.');
    }
    try {
      const result = await model.create(document);
      return result;
    } catch (err) {
      logger.error('mongoclient insertOne failed', {
        modelName: model ? model.modelName : 'unknown',
        error: err.message,
        doc: document
      });
      throw err;
    }
  }

  async getPaginatedResults(
    model, 
    query, 
    page = 1, 
    pageSize = 20, 
    projection = {}, 
    options = {}
  ) {
    try {
      const queryBuilder = model.find(query, projection);
      
      if (options.sort) {
        queryBuilder.sort(options.sort);
      }
      
      // Execute query with pagination
      const results = await queryBuilder
        .skip((page - 1) * pageSize)
        .limit(pageSize)
        .lean();
      
      const total_count = await model.countDocuments(query);
      
      return { 
        results,
        total_count
      };
      
    } catch (error) {
      logger.error('mongoclient getPaginatedResults error', {
        modelName: model?.modelName || 'unknown',
        error: error.message,
        query,
        options
      });
      throw error;
    }
  }

  async disconnect() {
    if (this.dbConnection?.connection && (this.dbConnection.connection.readyState === 1 || this.dbConnection.connection.readyState === 2)) {
      await mongoose.disconnect();
      this.dbConnection = null;
      logger.info('MongoDB connection closed');
    } else {
      logger.warn('MongoDB not connected or already disconnected');
    }
  }
}

module.exports = new MongoDBClient();