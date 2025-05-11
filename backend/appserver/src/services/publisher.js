const { SQSClient, SendMessageBatchCommand } = require('@aws-sdk/client-sqs');
const config = require('../config');
const logger = require('../../../common/logger');

class Publisher {
  constructor() {
    this.sqs = new SQSClient({
      endpoint: config.sqs.SQS_URI,
      region: config.sqs.SQS_REGION,
      credentials: config.sqs.SQS_ACCESS_KEY_ID ? {
        accessKeyId: config.sqs.SQS_ACCESS_KEY_ID,
        secretAccessKey: config.sqs.SQS_SECRET_ACCESS_KEY
      } : undefined
    });

    this.buffer = new Map(); // queue url => msgs array
    this.flushInterval = 1000; // 1 second buffer time
    this.flushTimer = null;
    this.queueUrls = {}; // Cache for queue URLs
  }

  async getQueueUrl(queueName) {
    if (this.queueUrls[queueName]) {
      return this.queueUrls[queueName];
    }

    //  local elasticmq
    if (config.sqs.SQS_URI.includes('localhost') || config.sqs.SQS_URI.includes('elasticmq')) {
      const queueUrl = `${config.sqs.SQS_URI}/queue/${queueName}`;
      this.queueUrls[queueName] = queueUrl;
      return queueUrl;
    }

    // aws sqs
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

      // initialize buffer for queue
      if (!this.buffer.has(queueUrl)) {
        this.buffer.set(queueUrl, []);
      }

      this.buffer.get(queueUrl).push({
        Id: `msg_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`,
        MessageBody: JSON.stringify(message)
      });

      // flush timer
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
      for (const [queueUrl, messages] of this.buffer.entries()) {
        if (messages.length === 0) continue;

        // max sqs batchsize is 10 as well
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

      this.buffer.clear();
    } catch (err) {
      logger.error('Failed to flush messages', {
        error: err.message,
        stack: err.stack
      });
      // todo: clear messages in buffer
      throw err;
    }
  }

  async disconnect() {
    try {
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

// singleton
module.exports = new Publisher();