const express = require('express');
const router = express.Router();
const companyDetailsController = require('../controllers/companySummaryController');

// Route for /api/v1/summary/company/
router.get('/company/:id', companyDetailsController);

module.exports = router;


// TODO: rate limiting thorugh redis