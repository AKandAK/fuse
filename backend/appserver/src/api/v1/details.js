const express = require('express');
const router = express.Router();
const companyDetailsController = require('../controllers/companyDetailsController');

// Route for /api/v1/details/company/
router.get('/company/:id', companyDetailsController);

module.exports = router;


// TODO: rate limiting thorugh redis