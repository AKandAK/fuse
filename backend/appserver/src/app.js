const express = require('express');
const cors = require('cors');
const logger = require('@backend/common/logger');
const v1Router = require('./api/v1');
const config = require('./config');
const { authMiddleware } = require('./middleware/auth');

const app = express();

// Middleware
app.use(cors({
  origin: config.cors.ORIGINS
}));

app.use(express.json());

// Request logging
app.use((req, res, next) => {
  logger.info('Incoming request', {
    method: req.method,
    path: req.path,
    ip: req.ip
  });
  next();
});

// Authentication middleware
app.use(authMiddleware);

// Routes
app.use('/api/v1', v1Router);

app.use((err, req, res, next) => {
  logger.error('Application error', {
    error: err.message,
    stack: err.stack,
    path: req.path
  });
  res.status(500).json({ error: 'Internal server error' });
});

app.get('/', (req, res) => {
  res.send('Hello Fuse');
});

module.exports = app;