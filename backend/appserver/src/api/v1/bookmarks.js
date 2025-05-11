const express = require('express');
const router = express.Router();
const bookmarkController = require('../controllers/bookmarkController');
const { body, param } = require('express-validator');

// Route to get bookmarks by email
router.post(
  '/',
  [
  ],
  bookmarkController.getBookmarksByUser
);

// Route for /api/v1/bookmarks/create
router.post(
  '/create',
  [
    body('companyId').notEmpty().withMessage('companyId is required'),
  ],
  bookmarkController.createBookmark
);

// Route for /api/v1/bookmarks/delete/:companyId
router.delete(
  '/delete/:companyId',
  [
    param('companyId').notEmpty().withMessage('companyId is required'),
  ],
  bookmarkController.deleteBookmark
);

module.exports = router;


// TODO: rate limiting thorugh redis