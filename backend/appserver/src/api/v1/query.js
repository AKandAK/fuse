const express = require('express');
const router = express.Router();
const companySearchController = require('../controllers/companyQueryController');

// Route for /api/v1/query/company/
router.get('/company', companySearchController);

module.exports = router;


// TODO: rate limiting thorugh redis