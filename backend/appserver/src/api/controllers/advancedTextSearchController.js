const { buildMongoQueryFromUrlParams } = require('../../utils/urlToMongoQuery')
const dbclient = require('../../services/db');
const llm = require('../../services/llm')
const logger = require('@backend/common/logger');

advancedTextSearch = async (req, res) => {
    try {
        const { search, page = 1, pageSize = 20, searchType, ...filterQuery } = req.query;

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

    } catch (error) {
        logger.error('Error during company search advancedTextSearch:', error);
        res.status(500).json({ 
            message: 'Failed to search companies by advancedTextSearch',
        });
    }
};

module.exports = {
    advancedTextSearch
}