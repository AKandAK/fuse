const logger = require('@backend/common/logger');
const dbclient = require('../../services/db');
const { validationResult } = require('express-validator'); // For input validation
const filtersConfig = require('../../utils/filtersConfig')

async function getCompanyFilters(req, res) {
    try {
        const filters = await filtersConfig.getCompanyFiltersConfig()

        // cache resposne
        res.set('Cache-Control', 'public, max-age=86400'); // Cache for 1 day
        res.json({ 
            filters
        });
    } catch (error) {
        logger.error('Error while fetching getfilters:', error);
        res.status(500).json({ 
            message: 'Failed to fetch getfilters',
        });
    }
};

module.exports = {
    getCompanyFilters,
};