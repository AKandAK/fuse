const express = require('express');
const router = express.Router();
const publicApisController = require('../controllers/publicApisController');

// Route for /api/v1/public/filters/company
router.get('/filters/company', publicApisController.getCompanyFilters);

module.exports = router;


// TODO: rate limiting thorugh redis