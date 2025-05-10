const jwt = require('jsonwebtoken');
const config = require('../config');
const logger = require('../../../common/logger');
const dbclient = require('../services/db');

const authMiddleware = async (req, res, next) => {
  const publicRoutes = [
    '/api/v1/user/create',
    '/api/v1/user/login',
    '/home',
    '/',
  ];

  if (publicRoutes.includes(req.path)) {
    return next();
  }

  // get token from header
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    logger.warn('Unauthorized access - no token provided', {
      path: req.path,
      ip: req.ip
    });
    return res.status(401).json({ error: 'Unauthorized - no token provided' });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, config.jwt.SECRET);
    
    // Fetch user from DB
    const user = await dbclient.getUserById(decoded.sub);
    if (!user) {
      throw new Error('User not found');
    }

    // Attach user to request
    req.user = user;
    next();
  } catch (err) {
    logger.warn('Unauthorized access - invalid token', {
      path: req.path,
      ip: req.ip,
      error: err.message
    });
    return res.status(403).json({ error: 'Unauthorized - invalid token' });
  }
};

module.exports = { authMiddleware };