const logger = require('@backend/common/logger');
const dbclient = require('../../services/db');
const { validationResult } = require('express-validator'); // For input validation
const jwt = require('jsonwebtoken');
const config = require('../../config')

async function createUser(req, res) {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const { email, password, username, ..._rem } = req.body;

        // check if email already exists
        const user = await dbclient.getUserByEmailForAuth(email, {_id: 1});
        if (user) {
            return res.status(400).json({ message: 'User already exists' });
        }
        const newUser = {
            email: email.toLowerCase(),
            password: password.trim(),
        };

        const createdUser = await dbclient.insertUser(newUser);
        res.status(201).json({ 
            email: createdUser.email,
        });

    } catch (error) {
        logger.error('Error while creating user createUser:', error);
        res.status(500).json({ 
            message: 'Failed to create user',
        });
    }
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  try {
    const user = await dbclient.getUserByEmailForAuth(email);
    if (!user) {
      logger.warn('Login failed - user not found', { email });
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const passwordMatch = await user.comparePassword(password);
    if (!passwordMatch) {
      logger.warn('Login failed - incorrect password', { email });
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // create JWT token
    const token = jwt.sign(
      {
        sub: user._id.toString(),
        email: user.email,
        role: user.role || 'user'
      },
      config.jwt.SECRET,
      { expiresIn: config.jwt.EXPIRES_IN || '1h' }
    );

    // res.cookie('token', token, {
    //   httpOnly: true,
    //   secure: process.env.NODE_ENV === 'production',
    //   maxAge: 1000 * 60 * 60, // 1 hour
    //   sameSite: 'strict'
    // });

    logger.info(`Login successful for user: ${user.email}`);
    res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    });

  } catch (error) {
    logger.error('Login error', { error, email });
    res.status(500).json({ message: 'Login failed', error: error.message });
  }
};

module.exports = {
    createUser,
    loginUser,
};