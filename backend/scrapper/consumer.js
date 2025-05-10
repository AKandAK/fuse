const { SQSClient, ReceiveMessageCommand, DeleteMessageCommand, ChangeMessageVisibilityCommand }
  = require('@aws-sdk/client-sqs');
const config = require('./config');
const logger = require('../common/logger');
const processor = require('./processor');

class SQSConsumer {
  constructor() {
    this.initializeSQSClient();
    this.queueUrl = null;
    this.activeTasks = 0;
    this.maxConcurrentTasks = config.sqs.MAX_CONCURRENT_TASKS;
    this.isRunning = false;
    this.pollingInterval = 1000;
    this.errorRetryDelay = 5000;
  }

  initializeSQSClient() {
    const clientConfig = {
      endpoint: config.sqs.SQS_URI,
      region: config.sqs.SQS_REGION,
      credentials: {
        accessKeyId: config.sqs.SQS_ACCESS_KEY_ID,
        secretAccessKey: config.sqs.SQS_SECRET_ACCESS_KEY
      }
    };

    this.sqs = new SQSClient(clientConfig);

    // Add error listeners
    this.sqs.middlewareStack.add(
      (next) => async (args) => {
        try {
          return await next(args);
        } catch (err) {
          logger.error('SQS Client Error', {
            error: err.message,
            stack: err.stack
          });
          throw err;
        }
      },
      {
        step: 'initialize',
        name: 'sqsErrorLogger'
      }
    );
  }

  async getQueueUrl() {
    if (this.queueUrl) return this.queueUrl;

    try {
      // For local ElasticMQ
      if (config.sqs.SQS_URI.includes('localhost') ||
          config.sqs.SQS_URI.includes('elasticmq')) {
        this.queueUrl = `${config.sqs.SQS_URI}/queue/${config.sqs.SCRAPPER_QUEUE}`;
        return this.queueUrl;
      }

      // For AWS SQS
      const { GetQueueUrlCommand } = require('@aws-sdk/client-sqs');
      const response = await this.sqs.send(new GetQueueUrlCommand({
        QueueName: config.sqs.SCRAPPER_QUEUE
      }));
      this.queueUrl = response.QueueUrl;
      return this.queueUrl;
    } catch (err) {
      logger.error('Failed to get queue URL', {
        error: err.message,
        stack: err.stack
      });
      throw err;
    }
  }

  async start() {
    if (this.isRunning) return;

    try {
      await this.getQueueUrl();
      this.isRunning = true;
      this.poll();
      logger.info('SQS Consumer started successfully');
    } catch (err) {
      logger.error('Failed to start SQS Consumer', {
        error: err.message,
        stack: err.stack
      });
      setTimeout(() => this.start(), this.errorRetryDelay);
    }
  }

  async stop() {
    this.isRunning = false;
    logger.info('SQS Consumer stopped');
  }

  async poll() {
    while (this.isRunning) {
      try {
        if (this.activeTasks >= this.maxConcurrentTasks) {
          await this.delay(this.pollingInterval);
          continue;
        }

        const messages = await this.receiveMessages();
        if (messages.length > 0) {
          const numMessagesReceived = messages.length;
          this.activeTasks += numMessagesReceived; // Increment active tasks

          // Process messages concurrently, but decrement activeTasks once the batch is handled
          (async () => {
            try {
              await this.processMessages(messages);
            } catch (err) {
              logger.error('Batch message processing failed unexpectedly', {
                error: err.message,
                stack: err.stack
              });
            } finally {
              this.activeTasks -= numMessagesReceived; // Decrement after batch completes or fails
            }
          })();

        } else {
          await this.delay(this.pollingInterval);
        }
      } catch (err) {
        logger.error('Polling error', {
          name: err.name,
          message: err.message,
          stack: err.stack
        });
        await this.delay(this.errorRetryDelay);
      }
    }
  }

  async receiveMessages() {
    const messagesToFetch = Math.min(
      10, // SQS max messages per receive
      this.maxConcurrentTasks - this.activeTasks // Available slots for new tasks
    );

    const receiveParams = {
      QueueUrl: this.queueUrl,
      MaxNumberOfMessages: messagesToFetch,
      VisibilityTimeout: config.sqs.VISIBILITY_TIMEOUT,
      WaitTimeSeconds: config.sqs.WAIT_TIME_SECONDS, // Long polling
      AttributeNames: ['All'],
      MessageAttributeNames: ['All']
    };

    const data = await this.sqs.send(new ReceiveMessageCommand(receiveParams));
    return data.Messages || [];
  }

  async processMessages(messages) {
    await Promise.allSettled(
      messages.map(async message => {
        try {
          await processor.processMessage(message);
          await this.deleteMessage(message); // successfully processed
        } catch (err) {
          logger.error('Message processing failed', {
            messageId: message.MessageId,
            error: err.message
          });
          // retry based on ApproximateReceiveCount
          const receiveCount = parseInt(message.Attributes.ApproximateReceiveCount, 10);
          if (receiveCount >= 3) {
            logger.warn('Deleting message after 3 retries', { messageId: message.MessageId });
            await this.deleteMessage(message);
          } else {
            logger.info(`Retrying message (attempt ${receiveCount + 1})`, { messageId: message.MessageId });
            return this.extendVisibilityTimeout(message, 0); // retry msg for others
          }
        }
      })
    );
  }

  async deleteMessage(message) {
    try {
      await this.sqs.send(new DeleteMessageCommand({
        QueueUrl: this.queueUrl,
        ReceiptHandle: message.ReceiptHandle
      }));
    } catch (err) {
      logger.error('Failed to delete message', {
        messageId: message.MessageId,
        error: err.message
      });
      throw err;
    }
  }

  async extendVisibilityTimeout(message, timeout) {
    try {
      await this.sqs.send(new ChangeMessageVisibilityCommand({
        QueueUrl: this.queueUrl,
        ReceiptHandle: message.ReceiptHandle,
        VisibilityTimeout: timeout
      }));
    } catch (err) {
      logger.error('Failed to extend visibility timeout', {
        messageId: message.MessageId,
        error: err.message
      });
      throw err;
    }
  }

  async delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

module.exports = SQSConsumer;