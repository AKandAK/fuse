const express = require('express');
const router = express.Router();
const bookmarkController = require('../controllers/bookmarkController');
const { body, param } = require('express-validator');

// Route to get bookmarks by email
router.post(
  '/',
  [
    body('user').notEmpty().withMessage('user is required'),
    body('user').isMongoId().withMessage('Invalid user'),
  ],
  bookmarkController.getBookmarksByUser
);

// Route for /api/v1/bookmark/create
router.post(
  '/create',
  [
    body('user').notEmpty().withMessage('user is required'),
    body('companyId').notEmpty().withMessage('companyId is required'),
    body('user').isMongoId().withMessage('Invalid user'),
  ],
  bookmarkController.createBookmark
);

// Route for /api/v1/bookmark/delete
router.delete(
  '/delete/:id',
  [
    param('id').isMongoId().withMessage('Invalid Bookmark ID'), // Validate ID as MongoDB ObjectId
  ],
  bookmarkController.deleteBookmark
);

module.exports = router;


// TODO: rate limiting thorugh redis