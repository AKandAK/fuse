// mongoClient.js
require('dotenv').config();

const mongoose = require('mongoose');
const logger = require('../utils/logger');

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

    const uri = process.env.MONGODB_URI;
    if (!uri) {
      logger.error('MongoDB connection failed: URI missing');
      throw error;
    }

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
      logger.error('insertOne failed', {
        modelName: model ? model.modelName : 'unknown',
        error: err.message,
        doc: document
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