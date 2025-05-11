// mongoClient.js
const config = require('../src/config')
const mongoose = require('../../common/mongoose');
const logger = require('../../common/logger');

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

  async deleteOne(model, query) {
    if (!this._isMongoConnected()) {
      throw new Error('MongoDB not connected deleteOne');
    }
    if (!model || typeof model.create !== 'function') {
      throw new Error('Invalid Mongoose Model provided deleteOne.');
    }
    try {
      const result = await model.deleteOne(query);
      logger.info(`Successfully deleted document(s) from ${model.modelName} with query: ${JSON.stringify(query)}`);
      return result;
    } catch (error) {
      logger.error(`Error deleting document(s) from ${model.modelName} with query: ${JSON.stringify(query)}:`, {
          error: error.message,
          stack: error.stack,
          query
      });
      throw error;
    }
  }

  async findOne(model, query, projection = {}, options = {}, lean = true) {
    if (!this._isMongoConnected()) {
      throw new Error('MongoDB not connected in findOne');
    }
    if (!model || typeof model.findOne !== 'function') {
      throw new Error('Invalid Mongoose Model provided in findOne');
    }
    if (!query || typeof query !== 'object') {
      throw new Error('Invalid query object provided in findOne');
    }
    try {
      if (!lean) {
        return await model.findOne(query, projection, options);
      }
      const result = await model.findOne(query, projection, options).lean();
      return result;
      
    } catch (err) {
      logger.error('mongoclient findOne failed', {
        modelName: model?.modelName || 'unknown',
        error: err.message,
        query: query,
        projection: projection,
        options: options
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

      // If populate is requested in options
      if (options.populate) {
        if (Array.isArray(options.populate)) {
          options.populate.forEach(path => queryBuilder.populate(path));
        } else {
          queryBuilder.populate(options.populate);
        }
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