const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { body } = require('express-validator');

// Route for /api/v1/user/create
router.post(
  '/create',
  [
    // Validation rules for the request body
    body('email').isEmail().withMessage('Invalid email address'),
  ],
  userController.createUser
);

module.exports = router;


// TODO: rate limiting thorugh redis