const express = require('express');
const router = express.Router();
const companySearchController = require('../controllers/companyQueryController');

// Route for search /api/v1/query/company/
router.get('/company', companySearchController.query);

// Route for /api/v1/query/company/:id
router.get('/company/:id', companySearchController.queryById);

// Route for /api/v1/query/company/autocomplete/:text
router.get('/company/autocomplete/:text', companySearchController.autocomplete);


module.exports = router;


// TODO: rate limiting thorugh redis