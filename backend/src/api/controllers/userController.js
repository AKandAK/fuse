const logger = require('../../utils/logger');
const dbclient = require('../../services/db');
const { validationResult } = require('express-validator'); // For input validation


async function createUser(req, res) {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const { email, username, ..._rem } = req.body;

        const newUser = {
            email: email.toLowerCase(),
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

module.exports = {
    createUser,
};