// mongoClient.js
const config = require('../config')
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

  async updateOne(model, query, updateData, options = {}) {
    if (!this._isMongoConnected()) {
      // await this.connect();
      // if (!this._isMongoConnected())
      throw new Error('MongoDB not connected updateOne');
    }
    if (!model || typeof model.updateOne !== 'function') {
      throw new Error('Invalid Mongoose Model provided updateOne.');
    }
    try {
      const result = await model.updateOne(query, { $set: updateData }, options);
      return result;
    } catch (err) {
      logger.error('mongoclient updateOne failed', {
        modelName: model?.modelName || 'unknown',
        error: err.message,
        query,
        updateData
      });
      throw err;
    }
  }

  async findOne(model, query, projection = {}, options = {}) {
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