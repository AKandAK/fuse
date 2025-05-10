const { SQSClient, SendMessageBatchCommand } = require('@aws-sdk/client-sqs');
const config = require('../config');
const logger = require('../../../common/logger');

class Publisher {
  constructor() {
    this.sqs = new SQSClient({
      endpoint: config.sqs.SQS_URI,
      region: config.sqs.SQS_REGION || 'us-east-1',
      credentials: config.sqs.SQS_ACCESS_KEY_ID ? {
        accessKeyId: config.sqs.SQS_ACCESS_KEY_ID,
        secretAccessKey: config.sqs.SQS_SECRET_ACCESS_KEY
      } : undefined
    });

    this.buffer = new Map(); // Map of queue URLs to message arrays
    this.flushInterval = 1000; // 1 second buffer time
    this.flushTimer = null;
    this.queueUrls = {}; // Cache for queue URLs
  }

  async getQueueUrl(queueName) {
    if (this.queueUrls[queueName]) {
      return this.queueUrls[queueName];
    }

    // For local ElasticMQ, we can construct the URL directly
    if (config.sqs.SQS_URI.includes('localhost') || config.sqs.SQS_URI.includes('elasticmq')) {
      const queueUrl = `${config.sqs.SQS_URI}/queue/${queueName}`;
      this.queueUrls[queueName] = queueUrl;
      return queueUrl;
    }

    // For AWS SQS, we need to get the URL from AWS
    try {
      const { GetQueueUrlCommand } = require('@aws-sdk/client-sqs');
      const response = await this.sqs.send(new GetQueueUrlCommand({
        QueueName: queueName
      }));
      this.queueUrls[queueName] = response.QueueUrl;
      return response.QueueUrl;
    } catch (err) {
      logger.error('Failed to get queue URL', {
        queueName,
        error: err.message
      });
      throw err;
    }
  }

  async publish(queueName, message) {
    try {
      const queueUrl = await this.getQueueUrl(queueName);

      // Initialize buffer for queue if it doesn't exist
      if (!this.buffer.has(queueUrl)) {
        this.buffer.set(queueUrl, []);
      }

      // Add message to buffer
      this.buffer.get(queueUrl).push({
        Id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 8)}`,
        MessageBody: JSON.stringify(message)
      });

      // Start flush timer if not already running
      if (!this.flushTimer) {
        this.flushTimer = setTimeout(() => this.flushAll(), this.flushInterval);
      }

      logger.info('Message buffered', {
        queueName,
        message
      });
    } catch (err) {
      logger.error('Failed to buffer message', {
        queueName,
        error: err.message,
        stack: err.stack
      });
      throw err;
    }
  }

  async flushAll() {
    if (this.flushTimer) {
      clearTimeout(this.flushTimer);
      this.flushTimer = null;
    }

    if (this.buffer.size === 0) return;

    try {
      // Process each queue in the buffer
      for (const [queueUrl, messages] of this.buffer.entries()) {
        if (messages.length === 0) continue;

        // SQS has a maximum batch size of 10 messages
        const batchSize = 10;
        for (let i = 0; i < messages.length; i += batchSize) {
          const batch = messages.slice(i, i + batchSize);

          await this.sqs.send(new SendMessageBatchCommand({
            QueueUrl: queueUrl,
            Entries: batch
          }));

          logger.info(`Published ${batch.length} messages to queue ${queueUrl}`);
        }
      }

      // Clear the buffer
      this.buffer.clear();
    } catch (err) {
      logger.error('Failed to flush messages', {
        error: err.message,
        stack: err.stack
      });
      // Keep messages in buffer for retry
      throw err;
    }
  }

  async disconnect() {
    try {
      // Flush any remaining messages before disconnecting
      await this.flushAll();
      this.sqs.destroy();
      logger.info('SQS publisher disconnected');
    } catch (err) {
      logger.error('Failed to disconnect publisher', {
        error: err.message,
        stack: err.stack
      });
      throw err;
    }
  }
}

// Singleton instance
module.exports = new Publisher();