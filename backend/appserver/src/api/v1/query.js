const express = require('express');
const router = express.Router();
const companySearchController = require('../controllers/companyQueryController');
const advancedTextSearchController = require('../controllers/advancedTextSearchController');

// Route for search /api/v1/query/company/simple_search/:query
router.get('/company/simple_search', companySearchController.simpleTextSearch);

// Route for search /api/v1/query/open_text_search/:query
router.get('/company/open_text_search', companySearchController.openTextSearch);

// Route for search /api/v1/query/company/advanced_text_search/:query
router.get('/company/advanced_text_search', advancedTextSearchController.advancedTextSearch);

// Route for /api/v1/query/company/:id
router.get('/company/:id', companySearchController.queryById);

// Route for /api/v1/query/company/autocomplete/:text
router.get('/company/autocomplete/:text', companySearchController.autocomplete);


module.exports = router;


// TODO: rate limiting thorugh redis